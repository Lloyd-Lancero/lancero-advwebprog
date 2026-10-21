const express = require('express');

const router = express.Router();

const {
    getReviews,
    getReviewById,
    getReviewsByProduct,
    createReview,
    updateReview
} = require('../controllers/reviewController');

const authentication = require('../middleware/authentication');
const authorization = require('../middleware/authorization');
const {
    createReviewValidation,
    updateReviewValidation,
    productIdParamValidation,
    idParamValidation
} = require('../middleware/validationMiddleware');
const { reviewLimiter } = require('../middleware/rateLimiterMiddleware');

router.get('/', authentication, authorization('Admin'), getReviews);
router.get('/product/:productId', productIdParamValidation, getReviewsByProduct);
router.get('/:id', idParamValidation, getReviewById);
router.post('/', authentication, reviewLimiter, createReviewValidation, createReview);
router.put('/:id', authentication, authorization('Admin'), updateReviewValidation, updateReview);

module.exports = router;