const path = require('path');
const dotenv = require('dotenv');
// Load environment variables immediately
dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || true,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const jwt = require('jsonwebtoken');
const User = require('./models/User');

// EJS Template Engine configuration
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Global locals middleware to check authentication status for EJS templates
app.use(async (req, res, next) => {
  res.locals.isAuthenticated = false;
  res.locals.user = null;
  
  const token = req.cookies?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        res.locals.isAuthenticated = true;
        res.locals.user = user;
      }
    } catch (err) {
      res.clearCookie('token');
    }
  }
  next();
});

// Page Render Routes
app.use('/', require('./routes/pageRoutes'));

// REST API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/inquiries', require('./routes/inquiryRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`Error: ${err.message}`);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
