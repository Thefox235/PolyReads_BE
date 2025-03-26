const express = require("express");
const router = express.Router();
const checktoken = require("./middlewares/checktoken");
const authorizeRole = require("./middlewares/authorizeRole");

// Chỉ cho phép user có role "1" (admin) truy cập route này
router.get("/admin-data", checktoken, authorizeRole("1"), async (req, res) => {
  // Xử lý logic dành cho admin
  res.status(200).json({ mess: "Chào mừng admin!" });
});

module.exports = router;