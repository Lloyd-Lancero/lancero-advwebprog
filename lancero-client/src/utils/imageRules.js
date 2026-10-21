// Must match the server (middleware/uploadImageMiddleware.js)
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

// Returns an error message, or '' when the file is fine.
// This is only a convenience for the user - the server checks again.
export const validateImageFile = (file) => {
  const extension = file.name.split('.').pop().toLowerCase();

  if (!ALLOWED_TYPES.includes(file.type) || !ALLOWED_EXTENSIONS.includes(extension)) {
    return 'Invalid image type. Only JPG, PNG or WEBP files are allowed.';
  }

  if (file.size > MAX_IMAGE_SIZE) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return `Image is too large (${mb} MB). The maximum size is 5 MB.`;
  }

  return '';
};
