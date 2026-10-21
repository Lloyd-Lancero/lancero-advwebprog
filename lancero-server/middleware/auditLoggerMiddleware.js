const mongoose = require('mongoose');
const Log = require('../models/logModel');

const writeLog = async (level, message, metadata = {}) => {
    try {
        // Don't queue writes (and wait ~10s) while MongoDB is unreachable
        if (mongoose.connection.readyState !== 1) {
            console.warn(`[audit:${level}] ${message} (database not connected, log skipped)`);
            return;
        }

        await Log.create({ level, message, metadata });
    } catch (error) {
        console.error(`Failed to write ${level} log:`, error.message);
    }
};

const logger = {
    info: (message, metadata) => writeLog('info', message, metadata),
    warn: (message, metadata) => writeLog('warn', message, metadata),
    error: (message, metadata) => writeLog('error', message, metadata)
};

// Routes where we also keep the e-mail that was typed in
// (helps spot someone guessing passwords). The password is NEVER stored.
const AUTH_PATH = /\/(login|register)\/?$/;

// ---------------------------------------------------------------
// auditLoggerMiddleware: logs EVERY request after the response is sent.
//
// What each audit log contains:
//   method, path, ip, userId, username, email, role,
//   statusCode, duration, userAgent
// Level: 2xx/3xx -> info, 4xx -> warn, 5xx -> error
// ---------------------------------------------------------------
const auditLoggerMiddleware = (request, response, next) => {
    const startTime = Date.now();

    // "finish" fires once the response has been fully handed to the client.
    // At this point authentication.js has already run, so request.user is set
    // for logged-in requests (and undefined for public ones).
    response.on('finish', () => {
        const duration = Date.now() - startTime;

        const logData = {
            method: request.method,
            path: request.originalUrl.split('?')[0],
            ip: request.ip || request.socket?.remoteAddress || null,
            userId: request.user?._id || null,
            username: request.user?.name || null,
            email: request.user?.email || null,
            role: request.user?.role || null,
            statusCode: response.statusCode,
            duration: `${duration}ms`,
            userAgent: request.get('user-agent') || null
        };

        if (AUTH_PATH.test(logData.path) && typeof request.body?.email === 'string') {
            logData.attemptedEmail = request.body.email;
        }

        const message = `${logData.method} ${logData.path} - ${logData.statusCode}`;

        if (response.statusCode >= 500) {
            logger.error(message, logData);
        } else if (response.statusCode >= 400) {
            logger.warn(message, logData);
        } else {
            logger.info(message, logData);
        }
    });

    next();
};

module.exports = { logger, auditLoggerMiddleware };
