const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const { HttpStatus } = require('../config/constants');

const getCarts = async (req, res) => {
    try {
        const carts = await Cart.find()
            .populate('user')
            .populate('items.product');

        res.status(HttpStatus.OK).json(carts);
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message
        });
    }
};

const getCartById = async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.id)
            .populate('user', 'name email')
            .populate('items.product');

        if (!cart) {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'Cart not found'
            });
        }

        // Only the owner (or an admin) may view a cart
        if (req.user.role !== 'Admin' && !cart.user?._id.equals(req.user._id)) {
            return res.status(HttpStatus.FORBIDDEN).json({
                message: 'You cannot view this cart'
            });
        }

        res.status(HttpStatus.OK).json(cart);
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message
        });
    }
};

const getMyCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        res.status(HttpStatus.OK).json(cart || { user: req.user._id, items: [] });
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message
        });
    }
};

const createCart = async (req, res) => {
    try {
        // The cart always belongs to the logged-in user (ignore any `user` in the body)
        const cart = await Cart.create({ ...req.body, user: req.user._id });

        const populatedCart = await Cart.findById(cart._id)
            .populate('user', 'name email')
            .populate('items.product');

        res.status(HttpStatus.CREATED).json(populatedCart);
    } catch (error) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: error.message
        });
    }
};

const addCartItem = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const parsedQuantity = Number(quantity);

        if (!productId || !Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: 'A valid product and quantity are required'
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'Product not found'
            });
        }

        if (product.stock < parsedQuantity) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: 'There is not enough stock for this product'
            });
        }

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = await Cart.create({
                user: req.user._id,
                items: [{ product: product._id, quantity: parsedQuantity }]
            });
        } else {
            const item = cart.items.find((cartItem) => cartItem.product.equals(product._id));

            if (item) {
                if (product.stock < item.quantity + parsedQuantity) {
                    return res.status(HttpStatus.BAD_REQUEST).json({
                        message: 'There is not enough stock for this product'
                    });
                }

                item.quantity += parsedQuantity;
            } else {
                cart.items.push({ product: product._id, quantity: parsedQuantity });
            }

            await cart.save();
        }

        const populatedCart = await Cart.findById(cart._id)
            .populate('items.product');

        res.status(HttpStatus.OK).json(populatedCart);
    } catch (error) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: error.message
        });
    }
};

module.exports = {
    getCarts,
    getCartById,
    getMyCart,
    createCart,
    addCartItem
};