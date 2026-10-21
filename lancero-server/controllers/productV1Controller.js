const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Supplier = require('../models/supplierModel');
const { HttpStatus } = require('../config/constants');
const { sendSuccess, sendError, handleError } = require('../utils/apiResponse');
const { uploadImageBuffer, deleteImage } = require('../utils/imageService');

const MAX_LIMIT = 100;
const SORTABLE_FIELDS = ['name', 'title', 'price', 'stock', 'createdAt'];

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildSort = (sort) => {
    if (!sort) return {};

    const order = sort.startsWith('-') ? -1 : 1;
    const field = sort.replace(/^-/, '');

    return SORTABLE_FIELDS.includes(field) ? { [field]: order } : {};
};

// GET /api/v1/products
// Supports: ?page=1&limit=5&category=Uniform&supplier=Nike&sort=price&search=jacket
const getProducts = async (req, res) => {
    try {
        const { category, supplier, search, sort } = req.query;

        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), MAX_LIMIT);
        const skip = (page - 1) * limit;

        const emptyResult = () => sendSuccess(res, HttpStatus.OK, 'Products retrieved successfully.', [], {
            total: 0,
            page,
            limit,
            totalPages: 0
        });

        const filter = {};

        // Filtering by category name (case-insensitive, exact match)
        if (category) {
            const categoryDoc = await Category.findOne({
                name: { $regex: `^${escapeRegex(category.trim())}$`, $options: 'i' }
            });

            if (!categoryDoc) return emptyResult();
            filter.category = categoryDoc._id;
        }

        // Filtering by supplier name (case-insensitive, exact match)
        if (supplier) {
            const supplierDoc = await Supplier.findOne({
                name: { $regex: `^${escapeRegex(supplier.trim())}$`, $options: 'i' }
            });

            if (!supplierDoc) return emptyResult();
            filter.supplier = supplierDoc._id;
        }

        // Keyword search across name, title and description
        if (search && search.trim()) {
            const searchRegex = { $regex: escapeRegex(search.trim()), $options: 'i' };

            filter.$or = [
                { name: searchRegex },
                { title: searchRegex },
                { content: searchRegex }
            ];
        }

        const total = await Product.countDocuments(filter);

        const products = await Product.find(filter)
            .populate('category')
            .populate('supplier')
            .sort(buildSort(sort))
            .skip(skip)
            .limit(limit);

        // count = number of products in this response, total = all matches
        return sendSuccess(res, HttpStatus.OK, 'Products retrieved successfully.', products, {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        return handleError(res, error);
    }
};

// GET /api/v1/products/:id
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category')
            .populate('supplier');

        if (!product) {
            return sendError(res, HttpStatus.NOT_FOUND, 'Product not found.');
        }

        return sendSuccess(res, HttpStatus.OK, 'Product retrieved successfully.', product);
    } catch (error) {
        return handleError(res, error);
    }
};

// GET /api/v1/products/slug/:name  (readable URL name used by the React app)
const getProductByName = async (req, res) => {
    try {
        const product = await Product.findOne({ name: req.params.name })
            .populate('category')
            .populate('supplier');

        if (!product) {
            return sendError(res, HttpStatus.NOT_FOUND, 'Product not found.');
        }

        return sendSuccess(res, HttpStatus.OK, 'Product retrieved successfully.', product);
    } catch (error) {
        return handleError(res, error);
    }
};

const populateProduct = (query) => query.populate('category').populate('supplier');

// The Cloudinary id is internal: it is never accepted from the client
// (otherwise an admin request could point at someone else's asset) and never returned.
const cleanBody = (body) => {
    const data = { ...body };
    delete data.imagePublicId;
    return data;
};

// POST /api/v1/products   (JSON, or multipart/form-data with an optional "image" file)
const createProduct = async (req, res) => {
    let uploaded = null;

    try {
        const data = cleanBody(req.body);

        if (req.file) {
            uploaded = await uploadImageBuffer(req.file.buffer);
            data.image = uploaded.secure_url;
            data.imagePublicId = uploaded.public_id;
        }

        const product = await Product.create(data);
        const populated = await populateProduct(Product.findById(product._id));

        return sendSuccess(res, HttpStatus.CREATED, 'Product created successfully.', populated);
    } catch (error) {
        // The product was not saved, so do not leave an orphan image in Cloudinary
        if (uploaded) await deleteImage(uploaded.public_id);
        return handleError(res, error);
    }
};

