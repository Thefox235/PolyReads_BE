// routes/couponRoutes.js

const express = require('express');
const router = express.Router();
const Coupon = require('../mongo/coupon.model.js');
const couponController = require('../mongo/controller.model');
const checktoken = require('../hepler/checktoken.js');
const authorizeRole = require("../hepler/authorizeRole.js");

// Tạo mới coupon (chỉ admin mới được tạo)
router.post('/', checktoken, authorizeRole("1"), couponController.createCoupon);

// Lấy danh sách coupon (có thể công khai)
router.get('/', couponController.getAllCoupons);

// Lấy coupon theo userId (áp dụng cho schema mới với eligibleUserIds)
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        // Nếu muốn gộp voucher cá nhân (limited) và voucher chung (global):
        const coupons = await Coupon.find({ eligibleUserIds: userId });
        res.status(200).json({ coupons });
    } catch (error) {
        console.error("Error fetching user coupons:", error);
        res.status(500).json({ message: "Error fetching coupons", error });
    }
});

// Kiểm tra coupon
router.post('/validate', couponController.validateCoupon);

// Định nghĩa route lấy coupon hợp lệ: sử dụng GET và query parameter 'total'
router.get('/valid', couponController.getValidCoupons);

// **Route cho coupon chung (global)**
router.get('/global', couponController.getGlobalCoupons);

// Các route có tham số ID phải được đặt sau cùng
router.get('/:id', couponController.getCouponById);
router.put('/:id', checktoken, authorizeRole("1"), couponController.updateCoupon);
router.delete('/:id', checktoken, authorizeRole("1"), couponController.deleteCoupon);

module.exports = router;