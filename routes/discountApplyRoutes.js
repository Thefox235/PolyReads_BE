// routes/discountApplyRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../mongo/product.model.js');

/**
 * API endpoint: Áp dụng discount cho tất cả các sản phẩm (hoặc theo filter nhất định).
 * 
 * Request Body mẫu:
 * {
 *   "discountId": "67d04906c9a001a7e735c18d",
 *   "filter": { "category": "67c19f381d46a1cf08bca6c2" }
 * }
 * Nếu bạn muốn áp cho toàn bộ sản phẩm, bạn có thể gửi filter là {}.
 */
router.put('/apply-discount', async (req, res) => {
  const { discountId, filter } = req.body;

  // Kiểm tra discountId tồn tại
  if (!discountId) {
    return res.status(400).json({ message: "discountId is required" });
  }

  try {
    // Nếu không muốn lọc theo điều kiện nào, bạn dùng {} để cập nhật tất cả sản phẩm.
    const updateFilter = filter || {};
    // Cập nhật trường discount cho tất cả sản phẩm thỏa mãn điều kiện.
    const result = await Product.updateMany(updateFilter, { discount: discountId });
    res.status(200).json({ message: "Discount applied to products successfully", result });
  } catch (error) {
    console.error("Error applying discount:", error);
    res.status(500).json({ message: "Error applying discount", error });
  }
});

module.exports = router;
