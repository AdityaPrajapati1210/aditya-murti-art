const express = require('express');
const router = express.Router();
const { getStats, sendReply } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getStats);
router.post('/reply', protect, sendReply);

module.exports = router;
