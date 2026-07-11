const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add a full name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email address'],
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email address',
    ],
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject'],
    trim: true,
  },
  message: {
    type: String,
    required: [true, 'Please add a message'],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Inquiry', inquirySchema);
