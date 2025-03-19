const express = require('express');
const router = express.Router();
const orderDetailController = require('../mongo/controller.model');

// Tạo Order Detail mới
router.post('/', orderDetailController.createOrderDetail);

// Lấy Order Detail theo orderId
router.get('/:orderId', orderDetailController.getOrderDetailsByOrderId);

module.exports = router;
