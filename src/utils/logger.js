const fs = require('fs').promises;
const path = require('path');

const logDir = path.join(__dirname, '../../logs');
const logFile = path.join(logDir, 'audit.log');

const logEvent = async (eventType, data) => {
    try {
        // 1. Ensure the logs directory exists
        await fs.mkdir(logDir, { recursive: true });

        // 2. Create the JSON line
        const logEntry = JSON.stringify({
            timestamp: new Date().toISOString(),
            event: eventType,
            ...data
        }) + '\n';

        // 3. Append to the file asynchronously
        await fs.appendFile(logFile, logEntry, 'utf8');
        
    } catch (error) {
        // 4. Logging failure must NEVER fail the user's request
        console.error('Failed to write to audit log:', error);
    }
};

module.exports = { logEvent };