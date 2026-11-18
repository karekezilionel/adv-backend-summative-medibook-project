const db = require('../config/db');

const Doctor = {
    async create(name, specialty, consultation_fee, room) {
        const query = 'INSERT INTO doctors (name, specialty, consultation_fee, room) VALUES (?, ?, ?, ?)';
        const [result] = await db.execute(query, [name, specialty, consultation_fee, room]);
        return result.insertId;
    },

    async findAll() {
        const [rows] = await db.execute('SELECT * FROM doctors');
        return rows;
    },

    async findById(id) {
        const [rows] = await db.execute('SELECT * FROM doctors WHERE doctor_id = ?', [id]);
        return rows[0];
    },

    async update(id, name, specialty, consultation_fee, room) {
        const query = 'UPDATE doctors SET name = ?, specialty = ?, consultation_fee = ?, room = ? WHERE doctor_id = ?';
        const [result] = await db.execute(query, [name, specialty, consultation_fee, room, id]);
        return result.affectedRows;
    },

    async remove(id) {
        const [result] = await db.execute('DELETE FROM doctors WHERE doctor_id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = Doctor;