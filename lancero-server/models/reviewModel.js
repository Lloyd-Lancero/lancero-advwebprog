const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        // Referenced: a product has many reviews
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },

        // Referenced: a user writes many reviews
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
            validate: {
                validator: Number.isInteger,
                message: 'Rating must be a whole number from 1 to 5'
            }
        },

        comment: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

// Index: list a product's reviews, newest first
reviewSchema.index({ product: 1, createdAt: -1 });

// Index + rule: one review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

module.exports = Review;
