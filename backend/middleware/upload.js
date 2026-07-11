const multer = require('multer');

// Configure memory storage for serverless-ready setups (Vercel/Render compatibility)
const storage = multer.memoryStorage();

// Filter files to ensure only images are uploaded
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image files (JPEG, PNG, JPG, WEBP) are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit to support high-res phone camera images
  },
  fileFilter,
});

module.exports = upload;
