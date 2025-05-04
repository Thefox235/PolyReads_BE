// routes/order.js
const express = require('express');
const router = express.Router();
const orderController = require('../mongo/controller.model.js');
const checktoken = require('../hepler/checktoken.js');
const authorizeRole = require("../hepler/authorizeRole.js");  //cách dùng router.put("/:id", checktoken, authorizeRole("1"), async (req, res) => {

// gộp order
router.post('/complete', orderController.createFullOrder);

// Lấy tất cả đơn hàng
router.get('/', orderController.getOrders);

//lấy order theo user
router.get('/user/:id', orderController.getOrdersByUserId);

// Lấy đơn hàng theo ID
router.get('/:id', orderController.getOrderById);

// Tạo đơn hàng mới
router.post('/', orderController.createOrder);

// Cập nhật đơn hàng theo ID
router.put('/:id', orderController.updateOrder);

// Xóa đơn hàng theo ID
router.delete('/:id', orderController.deleteOrder);

// tiếp tục thanh toán 
router.post("/continue-payment", orderController.continuePayment);

// Endpoint để gửi email xác nhận đơn hàng thành công
router.post('/:orderId/email', async (req, res) => {
    try {
      const { orderId } = req.params;
      // Yêu cầu body chứa email và orderDetails (bao gồm total và items)
      const { email, orderDetails } = req.body;
  
      // Gọi hàm processPaymentSuccess để gửi email
      const result = await orderController.processPaymentSuccess(orderId, email, orderDetails);
      res.status(200).json({ message: "Email sent successfully", result });
    } catch (error) {
      console.error("Error in payment email endpoint:", error);
      res.status(500).json({ message: "Error sending email", error });
    }
  });
  

module.exports = router;
