const mongoose = require('mongoose');
const { HttpStatus } = require('../config/constants');

// Every Product API response uses this one JSON structure:
// { success, message, count, data }  (+ pagination details for lists)
const sendSuccess = (res, status, message, data, extra = {}) => {
    const count = Array.isArray(data) ? data.length : data ? 1 : 0;

    return res.status(status).json({
        success: true,
        message,
        count,
        ...extra,
        data
    });
};

const sendError = (res, status, message) => {
    return res.status(status).json({
        success: false,
        message,
        count: 0,
        data: null
    });
};

// Turns Mongoose errors into the right HTTP status:
// bad id / failed validation -> 400, duplicate key -> 409, anything else -> 500
const handleError = (res, error) => {
    if (error instanceof mongoose.Error.CastError) {
        return sendError(res, HttpStatus.BAD_REQUEST, `Invalid ${error.path}: ${error.value}`);
    }

    if (error instanceof mongoose.Error.ValidationError) {
        return sendError(res, HttpStatus.BAD_REQUEST, error.message);
    }

    if (error.code === 11000) {
        const field = Object.keys(error.keyValue || {})[0] || 'value';
        return sendError(res, HttpStatus.CONFLICT, `A record with that ${field} already exists.`);
    }

    return sendError(res, HttpStatus.INTERNAL_SERVER_ERROR, error.message);
};

module.exports = { sendSuccess, sendError, handleError };
