// sendmail.js
require('dotenv').config();
const nodemailer = require('nodemailer');

const sendMail = async ({ email, subject, text, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // dùng TLS (port 587)
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: subject,
      ...(html ? { html } : { text })
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendMail }; // Export dạng named export
