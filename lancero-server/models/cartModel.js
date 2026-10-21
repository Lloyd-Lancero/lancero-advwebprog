const mongoose = require('mongoose');

// Embedded: a cart item has no meaning outside its cart
const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },

    quantity: {
        type: Number,
        required: true,
        min: 1
    }
});

const cartSchema = new mongoose.Schema(
    {
        // Referenced: every cart belongs to exactly one user,
        // and each user has at most one cart (unique => also indexed)
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },

        items: {
            type: [cartItemSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);

const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

module.exports = Cart;
