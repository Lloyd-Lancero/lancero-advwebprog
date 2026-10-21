const express = require('express');

const router = express.Router();

const {
    register,
    login,
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    setUserActiveStatus,
    changePassword,
    updateMyProfile
} = require('../controllers/userController');

const authentication = require('../middleware/authentication');
const authorization = require('../middleware/authorization');
const {
    registerValidation,
    loginValidation,
    createUserValidation,
    updateUserValidation,
    updateProfileValidation,
    changePasswordValidation,
    setActiveValidation,
    idParamValidation
} = require('../middleware/validationMiddleware');
const {
    loginLimiter,
    registerLimiter,
    passwordLimiter,
    loginThrottle
} = require('../middleware/rateLimiterMiddleware');

// Public: registration and login
router.post('/register', registerLimiter, registerValidation, register);
router.post('/login', loginLimiter, loginValidation, loginThrottle, login);

// Logged-in user managing their own profile
router.put('/me/profile', authentication, updateProfileValidation, updateMyProfile);
router.put('/me/password', authentication, passwordLimiter, changePasswordValidation, changePassword);

// Admin-only user management
router.get('/', authentication, authorization('Admin'), getUsers);
router.get('/:id', authentication, authorization('Admin'), idParamValidation, getUserById);
router.post('/', authentication, authorization('Admin'), createUserValidation, createUser);

// Self-or-admin: ownership is checked inside the controller
router.put('/:id', authentication, updateUserValidation, updateUser);

router.patch('/:id/active', authentication, authorization('Admin'), setActiveValidation, setUserActiveStatus);
router.delete('/:id', authentication, authorization('Admin'), idParamValidation, deleteUser);

module.exports = router;