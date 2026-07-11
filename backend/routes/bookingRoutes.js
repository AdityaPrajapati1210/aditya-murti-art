const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  deleteBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

// Public route to book a meeting
router.post('/', createBooking);

// Protected routes to view & manage bookings
router.get('/', protect, getBookings);
router.delete('/:id', protect, deleteBooking);

module.exports = router;
