const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },

        supplier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Supplier',
            required: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        stock: {
            type: Number,
            required: true,
            min: 0
        },

        availability: {
            type: String,
            enum: ['In stock', 'Low stock', 'Preorder', 'Out of stock'],
            default: 'In stock'
        },

        // Public URL of the product image (Cloudinary secure_url, or a static path for seeded products)
        image: {
            type: String,
            default: ''
        },

        // Cloudinary asset id. Needed to replace or delete the image later.
        // Empty for images that were not uploaded through the API.
        imagePublicId: {
            type: String,
            default: '',
            select: false
        },

        // Embedded: description paragraphs only make sense inside the product
        content: {
            type: [String],
            validate: {
                validator: (value) => Array.isArray(value) && value.length > 0,
                message: 'A product needs at least one content paragraph'
            }
        }
    },
    {
        timestamps: true
    }
);

// Indexes (each one matches a query used in the controllers)
// name: already indexed by `unique: true`, so no extra index is declared.
productSchema.index({ category: 1 });   // filter products by category
productSchema.index({ supplier: 1 });   // filter products by supplier
productSchema.index({ price: 1 });      // sort products by price

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

module.exports = Product;
