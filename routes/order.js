// routes/order.js
const express = require('express');
const router = express.Router();
const orderController = require('../mongo/controller.model');

// Lấy tất cả đơn hàng
router.get('/', orderController.getOrders);

// Lấy đơn hàng theo ID
router.get('/:id', orderController.getOrderById);

// Tạo đơn hàng mới
router.post('/', orderController.createOrder);

// Cập nhật đơn hàng theo ID
router.put('/:id', orderController.updateOrder);

// Xóa đơn hàng theo ID
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
