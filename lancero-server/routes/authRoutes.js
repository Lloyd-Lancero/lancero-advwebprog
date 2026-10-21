const express = require('express');

const router = express.Router();

const { register, login, getMe } = require('../controllers/authController');
const authentication = require('../middleware/authentication');
const { registerValidation, loginValidation } = require('../middleware/validationMiddleware');
const { loginLimiter, registerLimiter, loginThrottle } = require('../middleware/rateLimiterMiddleware');

// Order: rate limit -> validate input -> (login lockout) -> controller
router.post('/register', registerLimiter, registerValidation, register);
router.post('/login', loginLimiter, loginValidation, loginThrottle, login);
router.get('/me', authentication, getMe);

module.exports = router;
