const Supplier = require('../models/supplierModel');
const Product = require('../models/productModel');
const { HttpStatus } = require('../config/constants');

const getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find();

        res.status(HttpStatus.OK).json(suppliers);
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message
        });
    }
};

const getSupplierById = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);

        if (!supplier) {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'Supplier not found'
            });
        }

        res.status(HttpStatus.OK).json(supplier);
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message
        });
    }
};

const createSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.create(req.body);

        res.status(HttpStatus.CREATED).json(supplier);
    } catch (error) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: error.message
        });
    }
};

const updateSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!supplier) {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'Supplier not found'
            });
        }

        res.status(HttpStatus.OK).json(supplier);
    } catch (error) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: error.message
        });
    }
};

const deleteSupplier = async (req, res) => {
    try {
        // Do not delete a supplier that products still use
        const inUse = await Product.exists({ supplier: req.params.id });

        if (inUse) {
            return res.status(HttpStatus.CONFLICT).json({
                message: 'Cannot delete a supplier that still has products'
            });
        }

        const supplier = await Supplier.findByIdAndDelete(req.params.id);

        if (!supplier) {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'Supplier not found'
            });
        }

        res.status(HttpStatus.OK).json({
            message: 'Supplier deleted successfully',
            supplier
        });
    } catch (error) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: error.message
        });
    }
};

module.exports = {
    getSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
};