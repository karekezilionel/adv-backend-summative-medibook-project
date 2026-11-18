const Appointment = require('../models/appointmentModel');
const Doctor = require('../models/doctorModel');
const { isValidSlot } = require('../services/validation');
const { calculateRefund } = require('../services/refund');
const { logEvent } = require('../utils/logger');
const queueService = require('../services/queue'); // Imported queue service

const appointmentController = {
    async bookAppointment(req, res, next) {
        try {
            const { patient_id, doctor_id, appointment_datetime } = req.body;

            if (!patient_id || !doctor_id || !appointment_datetime) {
                return res.status(400).json({ error: 'patient_id, doctor_id, and appointment_datetime are required.' });
            }

            const validation = isValidSlot(appointment_datetime);
            if (!validation.valid) {
                return res.status(422).json({ error: validation.message });
            }

            const doctor = await Doctor.findById(doctor_id);
            if (!doctor) {
                return res.status(404).json({ error: 'Doctor not found.' });
            }

            // Try to book
            const appointmentId = await Appointment.createBooking(
                patient_id, 
                doctor_id, 
                appointment_datetime, 
                doctor.consultation_fee
            );

            // Log the successful booking
            await logEvent('BOOKING', {
                appointment_id: appointmentId,
                patient_id: patient_id,
                doctor_id: doctor_id,
                appointment_datetime: appointment_datetime,
                amount_paid: doctor.consultation_fee
            });

            // Enqueue a notification job for the worker process to handle later
            await queueService.enqueueNotification(
                patient_id, 
                appointmentId, 
                `Your appointment with Dr. ${doctor.name} on ${appointment_datetime} is confirmed.`
            );

            res.status(201).json({
                message: 'Appointment booked successfully.',
                appointment_id: appointmentId
            });
        } catch (error) {
            // If booking fails due to conflict or limit, add patient to the Redis waitlist
            if (error.message.startsWith('CONFLICT') || error.message.startsWith('LIMIT_REACHED')) {
                await queueService.addToWaitlist(req.body.patient_id, req.body.doctor_id, req.body.appointment_datetime);
                return res.status(422).json({ 
                    error: 'Slot unavailable. You have been added to the waitlist.',
                    details: error.message
                });
            }
            next(error);
        }
    },

    async cancelAppointment(req, res, next) {
        try {
            const { id } = req.params;

            const appointment = await Appointment.findById(id);
            if (!appointment || appointment.status === 'cancelled') {
                return res.status(404).json({ error: 'Appointment not found or already cancelled.' });
            }

            const refund = calculateRefund(appointment.amount_paid, appointment.appointment_datetime);

            await Appointment.cancelBooking(id, refund.amount);

            // Log the successful cancellation
            await logEvent('CANCELLATION', {
                appointment_id: id,
                refund_percentage: refund.percentage,
                refund_amount: refund.amount
            });

            res.status(200).json({
                message: 'Appointment cancelled successfully.',
                refund_percentage: refund.percentage,
                refund_amount: refund.amount
            });
        } catch (error) {
            next(error);
        }
    },

    async getBusyDays(req, res, next) {
        try {
            const busyDays = await Appointment.getBusyDays();
            res.status(200).json(busyDays);
        } catch (error) {
            next(error);
        }
    },

    async getDoctorStats(req, res, next) {
        try {
            const { doctorId } = req.params;
            const stats = await Appointment.getDoctorStatistics(doctorId);
            res.status(200).json(stats);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = appointmentController;