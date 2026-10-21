const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
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

const Supplier = mongoose.models.Supplier || mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;
