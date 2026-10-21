const { HttpStatus } = require('../config/constants');

// Unknown route -> JSON 404 (instead of Express's default HTML page)
const notFound = (req, res) => {
    res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        count: 0,
        data: null
    });
};

// ---------------------------------------------------------------
// Central error handler. Anything passed to next(err), or thrown by
// a middleware, ends up here and is answered in the standard structure:
// { success, message, count, data }
// Must be registered LAST in server.js and must have 4 parameters.
// ---------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    let status = err.status || err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
    let message = err.message || 'Server error';

    if (err.type === 'entity.parse.failed') {              // malformed JSON body
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid JSON in request body';
    } else if (err.type === 'entity.too.large') {          // body bigger than the limit
        status = 413;
        message = 'Request body is too large';
    } else if (err.name === 'MulterError') {               // thrown by the image upload middleware
        status = err.code === 'LIMIT_FILE_SIZE' ? 413 : HttpStatus.BAD_REQUEST;
        const multerMessages = {
            LIMIT_FILE_SIZE: 'Image is too large. The maximum size is 5 MB.',
            LIMIT_FILE_COUNT: 'Only one image can be uploaded at a time.',
            LIMIT_UNEXPECTED_FILE: 'Unexpected file field. Send the image in the "image" field.'
        };
        message = multerMessages[err.code] || `Upload error: ${err.message}`;
    } else if (err.code === 'CORS_NOT_ALLOWED') {          // thrown by the CORS config
        status = HttpStatus.FORBIDDEN;
        message = 'This origin is not allowed by CORS';
    }

    if (status >= 500) {
        console.error(err);
        // Do not leak internal details to the client in production
        if (process.env.NODE_ENV === 'production') {
            message = 'Server error';
        }
    }

    if (res.headersSent) {
        return next(err);
    }

    res.status(status).json({
        success: false,
        message,
        count: 0,
        data: null
    });
};

module.exports = { notFound, errorHandler };
