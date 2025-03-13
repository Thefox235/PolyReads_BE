var express = require('express');
var router = express.Router();
const discountModel = require('../mongo/discount.model.js');
const discountController = require('../mongo/controller.model.js');

// Tạo mới discount
router.post('/', discountController.createDiscount);

// Lấy danh sách discount
router.get('/', discountController.getAllDiscounts);

// Lấy discount theo id
router.get('/:id', discountController.getDiscountById);

// Cập nhật discount theo id
router.put('/:id', discountController.updateDiscount);

// Xóa discount theo id
router.delete('/:id', discountController.deleteDiscount);

module.exports = router;