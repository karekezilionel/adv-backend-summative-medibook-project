const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// Business endpoints
router.post('/book', appointmentController.bookAppointment);
router.post('/:id/cancel', appointmentController.cancelAppointment);

// Reports and Stats (must be above /:id routes to avoid conflicts)
router.get('/reports/busy-days', appointmentController.getBusyDays);
router.get('/stats/:doctorId', appointmentController.getDoctorStats);

module.exports = router;