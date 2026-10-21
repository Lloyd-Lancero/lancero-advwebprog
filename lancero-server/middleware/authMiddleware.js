const authenticate = require('./authentication');
const authorizeRoles = require('./authorization');

// protect is just an alias for the authentication module (middleware/authentication.js).
// authorize is just an alias for the authorization module (middleware/authorization.js).
// Both are kept here so any older code that imports { protect, authorize }
// from authMiddleware.js still works.
const protect = authenticate;
const authorize = authorizeRoles;

module.exports = {
    protect,
    authorize
};