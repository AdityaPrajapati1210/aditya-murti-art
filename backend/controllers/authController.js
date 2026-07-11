const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both username and password.' });
    }

    // Find admin user
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      
      // Secure HTTP-Only cookie for JWT
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.json({
        success: true,
        user: {
          id: user._id,
          username: user.username,
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }
  } catch (error) {
    console.error(`Login error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Internal Server Error.' });
  }
};

// @desc    Get current user session status
// @route   GET /api/auth/verify
// @access  Private
const verify = async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
      },
    });
  } catch (error) {
    console.error(`Verify error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Internal Server Error.' });
  }
};

// @desc    Update admin credentials
// @route   PUT /api/auth/update-account
// @access  Private
const updateAccount = async (req, res) => {
  try {
    const { username, currentPassword, newPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ success: false, message: 'Current password is required to verify changes.' });
    }

    // Find user by req.user._id
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Check if current password is correct
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password.' });
    }

    // Handle username update
    if (username && username.trim() !== '') {
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ success: false, message: 'Username is already taken.' });
      }
      user.username = username;
    }

    // Handle password update
    if (newPassword && newPassword.trim() !== '') {
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
      }
      user.password = newPassword;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Account updated successfully.',
      user: {
        id: user._id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error(`Update account error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Internal Server Error.' });
  }
};

// @desc    Test SMTP email configuration
// @route   POST /api/auth/test-email
// @access  Private
const testEmail = async (req, res) => {
  try {
    const { testRecipient } = req.body;
    
    if (!testRecipient) {
      return res.status(400).json({ success: false, message: 'Please provide a test recipient email address.' });
    }

    const sendEmail = require('../config/nodemailer');
    
    // First verify connection
    try {
      await sendEmail.transporter.verify();
    } catch (verifyError) {
      return res.status(500).json({ 
        success: false, 
        message: `SMTP Connection Verification Failed: ${verifyError.message}`,
        details: verifyError
      });
    }

    // Try sending test email
    const subject = 'Jeetendra Prajapati Clay Art Studio - SMTP Test Email';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #C5A028; padding: 20px; border-radius: 8px;">
        <h2 style="color: #3D271D; text-align: center;">SMTP Configuration Test</h2>
        <p>Hello,</p>
        <p>This is a test email sent from your website's admin panel to verify your SMTP configuration.</p>
        <p style="background-color: #fcfbf7; border-left: 4px solid #C5A028; padding: 10px; font-weight: bold; text-align: center;">
          SMTP Connection is Working Successfully!
        </p>
        <p>Sent at: ${new Date().toLocaleString('en-IN')}</p>
      </div>
    `;

    const info = await sendEmail({ to: testRecipient, subject, html });

    if (info.error) {
      return res.status(500).json({ success: false, message: `Failed to send email: ${info.error}` });
    }

    res.json({ success: true, message: `Test email sent successfully to ${testRecipient}. Check your inbox/spam.`, messageId: info.messageId });
  } catch (error) {
    console.error(`Test email error: ${error.message}`);
    res.status(500).json({ success: false, message: `Internal Server Error: ${error.message}` });
  }
};

module.exports = { login, verify, updateAccount, testEmail };
