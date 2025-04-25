// routes/couponRoutes.js
const express = require('express');
const router = express.Router();
const couponController = require('../mongo/controller.model');
const checktoken = require('../hepler/checktoken.js');
const authorizeRole = require("../hepler/authorizeRole.js");  //cách dùng router.put("/:id", checktoken, authorizeRole("1"), async (req, res) => {


// Tạo mới coupon (chỉ admin mới được tạo)
router.post('/', checktoken, authorizeRole("1"), couponController.createCoupon);

// Lấy danh sách coupon (có thể công khai)
router.get('/', couponController.getAllCoupons);

// Lấy coupon theo ID
router.get('/:id', couponController.getCouponById);

// Cập nhật coupon theo ID (admin)
router.put('/:id', checktoken, authorizeRole("1"), couponController.updateCoupon);

// Xóa coupon theo ID (admin)
router.delete('/:id', checktoken, authorizeRole("1"), couponController.deleteCoupon);

module.exports = router;