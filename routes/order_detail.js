const express = require('express');
const router = express.Router();
const orderDetailController = require('../mongo/controller.model');
const checktoken = require('../hepler/checktoken.js');
const authorizeRole = require("../hepler/authorizeRole");  //cách dùng router.put("/:id", checktoken, authorizeRole("1"), async (req, res) => {
// Tạo Order Detail mới
router.post('/', orderDetailController.createOrderDetail);

// Lấy Order Detail theo orderId
router.get('/:orderId', orderDetailController.getOrderDetailsByOrderId);

module.exports = router;
