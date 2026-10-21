const express = require('express');

const router = express.Router();

const {
    getSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
} = require('../controllers/supplierController');

const authentication = require('../middleware/authentication');
const authorization = require('../middleware/authorization');
const {
    createNameDescriptionValidation,
    updateNameDescriptionValidation,
    idParamValidation
} = require('../middleware/validationMiddleware');

router.get('/', getSuppliers);
router.get('/:id', idParamValidation, getSupplierById);
router.post('/', authentication, authorization('Admin'), createNameDescriptionValidation, createSupplier);
router.put('/:id', authentication, authorization('Admin'), updateNameDescriptionValidation, updateSupplier);
router.delete('/:id', authentication, authorization('Admin'), idParamValidation, deleteSupplier);

module.exports = router;