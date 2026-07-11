const Booking = require('../models/Booking');
const sendEmail = require('../config/nodemailer');

// @desc    Create a consultation booking request
// @route   POST /api/bookings
// @access  Public
const createBooking = async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      email,
      sculptureType,
      preferredSize,
      budget,
      meetingDate,
      message,
    } = req.body;

    // Simple validation (though handled by schema, it's good to be explicit)
    if (!fullName || !phoneNumber || !email || !sculptureType || !preferredSize || !budget || !meetingDate || !message) {
      return res.status(400).json({ success: false, message: 'Please fill in all booking fields.' });
    }

    const booking = await Booking.create({
      fullName,
      phoneNumber,
      email,
      sculptureType,
      preferredSize,
      budget,
      meetingDate,
      message,
    });

    const formattedDate = new Date(meetingDate).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Send confirmation email to the customer
    const customerSubject = `Consultation Booked: ${sculptureType} - Jeetendra Prajapati Clay Art Studio`;
    const customerHtml = `
      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e1d8cd; padding: 25px; border-radius: 8px; background-color: #fcfbf7;">
        <h2 style="color: #2D1B14; border-bottom: 2px solid #D4AF37; padding-bottom: 10px; font-family: 'Playfair Display', Georgia, serif;">Consultation Booking Received</h2>
        <p>Dear <strong>${fullName}</strong>,</p>
        <p>Thank you for reaching out to <strong>Jeetendra Prajapati Clay Art Studio</strong>. We have received your consultation booking request for a custom sculpture creation.</p>
        
        <h3 style="color: #3D271D; margin-top: 20px;">Your Booking Summary:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0e6da; font-weight: bold; color: #2D1B14; width: 180px;">Sculpture Type:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0e6da; color: #555;">${sculptureType}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0e6da; font-weight: bold; color: #2D1B14;">Preferred Size:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0e6da; color: #555;">${preferredSize}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0e6da; font-weight: bold; color: #2D1B14;">Estimated Budget:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0e6da; color: #555;">${budget}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0e6da; font-weight: bold; color: #2D1B14;">Preferred Date:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #f0e6da; color: #555;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #2D1B14; vertical-align: top;">Your Message:</td>
            <td style="padding: 8px 0; color: #555; font-style: italic;">"${message}"</td>
          </tr>
        </table>
        
        <p style="margin-top: 25px;">Mr. Jeetendra Prajapati will review your requirements and we will contact you via phone (<strong>${phoneNumber}</strong>) or email to confirm the virtual or in-studio meeting details.</p>
        
        <div style="margin-top: 30px; border-top: 1px solid #f0e6da; padding-top: 15px; font-size: 12px; color: #888; text-align: center;">
          <p><strong>Jeetendra Prajapati Clay Art Studio</strong><br>Bhiti Mau, Uttar Pradesh, India</p>
          <p>20+ Years of Crafting Fine Handmade Clay & Mitti Murti</p>
        </div>
      </div>
    `;

    // Send notification email to the admin
    const adminSubject = `NEW CONSULTATION BOOKING: ${fullName} - ${sculptureType}`;
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 2px solid #2D1B14; padding: 25px; border-radius: 8px; background-color: #ffffff;">
        <h2 style="color: #2D1B14; background-color: #f5ece1; padding: 15px; border-radius: 4px; font-family: Georgia, serif; text-align: center; border-left: 5px solid #D4AF37;">New Consultation Booking</h2>
        <p>You have received a new consultation request on the website portfolio.</p>
        
        <h3 style="color: #3D271D; border-bottom: 1px solid #2D1B14; padding-bottom: 5px;">Client Contact Information:</h3>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phoneNumber}</p>
        
        <h3 style="color: #3D271D; border-bottom: 1px solid #2D1B14; padding-bottom: 5px; margin-top: 20px;">Sculpture Requirements:</h3>
        <p><strong>Type:</strong> ${sculptureType}</p>
        <p><strong>Preferred Size:</strong> ${preferredSize}</p>
        <p><strong>Budget Details:</strong> ${budget}</p>
        <p><strong>Requested Meeting Date:</strong> ${formattedDate}</p>
        <p><strong>Client's Requirements Message:</strong></p>
        <blockquote style="background: #fdfbf7; border-left: 4px solid #D4AF37; padding: 10px 15px; margin: 10px 0; font-style: italic;">
          ${message}
        </blockquote>
        
        <p style="margin-top: 20px; font-size: 13px; color: #666;">Log in to the studio Admin Dashboard to manage this request and update its status.</p>
      </div>
    `;

    // Fire off emails concurrently (safely, errors are caught in config)
    await Promise.all([
      sendEmail({ to: email, subject: customerSubject, html: customerHtml }),
      sendEmail({
        to: process.env.ADMIN_RECEIVER_EMAIL || 'jeetendraprajapati.studio@gmail.com',
        subject: adminSubject,
        html: adminHtml,
      }),
    ]);

    res.status(201).json({ success: true, message: 'Booking request sent successfully.', data: booking });
  } catch (error) {
    console.error(`Create booking error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error processing your booking.' });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({}).sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    console.error(`Get bookings error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error retrieving bookings.' });
  }
};

// @desc    Delete a booking request
// @route   DELETE /api/bookings/:id
// @access  Private
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking request not found.' });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Booking request deleted successfully.' });
  } catch (error) {
    console.error(`Delete booking error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Server Error deleting booking request.' });
  }
};

module.exports = {
  createBooking,
  getBookings,
  deleteBooking,
};
