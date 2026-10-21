const express = require('express');

const router = express.Router();

const {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');

const authentication = require('../middleware/authentication');
const authorization = require('../middleware/authorization');
const {
    createNameDescriptionValidation,
    updateNameDescriptionValidation,
    idParamValidation
} = require('../middleware/validationMiddleware');

router.get('/', getCategories);
router.get('/:id', idParamValidation, getCategoryById);
router.post('/', authentication, authorization('Admin'), createNameDescriptionValidation, createCategory);
router.put('/:id', authentication, authorization('Admin'), updateNameDescriptionValidation, updateCategory);
router.delete('/:id', authentication, authorization('Admin'), idParamValidation, deleteCategory);

module.exports = router;