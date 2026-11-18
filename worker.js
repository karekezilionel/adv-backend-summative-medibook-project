const express = require('express');
const app = express();

// Load Redis on startup so it connects
require('./src/config/redis');

// Middleware to parse JSON bodies
app.use(express.json());

// Import routes and controllers
const patientRoutes = require('./src/routes/patientRoutes');
const doctorRoutes = require('./src/routes/doctorRoutes');
const appointmentRoutes = require('./src/routes/appointmentRoutes');
const feedbackController = require('./src/controllers/feedbackController');

// Mount routes
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);

// Part G: i18n Feedback Page
app.get('/feedback', feedbackController.getFeedbackPage);

// 404 Handler for unknown routes
app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});

// Central Error Handling Middleware (Required by rubric)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;