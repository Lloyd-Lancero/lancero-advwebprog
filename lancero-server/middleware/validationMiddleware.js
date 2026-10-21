const { body, param, validationResult } = require('express-validator');
const { HttpStatus } = require('../config/constants');

const ROLES = ['Customer', 'Admin'];
const AVAILABILITY = ['In stock', 'Low stock', 'Preorder', 'Out of stock'];
const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'ready_for_claiming', 'shipped', 'delivered', 'cancelled'];

const handleValidation = (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
        const errors = result.array().map((error) => ({
            field: error.path,
            message: error.msg
        }));

        return res.status(HttpStatus.BAD_REQUEST).json({
            success: false,
            message: errors[0].message,
            count: 0,
            data: null,
            errors
        });
    }

    next();
};

// ---------- reusable field rules (based on userModel.js) ----------
// `required` = true  -> field must be present (register / create)
// `required` = false -> field is optional, but if sent it must be valid (update)
const optionalIf = (chain, required) => (required ? chain : chain.optional());

const nameRule = (required = true) =>
    optionalIf(body('name'), required)
        .isString().withMessage('Name must be a string').bail()
        .trim()
        .isLength({ min: 2, max: 60 }).withMessage('Name must be between 2 and 60 characters long');

const emailRule = (required = true) =>
    optionalIf(body('email'), required)
        .isString().withMessage('Email must be a string').bail()
        .trim()
        .isEmail().withMessage('Invalid email address')
        .toLowerCase();

// max 72 because bcrypt ignores everything after 72 bytes
const passwordRule = (field = 'password', label = 'Password') =>
    body(field)
        .isString().withMessage(`${label} must be a string`).bail()
        .isLength({ min: 6, max: 72 }).withMessage(`${label} must be between 6 and 72 characters long`);

const roleRule = () =>
    body('role').optional()
        .isIn(ROLES).withMessage(`Role must be one of: ${ROLES.join(', ')}`);

const mongoIdParam = (field = 'id') =>
    param(field).isMongoId().withMessage(`Invalid ${field}`);

const mongoIdBody = (field, required = true) =>
    optionalIf(body(field), required)
        .isMongoId().withMessage(`${field} must be a valid id`);

// ================================================================
// USERS  (Parts 5 and 6)
// ================================================================

// POST /api/auth/register, POST /api/user/register  (public sign-up)
// `role` is intentionally not accepted here: the controller forces 'Customer'.
const registerValidation = [
    nameRule(),
    emailRule(),
    passwordRule(),
    handleValidation
];

// POST /api/auth/login, POST /api/user/login
// Only checks the shape. Password length is NOT re-checked on login so that
// we never reveal the password rules to someone guessing credentials.
const loginValidation = [
    body('email')
        .isString().withMessage('Email must be a string').bail()
        .trim()
        .isEmail().withMessage('Invalid email address')
        .toLowerCase(),
    body('password')
        .isString().withMessage('Password must be a string').bail()
        .notEmpty().withMessage('Password is required'),
    handleValidation
];

// POST /api/user  (admin creates a user)
const createUserValidation = [
    nameRule(),
    emailRule(),
    passwordRule(),
    roleRule(),
    body('isActive').optional().isBoolean({ strict: true }).withMessage('isActive must be true or false'),
    handleValidation
];

// PUT /api/user/:id
const updateUserValidation = [
    mongoIdParam('id'),
    nameRule(false),
    emailRule(false),
    roleRule(),
    handleValidation
];

// PUT /api/user/me/profile
const updateProfileValidation = [
    nameRule(false),
    emailRule(false),
    handleValidation
];

// PUT /api/user/me/password
const changePasswordValidation = [
    body('currentPassword')
        .isString().withMessage('Current password must be a string').bail()
        .notEmpty().withMessage('Current password is required'),
    passwordRule('newPassword', 'New password'),
    body('newPassword')
        .custom((value, { req }) => value !== req.body.currentPassword)
        .withMessage('New password must be different from the current password'),
    handleValidation
];

// PATCH /api/user/:id/active
const setActiveValidation = [
    mongoIdParam('id'),
    body('isActive').isBoolean({ strict: true }).withMessage('isActive must be true or false'),
    handleValidation
];

