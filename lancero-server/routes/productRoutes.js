const express = require('express');

const router = express.Router();

const {
    getProducts,
    getProductById,
    getProductByName,
    createProduct,
    updateProduct,
    uploadProductImage,
    deleteProductImage,
    deleteProduct
} = require('../controllers/productV1Controller');

const authentication = require('../middleware/authentication');
const authorization = require('../middleware/authorization');
const upload = require('../middleware/uploadImageMiddleware');
const { verifyImageContent } = require('../middleware/imageValidationMiddleware');
const {
    createProductValidation,
    updateProductValidation,
    idParamValidation
} = require('../middleware/validationMiddleware');

// Public: browsing products
router.get('/', getProducts);
router.get('/slug/:name', getProductByName);
router.get('/:id', idParamValidation, getProductById);

// Admin only: changing the catalog.
// Order matters: log in + role check FIRST (so strangers cannot make the server
// read a 5 MB upload), then multer reads the file, then we verify the real bytes,
// then the normal field validation, then the controller.
// upload.single('image') ignores plain JSON requests, so old JSON clients keep working.
router.post(
    '/',
    authentication, authorization('Admin'),
    upload.single('image'), verifyImageContent(false),
    createProductValidation, createProduct
);
router.put(
    '/:id',
    authentication, authorization('Admin'),
    upload.single('image'), verifyImageContent(false),
    updateProductValidation, updateProduct
);

// Image only (Activity 6)
router.post(
    '/:id/upload-image',
    authentication, authorization('Admin'),
    idParamValidation,
    upload.single('image'), verifyImageContent(true),
    uploadProductImage
);
router.delete('/:id/image', authentication, authorization('Admin'), idParamValidation, deleteProductImage);

router.delete('/:id', authentication, authorization('Admin'), idParamValidation, deleteProduct);

module.exports = router;
