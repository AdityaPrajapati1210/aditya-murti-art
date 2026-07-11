const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true', // true for port 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV !== 'production',
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    // If not configured, print to console and simulate success to allow testing without SMTP keys
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('--- EMAIL SIMULATION (SMTP Not Configured) ---');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`HTML Body Snippet: ${html.substring(0, 300)}...`);
      console.log('---------------------------------------------');
      return { messageId: 'simulated-id' };
    }

    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Artist-Jeetendra Prajapati'}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
    return { error: error.message };
  }
};

sendEmail.transporter = transporter;
module.exports = sendEmail;
