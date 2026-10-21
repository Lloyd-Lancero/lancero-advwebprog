const { HttpStatus } = require('../config/constants');

const detectImageType = (buffer) => {
    if (!buffer || buffer.length < 12) return null;

    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
        return 'image/jpeg';
    }

    const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    if (pngSignature.every((byte, index) => buffer[index] === byte)) {
        return 'image/png';
    }

    if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
        return 'image/webp';
    }

    return null;
};

const reject = (res, message) =>
    res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message,
        count: 0,
        data: null
    });

// Use AFTER upload.single('image').
// required = true  -> a missing file is an error (dedicated upload-image route)
// required = false -> the file is optional (create / update product)
const verifyImageContent = (required = true) => (req, res, next) => {
    if (!req.file) {
        return required ? reject(res, 'No image uploaded. Send the file in the "image" field.') : next();
    }

    const realType = detectImageType(req.file.buffer);

    if (!realType) {
        return reject(res, 'The uploaded file is not a valid JPG, PNG or WEBP image.');
    }

    if (realType !== req.file.mimetype) {
        return reject(res, 'The file content does not match its declared image type.');
    }

    next();
};

module.exports = { verifyImageContent, detectImageType };
