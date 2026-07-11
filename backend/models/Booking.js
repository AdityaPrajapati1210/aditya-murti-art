const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add a full name'],
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please add a phone number'],
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
  sculptureType: {
    type: String,
    required: [true, 'Please specify the type of sculpture'],
    enum: [
      'Religious Murti',
      'Ganesha',
      'Durga Maa',
      'Kali Maa',
      'Krishna',
      'Saraswati',
      'Lakshmi',
      'Vishwakarma',
      'Other'
    ],
  },
  preferredSize: {
    type: String,
    required: [true, 'Please add a preferred size'],
    trim: true, // Example: "2 Feet", "5 Feet"
  },
  budget: {
    type: String,
    required: [true, 'Please add an estimated budget'],
    trim: true,
  },
  meetingDate: {
    type: Date,
    required: [true, 'Please select a preferred meeting date'],
  },
  message: {
    type: String,
    required: [true, 'Please add a brief description of your requirements'],
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Booking', bookingSchema);
