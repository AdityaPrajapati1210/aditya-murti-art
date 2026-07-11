const Booking = require('../models/Booking');
const Inquiry = require('../models/Inquiry');
const Gallery = require('../models/Gallery');

// @desc    Get dashboard statistics & recent requests
// @route   GET /api/dashboard/stats
// @access  Private
const getStats = async (req, res) => {
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

    res.json({
      success: true,
      stats: {
        totalBookings,
        totalInquiries,
        totalGalleryItems,
      },
      recentBookings,
      recentInquiries,
    });
  } catch (error) {
    console.error(`Dashboard stats error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error loading dashboard statistics.' });
  }
};

// @desc    Send email reply to an inquiry or booking
// @route   POST /api/dashboard/reply
// @access  Private
const sendReply = async (req, res) => {
  try {
    const { to, subject, message, originalMessage } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Please provide recipient, subject, and message.' });
    }

    const sendEmail = require('../config/nodemailer');

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #C5A028; padding: 25px; border-radius: 8px; background-color: #fcfbf7;">
        <h2 style="color: #3D271D; border-bottom: 2px solid #C5A028; padding-bottom: 10px; font-family: Georgia, serif;">Jeetendra Prajapati Clay Art Studio</h2>
        
        <p style="font-size: 16px; color: #2D1B14; line-height: 1.6; white-space: pre-line;">${message}</p>
        
        <div style="margin-top: 30px; border-top: 1px solid #e1d8cd; padding-top: 15px; font-size: 12px; color: #888;">
          <p>Regards,<br><strong>Jeetendra Prajapati Clay Art Studio</strong><br>Bhiti Mau, Uttar Pradesh, India</p>
        </div>

        ${originalMessage ? `
          <div style="margin-top: 30px; border-top: 1px dashed #C5A028; padding-top: 15px; opacity: 0.85;">
            <p style="font-size: 12px; color: #666; font-weight: bold;">--- Original Inquiry ---</p>
            <blockquote style="font-size: 13px; color: #555; font-style: italic; border-left: 3px solid #C5A028; padding-left: 10px; margin: 5px 0; white-space: pre-line;">
              ${originalMessage}
            </blockquote>
          </div>
        ` : ''}
      </div>
    `;

    const info = await sendEmail({ to, subject, html });

    if (info.error) {
      return res.status(500).json({ success: false, message: `Failed to send reply: ${info.error}` });
    }

    res.json({ success: true, message: 'Reply email sent successfully.' });
  } catch (error) {
    console.error(`Send reply error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error sending reply.' });
  }
};

module.exports = {
  getStats,
  sendReply,
};
