const redisClient = require('../config/redis');

const QUEUE_NAME = 'notifications_queue';
const WAITLIST_NAME = 'waitlist_queue';

const queueService = {
    // Push a notification job (for the worker to process)
    async enqueueNotification(patient_id, appointment_id, message) {
        const job = JSON.stringify({ patient_id, appointment_id, message });
        await redisClient.lPush(QUEUE_NAME, job);
    },

    // Push a patient to the waitlist for a specific slot
    async addToWaitlist(patient_id, doctor_id, appointment_datetime) {
        const waitlistItem = JSON.stringify({ patient_id, doctor_id, appointment_datetime });
        await redisClient.rPush(WAITLIST_NAME, waitlistItem);
    }
};

module.exports = queueService;