const Gallery = require('../models/Gallery');
const cloudinary = require('../config/cloudinary');

// Helper to stream file buffer to Cloudinary
const uploadStreamToCloudinary = (fileBuffer, folder = 'clay-art-studio') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

// @desc    Get all gallery items
// @route   GET /api/gallery
// @access  Public
const getGalleryItems = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const items = await Gallery.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    console.error(`Get gallery error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error retrieving gallery.' });
  }
};

// @desc    Create new gallery item (Upload to Cloudinary + Save to DB)
// @route   POST /api/gallery
// @access  Private
const createGalleryItem = async (req, res) => {
  try {
    const { title, description, category, dimensions } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ success: false, message: 'Please provide title, description, and category.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file.' });
    }

    // Stream upload image to Cloudinary
    let uploadResult;
    try {
      uploadResult = await uploadStreamToCloudinary(req.file.buffer);
    } catch (uploadError) {
      console.error(`Cloudinary upload failed: ${uploadError.message}`);
      return res.status(500).json({ success: false, message: 'Failed to upload image to Cloudinary.' });
    }

    // Save to Database
    const newItem = await Gallery.create({
      title,
      description,
      category,
      dimensions,
      imageUrl: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
    });

    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    console.error(`Create gallery item error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error creating gallery item.' });
  }
};

// @desc    Update gallery item details
// @route   PUT /api/gallery/:id
// @access  Private
const updateGalleryItem = async (req, res) => {
  try {
    const { title, description, category, dimensions } = req.body;
    let item = await Gallery.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found.' });
    }

    // If a new image is provided, upload it and delete the old one
    let imageUrl = item.imageUrl;
    let cloudinaryId = item.cloudinaryId;

    if (req.file) {
      // Delete old from Cloudinary
      try {
        await cloudinary.uploader.destroy(item.cloudinaryId);
      } catch (destroyErr) {
        console.warn(`Could not destroy old image ${item.cloudinaryId} on Cloudinary: ${destroyErr.message}`);
      }

      // Upload new image
      try {
        const uploadResult = await uploadStreamToCloudinary(req.file.buffer);
        imageUrl = uploadResult.secure_url;
        cloudinaryId = uploadResult.public_id;
      } catch (uploadError) {
        console.error(`Cloudinary upload failed: ${uploadError.message}`);
        return res.status(500).json({ success: false, message: 'Failed to upload new image.' });
      }
    }

    item = await Gallery.findByIdAndUpdate(
      req.params.id,
      {
        title: title || item.title,
        description: description || item.description,
        category: category || item.category,
        dimensions: dimensions || item.dimensions,
        imageUrl,
        cloudinaryId,
      },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: item });
  } catch (error) {
    console.error(`Update gallery item error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error updating gallery item.' });
  }
};

// @desc    Delete gallery item (Remove from Cloudinary + Delete from DB)
// @route   DELETE /api/gallery/:id
// @access  Private
const deleteGalleryItem = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found.' });
    }

    // Delete image from Cloudinary
    try {
      await cloudinary.uploader.destroy(item.cloudinaryId);
    } catch (cloudinaryErr) {
      console.warn(`Could not delete from Cloudinary: ${cloudinaryErr.message}`);
      // Continue anyway to prevent DB sync issues
    }

    // Delete from DB
    await Gallery.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Gallery item deleted successfully.' });
  } catch (error) {
    console.error(`Delete gallery item error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error deleting gallery item.' });
  }
};

module.exports = {
  getGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
};
