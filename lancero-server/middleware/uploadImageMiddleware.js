const multer = require('multer');
const path = require('path');

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const extension = path.extname(file.originalname || '').toLowerCase();

        if (ALLOWED_TYPES.includes(file.mimetype) && ALLOWED_EXTENSIONS.includes(extension)) {
            return cb(null, true);
        }

        // status 400 so the central error handler answers 400 (not 500)
        const error = new Error('Only JPG, PNG or WEBP image files are allowed.');
        error.status = 400;
        cb(error);
    }
});

module.exports = upload;
module.exports.MAX_FILE_SIZE = MAX_FILE_SIZE;
