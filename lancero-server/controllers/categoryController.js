const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const { HttpStatus } = require('../config/constants');

const getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(HttpStatus.OK).json(categories);
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message
        });
    }
};

const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'Category not found'
            });
        }

        res.status(HttpStatus.OK).json(category);
    } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message
        });
    }
};

const createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(HttpStatus.CREATED).json(category);
    } catch (error) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: error.message
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!category) {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'Category not found'
            });
        }

        res.status(HttpStatus.OK).json(category);
    } catch (error) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: error.message
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        // Do not delete a category that products still use
        const inUse = await Product.exists({ category: req.params.id });

        if (inUse) {
            return res.status(HttpStatus.CONFLICT).json({
                message: 'Cannot delete a category that still has products'
            });
        }

        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(HttpStatus.NOT_FOUND).json({
                message: 'Category not found'
            });
        }

        res.status(HttpStatus.OK).json({
            message: 'Category deleted successfully',
            category
        });
    } catch (error) {
        res.status(HttpStatus.BAD_REQUEST).json({
            message: error.message
        });
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};