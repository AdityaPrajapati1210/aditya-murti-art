const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title for the sculpture'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  imageUrl: {
    type: String,
    required: true,
  },
  cloudinaryId: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Religious Murti',
      'Ganesha',
      'Durga Maa',
      'Kali Maa',
      'Krishna',
      'Saraswati',
      'Lakshmi',
      'Vishwakarma'
    ],
  },
  dimensions: {
    type: String,
    trim: true, // Example: "3 Feet", "18 Inches"
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Gallery', gallerySchema);
