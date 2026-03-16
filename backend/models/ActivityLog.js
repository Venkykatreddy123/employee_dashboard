const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
    userId: { type: Number, required: true },
    action: { type: String, required: true },
    details: { type: Object },
    timestamp: { type: Date, default: Date.now },
    role: { type: String },
    ipAddress: { type: String }
});

const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);

// Mock the create method to avoid crashes if not connected
const originalCreate = ActivityLog.create;
ActivityLog.create = async function(data) {
    if (mongoose.connection.readyState !== 1) {
        console.log('[MOCK LOGGING]', data);
        return data;
    }
    try {
        return await originalCreate.call(ActivityLog, data);
    } catch (err) {
        console.warn('Logging failed:', err.message);
        return data;
    }
};

module.exports = ActivityLog;
