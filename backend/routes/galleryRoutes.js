const express = require('express');
const router = express.Router();
const {
  getGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} = require('../controllers/galleryController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public route to view gallery
router.get('/', getGalleryItems);

// Protected routes to manage gallery
router.post('/', protect, upload.single('image'), createGalleryItem);
router.put('/:id', protect, upload.single('image'), updateGalleryItem);
router.delete('/:id', protect, deleteGalleryItem);

module.exports = router;
