// routes/address.js
const express = require("express");
const router = express.Router();
const addressController = require("../mongo/controller.model");

// Lấy tất cả các địa chỉ
router.get("/", addressController.getAllAddresses);

// Lấy địa chỉ theo ID
router.get("/:id", addressController.getAddressById);

// Tạo địa chỉ mới
router.post("/", addressController.createAddress);

// Cập nhật địa chỉ theo ID
router.put("/:id", addressController.updateAddress);

// Xóa địa chỉ theo ID
router.delete("/:id", addressController.deleteAddress);

module.exports = router;
