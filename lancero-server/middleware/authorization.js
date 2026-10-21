const { HttpStatus } = require('../config/constants');

module.exports = (...roles) => {
    return async (request, response, next) => {
        try {
            if (!roles.includes(request.user.role)) {
                return response.status(HttpStatus.FORBIDDEN).json({
                    success: false,
                    message: 'Access denied',
                    count: 0,
                    data: null
                });
            }
            next();
        } catch (error) {
            response.status(HttpStatus.FORBIDDEN).json({
                success: false,
                message: 'Access denied',
                count: 0,
                data: null
            });
        }
    };
};