const nodemailer = require('nodemailer');
const https = require('https');

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
    // 1. If RESEND_API_KEY is configured, send via Resend REST API (bypasses Render SMTP port blocking)
    if (process.env.RESEND_API_KEY) {
      return new Promise((resolve, reject) => {
        // Resend Free Tier defaults to sending from onboarding@resend.dev to the account owner
        const fromEmail = process.env.EMAIL_FROM_NAME 
          ? `"${process.env.EMAIL_FROM_NAME}" <onboarding@resend.dev>` 
          : '"Aditya Murti Art" <onboarding@resend.dev>';

        const postData = JSON.stringify({
          from: fromEmail,
          to: [to],
          subject: subject,
          html: html,
        });

        const options = {
          hostname: 'api.resend.com',
          port: 443,
          path: '/emails',
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
          },
        };

        const req = https.request(options, (res) => {
          let body = '';
          res.on('data', (chunk) => { body += chunk; });
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try {
                const response = JSON.parse(body);
                console.log(`Email sent via Resend API: ${response.id}`);
                resolve({ messageId: response.id });
              } catch (e) {
                console.log('Email sent via Resend API, but response parse failed.');
                resolve({ messageId: 'resend-success-unparsed' });
              }
            } else {
              console.error(`Resend API Error (Status ${res.statusCode}): ${body}`);
              resolve({ error: `Resend status ${res.statusCode}` });
            }
          });
        });

        req.on('error', (err) => {
          console.error(`Resend HTTP connection failed: ${err.message}`);
          resolve({ error: err.message });
        });

        req.write(postData);
        req.end();
      });
    }

    // 2. Fallback to standard Nodemailer SMTP (e.g. local computer testing)
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('--- EMAIL SIMULATION (SMTP / API Not Configured) ---');
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
    console.log(`Email sent via SMTP: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
    return { error: error.message };
  }
};

sendEmail.transporter = transporter;
module.exports = sendEmail;
