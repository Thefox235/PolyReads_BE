// sendmail.js
require('dotenv').config();
const nodemailer = require('nodemailer');
const gmailUser = "polyreadstore@gmail.com";
const gmailPass = "ocilijeadsdfqfqt"
const sendMail = async ({ email, subject, text, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // dùng TLS (port 587)
      auth: {
        user: process.env.GMAIL_USER || gmailUser,
        pass: process.env.GMAIL_PASS || gmailPass
      }
    });

    const mailOptions = {
      from: process.env.GMAIL_USER || gmailUser,
      to: email,
      subject: subject,
      ...(html ? { html } : { text })
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.log("Sending email to:", email);
    if (!email) {
      throw new Error("No recipient email provided");
    }
  }
};

module.exports = { sendMail }; // Export dạng named export
