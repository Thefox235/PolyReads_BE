// netlify/functions/app.js
const serverless = require('serverless-http');
const app = require('../../app'); // Giả sử file app.js của bạn ở gốc dự án
module.exports.handler = serverless(app);