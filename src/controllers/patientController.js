const Patient = require('../models/patientModel');

const patientController = {
    async createPatient(req, res, next) {
        try {
            const { name, email, phone } = req.body;
            
            // Validation
            if (!name || !email || !phone) {
                return res.status(400).json({ error: 'Name, email, and phone are required.' });
            }
            if (!email.includes('@')) {
                return res.status(400).json({ error: 'Invalid email format.' });
            }

            const newPatientId = await Patient.create(name, email, phone);
            
            res.status(201).json({
                message: 'Patient created successfully',
                patient_id: newPatientId
            });
        } catch (error) {
            // Handle duplicate email error from MySQL
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'Email already exists.' });
            }
            next(error);
        }
    },

    async getAllPatients(req, res, next) {
        try {
            const patients = await Patient.findAll();
            res.status(200).json(patients);
        } catch (error) {
            next(error);
        }
    },

    async getPatientById(req, res, next) {
        try {
            const patient = await Patient.findById(req.params.id);
            if (!patient) {
                return res.status(404).json({ error: 'Patient not found.' });
            }
            res.status(200).json(patient);
        } catch (error) {
            next(error);
        }
    },

    async updatePatient(req, res, next) {
        try {
            const { id } = req.params;
            const { name, email, phone } = req.body;

            if (!name || !email || !phone) {
                return res.status(400).json({ error: 'Name, email, and phone are required.' });
            }

            const updatedRows = await Patient.update(id, name, email, phone);
            if (updatedRows === 0) {
                return res.status(404).json({ error: 'Patient not found.' });
            }

            res.status(200).json({ message: 'Patient updated successfully.' });
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: 'Email already in use by another patient.' });
            }
            next(error);
        }
    },

    async deletePatient(req, res, next) {
        try {
            const deletedRows = await Patient.remove(req.params.id);
            if (deletedRows === 0) {
                return res.status(404).json({ error: 'Patient not found.' });
            }
            res.status(200).json({ message: 'Patient deleted successfully.' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = patientController;