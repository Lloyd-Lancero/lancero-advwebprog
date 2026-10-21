const Review = require('../models/reviewModel');
const { HttpStatus } = require('../config/constants');

const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('product')
            .populate('user');

        res.status(HttpStatus.OK).json(reviews);
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message
        });
    }
};

const getReviewById = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate('product')
            .populate('user', 'name');

        if (!review) {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'Review not found'
            });
        }

        res.status(HttpStatus.OK).json(review);
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message
        });
    }
};

const createReview = async (req, res) => {
    try {
        const review = await Review.create({ ...req.body, user: req.user._id });

        const populatedReview = await Review.findById(review._id)
            .populate('product')
            .populate('user', 'name');

        res.status(HttpStatus.CREATED).json(populatedReview);
    } catch (error) {
        // 11000 = duplicate key: this user already reviewed this product
        if (error.code === 11000) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                message: 'You have already reviewed this product'
            });
        }

        res.status(HttpStatus.BAD_REQUEST).json({
            message: error.message
        });
    }
};

const updateReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { rating: req.body.rating, comment: req.body.comment },
            { new: true, runValidators: true }
        ).populate('product').populate('user');

        if (!review) {
            return res.status(HttpStatus.NOT_FOUND).json({ message: 'Review not found' });
        }

        res.status(HttpStatus.OK).json(review);
    } catch (error) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
};

const getReviewsByProduct = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        res.status(HttpStatus.OK).json(reviews);
    } catch (error) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: error.message
        });
    }
};

module.exports = {
    getReviews,
    getReviewById,
    getReviewsByProduct,
    updateReview,
    createReview
};