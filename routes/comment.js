const express = require('express');
const router = express.Router();
const commentController = require('../mongo/controller.model.js');
const checktoken = require('../hepler/checktoken.js');
const authorizeRole = require("../hepler/authorizeRole.js");  //cách dùng router.put("/:id", checktoken, authorizeRole("1"), async (req, res) => {

// Tạo mới comment
router.post('/', commentController.createComment);

// Lấy danh sách comment, có thể truyền productId để lọc comment cho một sản phẩm
router.get('/', commentController.getComments);

// Cập nhật comment
router.put('/:id', commentController.updateComment);

// Xóa comment
router.delete('/:id', commentController.deleteComment);

// Endpoint để like comment: tăng số lượt like (+1)
router.put('/:id/like', commentController.likeComment);

// Endpoint để unlike comment: giảm số lượt like (-1)
router.put('/:id/unlike', commentController.unlikeComment);

// Endpoint để toggle like (like nếu chưa like, hủy like nếu đã like)
router.put('/:id/toggle-like', commentController.toggleLike);

module.exports = router;
