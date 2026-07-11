const express = require('express');
const router = express.Router();
const {
  createInquiry,
  getInquiries,
  deleteInquiry,
} = require('../controllers/inquiryController');
const { protect } = require('../middleware/auth');

// Public route to submit an inquiry
router.post('/', createInquiry);

// Protected routes to view & delete inquiries
router.get('/', protect, getInquiries);
router.delete('/:id', protect, deleteInquiry);

module.exports = router;
