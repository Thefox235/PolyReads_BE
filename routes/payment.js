// routes/payment.js
const express = require('express');
const router = express.Router();
const paymentController = require('../mongo/controller.model.js');
const checktoken = require('../hepler/checktoken.js');
const authorizeRole = require("../hepler/authorizeRole");

router.post('/create-vnpay', paymentController.createVNPayPaymentIntent);

// Bạn cũng sẽ cần endpoint xử lý callback VNPay (vnpay_return)
router.get('/vnpay_return', (req, res) => {
  // Xử lý các tham số trả về từ VNPay
  // Kiểm tra secure hash, cập nhật trạng thái đơn hàng, …
  res.send("Thanh toán VNPay được xử lý thành công!");
});

router.post('/create', paymentController.createMomoPaymentIntent);

// Bạn cũng có thể tạo endpoint xử lý kết quả callback từ MoMo nếu cần
router.get('/return', (req, res) => {
  // Xử lý các tham số trả về từ MoMo, kiểm tra chữ ký, cập nhật trạng thái đơn hàng,...
  res.send("Callback từ MoMo được xử lý!");
});

module.exports = router;
