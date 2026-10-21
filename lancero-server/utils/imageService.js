const cloudinary = require('../config/cloudinary');

const PRODUCT_FOLDER = 'bulldogs-exchange/products';

// Because multer uses memoryStorage there is NO req.file.path (that only exists
// with diskStorage). The file lives in req.file.buffer, so we stream it to
// Cloudinary with upload_stream.
const uploadImageBuffer = (buffer) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: PRODUCT_FOLDER, resource_type: 'image' },
            (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(buffer);
    });

// Best-effort delete: a failed cleanup must never break the request that
// triggered it, so it only logs.
const deleteImage = async (publicId) => {
    if (!publicId) return;

    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    } catch (error) {
        console.error(`Could not delete Cloudinary image "${publicId}":`, error.message);
    }
};

module.exports = { uploadImageBuffer, deleteImage };
