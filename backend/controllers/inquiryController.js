const Inquiry = require('../models/Inquiry');
const sendEmail = require('../config/nodemailer');

// @desc    Submit a contact inquiry
// @route   POST /api/inquiries
// @access  Public
const createInquiry = async (req, res) => {
  try {
    const { fullName, email, subject, message } = req.body;

    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Please fill in all fields of the contact form.' });
    }

    const inquiry = await Inquiry.create({
      fullName,
      email,
      subject,
      message,
    });

    // Send notification email to the admin
    const adminSubject = `NEW PORTFOLIO INQUIRY: ${fullName} - ${subject}`;
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 2px solid #3D271D; padding: 25px; border-radius: 8px; background-color: #ffffff;">
        <h2 style="color: #3D271D; background-color: #f5ece1; padding: 15px; border-radius: 4px; font-family: Georgia, serif; text-align: center; border-left: 5px solid #C5A028;">New Contact Inquiry</h2>
        <p>You have received a new message from the contact form on your portfolio website.</p>
        
        <h3 style="color: #2D1B14; border-bottom: 1px solid #3D271D; padding-bottom: 5px;">Sender Details:</h3>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        
        <h3 style="color: #2D1B14; border-bottom: 1px solid #3D271D; padding-bottom: 5px; margin-top: 20px;">Message Details:</h3>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message Content:</strong></p>
        <blockquote style="background: #fdfbf7; border-left: 4px solid #C5A028; padding: 10px 15px; margin: 10px 0; font-style: italic;">
          ${message}
        </blockquote>
        
        <p style="margin-top: 20px; font-size: 13px; color: #666;">You can log in to the dashboard to manage this inquiry or reply directly to the customer's email: <a href="mailto:${email}">${email}</a>.</p>
      </div>
    `;

    // Send email to admin
    await sendEmail({
      to: process.env.ADMIN_RECEIVER_EMAIL || 'jeetendraprajapati.studio@gmail.com',
      subject: adminSubject,
      html: adminHtml,
    });

    res.status(201).json({ success: true, message: 'Message sent successfully. We will get back to you soon.', data: inquiry });
  } catch (error) {
    console.error(`Create inquiry error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error processing contact request.' });
  }
};

// @desc    Get all inquiries
// @route   GET /api/inquiries
// @access  Private
const getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: inquiries.length, data: inquiries });
  } catch (error) {
    console.error(`Get inquiries error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error retrieving inquiries.' });
  }
};

// @desc    Delete an inquiry
// @route   DELETE /api/inquiries/:id
// @access  Private
const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    }

    await Inquiry.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Inquiry deleted successfully.' });
  } catch (error) {
    console.error(`Delete inquiry error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error deleting inquiry.' });
  }
};

module.exports = {
  createInquiry,
  getInquiries,
  deleteInquiry,
};
