const mongoose = require('mongoose');

// Embedded: the items of an order are a snapshot taken at purchase time.
// `price` is copied from the product so old orders keep their original price.
const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },

    quantity: {
        type: Number,
        required: true,
        min: 1
    },

    price: {
        type: Number,
        required: true,
        min: 0
    }
});

const orderSchema = new mongoose.Schema(
    {
        // Referenced: every order belongs to a user
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        items: {
            type: [orderItemSchema],
            validate: {
                validator: (value) => Array.isArray(value) && value.length > 0,
                message: 'An order needs at least one item'
            }
        },

        // Always computed from the items (see the pre-validate hook below)
        total: {
            type: Number,
            min: 0
        },

        status: {
            type: String,
            enum: ['pending', 'confirmed', 'processing', 'ready_for_claiming', 'shipped', 'delivered', 'cancelled'],
            default: 'pending'
        }
    },
    {
        timestamps: true
    }
);

// Keep `total` consistent with the items so it can never be wrong
orderSchema.pre('validate', function () {
    this.total = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

// Index: "show me this user's orders, newest first"
orderSchema.index({ user: 1, createdAt: -1 });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

module.exports = Order;
