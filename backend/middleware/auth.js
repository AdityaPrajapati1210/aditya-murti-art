const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 1. Check authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Check cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    // If it's a page render request (starts with /admin), redirect to login
    if (req.originalUrl.startsWith('/admin')) {
      return res.redirect('/admin/login');
    }
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

    // Get user from the token (exclude password)
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      if (req.originalUrl.startsWith('/admin')) {
        return res.redirect('/admin/login');
      }
      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    }

    next();
  } catch (error) {
    console.error(error);
    if (req.originalUrl.startsWith('/admin')) {
      res.clearCookie('token');
      return res.redirect('/admin/login');
    }
    res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };
