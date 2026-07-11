const express = require('express');
const router = express.Router();
const { login, verify, updateAccount, testEmail } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', login);
router.get('/verify', protect, verify);
router.put('/update-account', protect, updateAccount);
router.post('/test-email', protect, testEmail);

module.exports = router;
