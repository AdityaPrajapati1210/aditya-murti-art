const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');
const Gallery = require('../models/Gallery');
const Booking = require('../models/Booking');
const Inquiry = require('../models/Inquiry');
const User = require('../models/User');

// GET / - Home Page
router.get('/', (req, res) => {
  res.render('home', { 
    activePage: 'home',
    title: 'Aditya Murti Art | Clay Murti, Durga & Ganesh Idol Maker in Mau',
    metaDesc: 'Handcrafted clay murti, Durga & Ganesh idols, and organic mitti art by Jeetendra Prajapati at Aditya Murti Art, Bhiti Mau, UP. Custom orders near you for festivals & temples.',
    canonicalUrl: 'https://adityamurtiart.com/'
  });
});

// GET /about - About Page
router.get('/about', (req, res) => {
  res.render('about', { 
    activePage: 'about',
    title: 'About Jeetendra Prajapati | Aditya Murti Art Studio Mau UP',
    metaDesc: 'Meet Jeetendra Prajapati, master clay sculptor at Aditya Murti Art in Bhiti Mau, UP. Over 20 years crafting organic clay idols, Durga murti, and custom portraits.',
    canonicalUrl: 'https://adityamurtiart.com/about'
  });
});

// GET /services - Services Page
router.get('/services', (req, res) => {
  res.render('services', { 
    activePage: 'services',
    title: 'Durga Murti & Clay Idol Sculpting Services | Aditya Murti Art',
    metaDesc: 'Explore custom clay sculpting services: Religious Murti (Ganesha, Durga, Saraswati), custom bust models, temple projects, and marble painting in Mau, Uttar Pradesh.',
    canonicalUrl: 'https://adityamurtiart.com/services'
  });
});

// GET /gallery - Gallery Portfolio Page
router.get('/gallery', async (req, res) => {
  try {
    const { category } = req.query;
    // If category is "All" or not provided, fetch everything
    const filter = category && category !== 'All' ? { category } : {};
    const items = await Gallery.find(filter).sort({ createdAt: -1 });
    
    res.render('gallery', { 
      activePage: 'gallery',
      items,
      selectedCategory: category || 'All',
      title: 'Clay Art Gallery - Durga, Ganesh & Mitti Murti | Aditya Murti Art',
      metaDesc: 'Browse our collection of hand-sculpted clay masterpieces, religious mitti murti, Durga idols, and custom terracotta works created by sculptor Jeetendra Prajapati.',
      canonicalUrl: 'https://adityamurtiart.com/gallery'
    });
  } catch (error) {
    console.error(`Page Gallery Error: ${error.message}`);
    res.status(500).render('home', { 
      activePage: 'home', 
      error: 'Could not load gallery portfolio.',
      title: 'Aditya Murti Art | Clay Murti, Durga & Ganesh Idol Maker in Mau',
      metaDesc: 'Official website of Jeetendra Prajapati Clay Art Studio, based in Bhiti Mau, UP.'
    });
  }
});

// GET /book - Consultation Booking Page
router.get('/book', (req, res) => {
  res.render('book', { 
    activePage: 'book',
    preselectService: req.query.service || '',
    preselectTitle: req.query.title || '',
    title: 'Book a Design Consultation | Aditya Murti Art',
    metaDesc: 'Schedule a free design consultation with master sculptor Jeetendra Prajapati to discuss custom dimensions, clay options, and pricing estimates.',
    canonicalUrl: 'https://adityamurtiart.com/book'
  });
});

// GET /contact - Contact Page
router.get('/contact', (req, res) => {
  res.render('contact', { 
    activePage: 'contact',
    title: 'Contact Aditya Murti Art Studio | Bhiti Mau, Mau',
    metaDesc: 'Get in touch with Aditya Murti Art Studio in Uttar Pradesh. Reach out for custom orders, workshop visits, address queries, and phone consultations.',
    canonicalUrl: 'https://adityamurtiart.com/contact'
  });
});

// GET /admin/login - Login Page (checks if already logged in)
router.get('/admin/login', async (req, res) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
      const user = await User.findById(decoded.id);
      if (user) {
        return res.redirect('/admin/dashboard');
      }
    } catch (err) {
      res.clearCookie('token');
    }
  }
  res.render('admin-login', { 
    activePage: 'admin-login',
    title: 'Admin Portal Access | Aditya Murti Art',
    metaDesc: 'Secure administrator login page for the Jeetendra Prajapati Clay Art Studio website.',
    canonicalUrl: 'https://adityamurtiart.com/admin/login'
  });
});

// GET /admin/dashboard - Admin Dashboard (Protected)
router.get('/admin/dashboard', protect, async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const totalInquiries = await Inquiry.countDocuments();
    const totalGalleryItems = await Gallery.countDocuments();

    // Get 5 most recent bookings
    const recentBookings = await Booking.find({})
      .sort({ createdAt: -1 })
      .limit(5);

    // Get 5 most recent inquiries
    const recentInquiries = await Inquiry.find({})
      .sort({ createdAt: -1 })
      .limit(5);

    res.render('admin-dashboard', {
      activePage: 'admin-dashboard',
      stats: {
        totalBookings,
        totalInquiries,
        totalGalleryItems
      },
      recentBookings,
      recentInquiries,
      title: 'Admin Dashboard | Aditya Murti Art',
      metaDesc: 'Secure dashboard for managing bookings, gallery items, and contact inquiries.',
      canonicalUrl: 'https://adityamurtiart.com/admin/dashboard'
    });
  } catch (error) {
    console.error(`Page Dashboard Error: ${error.message}`);
    res.status(500).redirect('/');
  }
});

// GET /admin/logout - Logout logic
router.get('/admin/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.redirect('/admin/login');
});

// GET /robots.txt - Dynamic robots.txt generation
router.get('/robots.txt', (req, res) => {
  const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const clientOrigin = process.env.CLIENT_ORIGIN || `${protocol}://${req.headers.host}`;
  
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${clientOrigin}/sitemap.xml`);
});

// GET /sitemap.xml - Dynamic sitemap generation
router.get('/sitemap.xml', (req, res) => {
  const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const clientOrigin = process.env.CLIENT_ORIGIN || `${protocol}://${req.headers.host}`;
  
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${clientOrigin}/</loc>
    <lastmod>2026-07-08</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${clientOrigin}/about</loc>
    <lastmod>2026-07-08</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${clientOrigin}/services</loc>
    <lastmod>2026-07-08</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${clientOrigin}/gallery</loc>
    <lastmod>2026-07-08</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${clientOrigin}/book</loc>
    <lastmod>2026-07-08</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${clientOrigin}/contact</loc>
    <lastmod>2026-07-08</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`);
});

// Google Search Console Verification HTML route
router.get('/googlecd3a77e559352496.html', (req, res) => {
  res.send('google-site-verification: googlecd3a77e559352496.html');
});

module.exports = router;
