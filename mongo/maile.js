// Sử dụng dotenv để load biến môi trường (tùy chọn)
require('dotenv').config();
const nodemailer = require('nodemailer');

// Tạo transporter với cấu hình của Gmail
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,       // Port 587 dùng cho TLS/STARTTLS
  secure: false,   // Sử dụng false khi không dùng SSL (port 465 yêu cầu true)
  auth: {
    user: process.env.GMAIL_USER, // Ví dụ: 'your-email@gmail.com'
    pass: process.env.GMAIL_PASS  // Mật khẩu hoặc App Password của Gmail
  }
});

// Kiểm tra kết nối đến SMTP server để đảm bảo cấu hình đúng
transporter.verify((error, success) => {
  if (error) {
    console.error('Lỗi kết nối SMTP: ', error);
  } else {
    console.log('SMTP server đã sẵn sàng.');
  }
});

module.exports = transporter;