// PUT /api/v1/products/:id   (JSON, or multipart/form-data with an optional "image" file)
const updateProduct = async (req, res) => {
    let uploaded = null;

    try {
        const existing = await Product.findById(req.params.id).select('+imagePublicId');

        if (!existing) {
            return sendError(res, HttpStatus.NOT_FOUND, 'Product not found.');
        }

        const data = cleanBody(req.body);

        if (req.file) {
            uploaded = await uploadImageBuffer(req.file.buffer);
            data.image = uploaded.secure_url;
            data.imagePublicId = uploaded.public_id;
        } else if (data.image !== undefined && data.image !== existing.image) {
            // the admin typed a different image URL by hand: the old Cloudinary asset is no longer used
            data.imagePublicId = '';
        }

        const product = await populateProduct(
            Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true })
        );

        // The new data is saved, so the old image can go (image replacement)
        const imageChanged = data.imagePublicId !== undefined && data.imagePublicId !== existing.imagePublicId;
        if (imageChanged) await deleteImage(existing.imagePublicId);

        return sendSuccess(res, HttpStatus.OK, 'Product updated successfully.', product);
    } catch (error) {
        if (uploaded) await deleteImage(uploaded.public_id);
        return handleError(res, error);
    }
};

// POST /api/v1/products/:id/upload-image   (Activity 6, Part 5 and 6)
// Body: multipart/form-data, field "image". Replaces the current image if there is one.
const uploadProductImage = async (req, res) => {
    let uploaded = null;

    try {
        const existing = await Product.findById(req.params.id).select('+imagePublicId');

        if (!existing) {
            return sendError(res, HttpStatus.NOT_FOUND, 'Product not found.');
        }

        uploaded = await uploadImageBuffer(req.file.buffer);

        const product = await populateProduct(
            Product.findByIdAndUpdate(
                req.params.id,
                { image: uploaded.secure_url, imagePublicId: uploaded.public_id },
                { new: true, runValidators: true }
            )
        );

        await deleteImage(existing.imagePublicId);   // remove the replaced image

        return res.status(HttpStatus.OK).json({
            success: true,
            message: 'Product image uploaded successfully.',
            count: 1,
            imageUrl: uploaded.secure_url,
            publicId: uploaded.public_id,
            data: product
        });
    } catch (error) {
        if (uploaded) await deleteImage(uploaded.public_id);
        return handleError(res, error);
    }
};

// DELETE /api/v1/products/:id/image   (asset management: remove the image only)
const deleteProductImage = async (req, res) => {
    try {
        const existing = await Product.findById(req.params.id).select('+imagePublicId');

        if (!existing) {
            return sendError(res, HttpStatus.NOT_FOUND, 'Product not found.');
        }

        if (!existing.image) {
            return sendError(res, HttpStatus.BAD_REQUEST, 'This product has no image to delete.');
        }

        await deleteImage(existing.imagePublicId);

        const product = await populateProduct(
            Product.findByIdAndUpdate(req.params.id, { image: '', imagePublicId: '' }, { new: true })
        );

        return sendSuccess(res, HttpStatus.OK, 'Product image deleted successfully.', product);
    } catch (error) {
        return handleError(res, error);
    }
};

// DELETE /api/v1/products/:id   (also removes the product's image from Cloudinary)
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id).select('+imagePublicId');

        if (!product) {
            return sendError(res, HttpStatus.NOT_FOUND, 'Product not found.');
        }

        await deleteImage(product.imagePublicId);

        const result = product.toObject();
        delete result.imagePublicId;

        return sendSuccess(res, HttpStatus.OK, 'Product deleted successfully.', result);
    } catch (error) {
        return handleError(res, error);
    }
};

module.exports = {
    getProducts,
    getProductById,
    getProductByName,
    createProduct,
    updateProduct,
    uploadProductImage,
    deleteProductImage,
    deleteProduct
};
