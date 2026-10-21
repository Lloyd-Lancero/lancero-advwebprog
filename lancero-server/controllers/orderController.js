const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const { HttpStatus } = require('../config/constants');

const getOrders = async (req, res) => {
    try {
        const orders = await Order.find(req.user.role === 'Admin' ? {} : { user: req.user._id })
            .populate('user', 'name email')
            .populate('items.product');

        res.status(HttpStatus.OK).json(orders);
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message
        });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('items.product');

        if (!order) {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'Order not found'
            });
        }

        if (req.user.role !== 'Admin' && !order.user?._id.equals(req.user._id)) {
            return res.status(HttpStatus.FORBIDDEN).json({ message: 'You cannot view this order' });
        }

        res.status(HttpStatus.OK).json(order);
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message
        });
    }
};

const createOrder = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Your cart is empty' });
        }

        for (const item of cart.items) {
            if (!item.product || item.product.stock < item.quantity) {
                return res.status(HttpStatus.BAD_REQUEST).json({ message: `Not enough stock for ${item.product?.title || 'a product'}` });
            }
        }

        const items = cart.items.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.price
        }));
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
        }

        const order = await Order.create({
            user: req.user._id,
            items,
            total,
            status: 'processing'
        });
        cart.items = [];
        await cart.save();

        const populatedOrder = await Order.findById(order._id)
            .populate('user', 'name email')
            .populate('items.product');

        res.status(HttpStatus.CREATED).json(populatedOrder);
    } catch (error) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: error.message
        });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const allowedStatuses = ['pending', 'confirmed', 'processing', 'ready_for_claiming', 'shipped', 'delivered', 'cancelled'];
        if (!allowedStatuses.includes(req.body.status)) {
            return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid order status' });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true, runValidators: true }
        ).populate('user', 'name email').populate('items.product');

        if (!order) {
            return res.status(HttpStatus.NOT_FOUND).json({ message: 'Order not found' });
        }

        res.status(HttpStatus.OK).json(order);
    } catch (error) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
};

module.exports = {
    getOrders,
    getOrderById,
    createOrder,
    updateOrderStatus
};