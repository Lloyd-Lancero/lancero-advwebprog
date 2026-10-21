const User = require('../models/userModel');
const { HttpStatus } = require('../config/constants');
const { register, login } = require('./userController');

// register and login now live in userController.js (per the activity's
// requirement that they sit "inside your UserController"). Re-exported
// here so the existing /api/auth/register and /api/auth/login routes
// (already used by the frontend) keep working without duplicating logic.

// @route  GET /api/auth/me
// Returns the currently logged-in user (requires the `protect` middleware)
const getMe = async (req, res) => {
    try {
        res.status(HttpStatus.OK).json({
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            isActive: req.user.isActive,
            createdAt: req.user.createdAt
        });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message
        });
    }
};

module.exports = {
    register,
    login,
    getMe
};