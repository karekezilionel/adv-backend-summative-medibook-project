const { WORKING_HOURS_START, WORKING_HOURS_END } = require('../config/constants');

const isValidSlot = (dateString) => {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return { valid: false, message: 'Invalid date format.' };

    const now = new Date();
    if (date <= now) return { valid: false, message: 'Appointment must be in the future.' };

    const hours = date.getHours();
    const minutes = date.getMinutes();

    // Check working hours (09:00 to 17:00)
    if (hours < WORKING_HOURS_START || hours >= WORKING_HOURS_END) {
        return { valid: false, message: 'Appointment must be within working hours (09:00 - 17:00).' };
    }

    // Check 30-minute boundary
    if (minutes !== 0 && minutes !== 30) {
        return { valid: false, message: 'Appointment must be on a 30-minute boundary (e.g., 09:00, 09:30).' };
    }

    return { valid: true };
};

module.exports = { isValidSlot };