// GET/DELETE /api/user/:id, GET/DELETE /api/<anything>/:id
const idParamValidation = [mongoIdParam('id'), handleValidation];

// ================================================================
// PRODUCTS / CATEGORIES / SUPPLIERS  (Part 9 - enhancement)
// ================================================================
const productRules = (required) => [
    optionalIf(body('name'), required)
        .isString().withMessage('Name must be a string').bail()
        .trim()
        .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Name must be a lowercase slug such as "campus-tote-bag"'),
    optionalIf(body('title'), required)
        .isString().withMessage('Title must be a string').bail()
        .trim()
        .isLength({ min: 2, max: 120 }).withMessage('Title must be between 2 and 120 characters long'),
    mongoIdBody('category', required),
    mongoIdBody('supplier', required),
    optionalIf(body('price'), required)
        .isFloat({ min: 0 }).withMessage('Price must be a number that is 0 or more').toFloat(),
    optionalIf(body('stock'), required)
        .isInt({ min: 0 }).withMessage('Stock must be a whole number that is 0 or more').toInt(),
    body('availability').optional()
        .isIn(AVAILABILITY).withMessage(`Availability must be one of: ${AVAILABILITY.join(', ')}`),
    body('image').optional()
        .isString().withMessage('Image must be a string').bail(),
    optionalIf(body('content'), required)
        .isArray({ min: 1 }).withMessage('Content must be a non-empty list of paragraphs'),
    body('content.*')
        .isString().withMessage('Each content paragraph must be a string').bail()
        .trim()
        .notEmpty().withMessage('Content paragraphs cannot be empty')
];

const createProductValidation = [...productRules(true), handleValidation];
const updateProductValidation = [mongoIdParam('id'), ...productRules(false), handleValidation];

const nameDescriptionRules = (required) => [
    optionalIf(body('name'), required)
        .isString().withMessage('Name must be a string').bail()
        .trim()
        .isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters long'),
    optionalIf(body('description'), required)
        .isString().withMessage('Description must be a string').bail()
        .trim()
        .isLength({ min: 2, max: 500 }).withMessage('Description must be between 2 and 500 characters long')
];

// shared by /api/category and /api/supplier (same fields)
const createNameDescriptionValidation = [...nameDescriptionRules(true), handleValidation];
const updateNameDescriptionValidation = [mongoIdParam('id'), ...nameDescriptionRules(false), handleValidation];

// ================================================================
// REVIEWS / CART / ORDERS  (Part 9 - enhancement)
// ================================================================
const reviewRatingRule = (required) =>
    optionalIf(body('rating'), required)
        .isInt({ min: 1, max: 5 }).withMessage('Rating must be a whole number from 1 to 5').toInt();

const reviewCommentRule = (required) =>
    optionalIf(body('comment'), required)
        .isString().withMessage('Comment must be a string').bail()
        .trim()
        .isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters long');

const createReviewValidation = [mongoIdBody('product'), reviewRatingRule(true), reviewCommentRule(true), handleValidation];
const updateReviewValidation = [mongoIdParam('id'), reviewRatingRule(false), reviewCommentRule(false), handleValidation];
const productIdParamValidation = [mongoIdParam('productId'), handleValidation];

const addCartItemValidation = [
    mongoIdBody('productId'),
    body('quantity').optional()
        .isInt({ min: 1, max: 99 }).withMessage('Quantity must be a whole number from 1 to 99').toInt(),
    handleValidation
];

const updateOrderStatusValidation = [
    mongoIdParam('id'),
    body('status')
        .isIn(ORDER_STATUSES).withMessage(`Status must be one of: ${ORDER_STATUSES.join(', ')}`),
    handleValidation
];

module.exports = {
    handleValidation,
    // users
    registerValidation,
    loginValidation,
    createUserValidation,
    updateUserValidation,
    updateProfileValidation,
    changePasswordValidation,
    setActiveValidation,
    idParamValidation,
    // products / categories / suppliers
    createProductValidation,
    updateProductValidation,
    createNameDescriptionValidation,
    updateNameDescriptionValidation,
    // reviews / cart / orders
    createReviewValidation,
    updateReviewValidation,
    productIdParamValidation,
    addCartItemValidation,
    updateOrderStatusValidation
};
