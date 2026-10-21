const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    // unique => automatically indexed (no separate index() call needed)
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    description: {
        type: String,
        required: true,
        trim: true
    }
});

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
module.exports = Category;
