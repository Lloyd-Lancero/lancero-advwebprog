const mongoose = require('mongoose');

// One document per audit-log entry (written by middleware/auditLoggerMiddleware.js)
const logSchema = new mongoose.Schema(
    {
        level: {
            type: String,
            enum: ['info', 'warn', 'error'],
            default: 'info'
        },

        message: {
            type: String,
            required: true
        },

        // method, path, ip, userId, username, role, statusCode, duration, ...
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    {
        timestamps: true
    }
);

// Index: show the newest logs first / filter by level
logSchema.index({ createdAt: -1 });
logSchema.index({ level: 1, createdAt: -1 });

const Log = mongoose.models.Log || mongoose.model('Log', logSchema);

module.exports = Log;
