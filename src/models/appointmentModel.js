const db = require('../config/db');
const { MAX_APPOINTMENTS_PER_DAY } = require('../config/constants');

const Appointment = {
    async createBooking(patient_id, doctor_id, appointment_datetime, amount_paid) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Check for double booking (Concurrency Control)
            const [existing] = await connection.execute(
                'SELECT appointment_id FROM appointments WHERE doctor_id = ? AND appointment_datetime = ? AND status = "booked" FOR UPDATE',
                [doctor_id, appointment_datetime]
            );

            if (existing.length > 0) {
                throw new Error('CONFLICT: Slot already booked.');
            }

            // 2. Check the 12-appointments-per-day limit
            const [dailyCount] = await connection.execute(
                'SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND DATE(appointment_datetime) = DATE(?) AND status = "booked"',
                [doctor_id, appointment_datetime]
            );

            if (dailyCount[0].count >= MAX_APPOINTMENTS_PER_DAY) {
                throw new Error('LIMIT_REACHED: Doctor has reached the maximum 12 appointments for this day.');
            }

            // 3. Insert the new appointment
            const [result] = await connection.execute(
                'INSERT INTO appointments (patient_id, doctor_id, appointment_datetime, amount_paid) VALUES (?, ?, ?, ?)',
                [patient_id, doctor_id, appointment_datetime, amount_paid]
            );

            await connection.commit();
            return result.insertId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    async cancelBooking(appointment_id, refund_amount) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const query = `
                UPDATE appointments 
                SET status = 'cancelled', refund_amount = ?, cancelled_at = CURRENT_TIMESTAMP 
                WHERE appointment_id = ? AND status = 'booked'
            `;
            const [result] = await connection.execute(query, [refund_amount, appointment_id]);

            if (result.affectedRows === 0) {
                throw new Error('NOT_FOUND: Appointment not found or already cancelled.');
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    async findById(id) {
        const [rows] = await db.execute('SELECT * FROM appointments WHERE appointment_id = ?', [id]);
        return rows[0];
    },

    async getBusyDays() {
        const query = `
            SELECT 
                d.name AS doctor_name,
                DATE(a.appointment_datetime) AS appointment_date,
                COUNT(a.appointment_id) AS total_booked,
                (COUNT(a.appointment_id) / 12.0) * 100 AS utilization_percentage
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.doctor_id
            WHERE a.status = 'booked'
            GROUP BY d.doctor_id, d.name, DATE(a.appointment_datetime)
            HAVING total_booked > (12 * 0.8)
            ORDER BY appointment_date ASC;
        `;
        const [rows] = await db.execute(query);
        return rows;
    },

    async getDoctorStatistics(doctor_id) {
        const queryRevenue = `
            SELECT COALESCE(SUM(amount_paid), 0) AS total_revenue 
            FROM appointments 
            WHERE doctor_id = ? AND status = 'booked'
        `;
        
        const queryUpcoming = `
            SELECT COUNT(*) AS upcoming_count 
            FROM appointments 
            WHERE doctor_id = ? AND status = 'booked' AND appointment_datetime > NOW()
        `;

        const queryNext7Days = `
            SELECT DATE(appointment_datetime) AS date, COUNT(*) AS count 
            FROM appointments 
            WHERE doctor_id = ? AND status = 'booked' 
            AND appointment_datetime >= CURDATE() 
            AND appointment_datetime <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DATE(appointment_datetime)
            ORDER BY date ASC
        `;

        const [revenueRows] = await db.execute(queryRevenue, [doctor_id]);
        const [upcomingRows] = await db.execute(queryUpcoming, [doctor_id]);
        const [next7DaysRows] = await db.execute(queryNext7Days, [doctor_id]);

        const today = new Date().toISOString().split('T')[0];
        const todayStat = next7DaysRows.find(row => row.date.toISOString().split('T')[0] === today);
        const todayCount = todayStat ? todayStat.count : 0;
        const utilizationPercentage = (todayCount / 12) * 100;

        return {
            total_revenue: revenueRows[0].total_revenue,
            upcoming_appointments: upcomingRows[0].upcoming_count,
            next_7_days: next7DaysRows,
            today_utilization_percentage: utilizationPercentage.toFixed(2)
        };
    }
};

module.exports = Appointment;