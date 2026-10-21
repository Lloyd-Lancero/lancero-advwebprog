const express = require('express');

const router = express.Router();

const {
    getCarts,
    getCartById,
    getMyCart,
    createCart,
    addCartItem
} = require('../controllers/cartController');

const authentication = require('../middleware/authentication');
const authorization = require('../middleware/authorization');
const { addCartItemValidation, idParamValidation } = require('../middleware/validationMiddleware');

// Carts belong to a logged-in customer
router.get('/', authentication, authorization('Admin'), getCarts);
router.get('/me', authentication, getMyCart);
router.get('/:id', authentication, idParamValidation, getCartById);
router.post('/', authentication, createCart);
router.post('/items', authentication, addCartItemValidation, addCartItem);

module.exports = router;