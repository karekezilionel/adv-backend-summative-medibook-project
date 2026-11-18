const Doctor = require('../models/doctorModel');

const doctorController = {
    async createDoctor(req, res, next) {
        try {
            const { name, specialty, consultation_fee, room } = req.body;
            
            if (!name || !specialty || consultation_fee === undefined || !room) {
                return res.status(400).json({ error: 'Name, specialty, consultation_fee, and room are required.' });
            }
            if (isNaN(consultation_fee) || consultation_fee < 0) {
                return res.status(400).json({ error: 'Consultation fee must be a valid positive number.' });
            }

            const newDoctorId = await Doctor.create(name, specialty, consultation_fee, room);
            
            res.status(201).json({
                message: 'Doctor created successfully',
                doctor_id: newDoctorId
            });
        } catch (error) {
            next(error);
        }
    },

    async getAllDoctors(req, res, next) {
        try {
            const doctors = await Doctor.findAll();
            res.status(200).json(doctors);
        } catch (error) {
            next(error);
        }
    },

    async getDoctorById(req, res, next) {
        try {
            const doctor = await Doctor.findById(req.params.id);
            if (!doctor) {
                return res.status(404).json({ error: 'Doctor not found.' });
            }
            res.status(200).json(doctor);
        } catch (error) {
            next(error);
        }
    },

    async updateDoctor(req, res, next) {
        try {
            const { id } = req.params;
            const { name, specialty, consultation_fee, room } = req.body;

            if (!name || !specialty || consultation_fee === undefined || !room) {
                return res.status(400).json({ error: 'Name, specialty, consultation_fee, and room are required.' });
            }
            if (isNaN(consultation_fee) || consultation_fee < 0) {
                return res.status(400).json({ error: 'Consultation fee must be a valid positive number.' });
            }

            const updatedRows = await Doctor.update(id, name, specialty, consultation_fee, room);
            if (updatedRows === 0) {
                return res.status(404).json({ error: 'Doctor not found.' });
            }

            res.status(200).json({ message: 'Doctor updated successfully.' });
        } catch (error) {
            next(error);
        }
    },

    async deleteDoctor(req, res, next) {
        try {
            const deletedRows = await Doctor.remove(req.params.id);
            if (deletedRows === 0) {
                return res.status(404).json({ error: 'Doctor not found.' });
            }
            res.status(200).json({ message: 'Doctor deleted successfully.' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = doctorController;