const express = require('express');
const router = express.Router();
const commentController = require('../mongo/controller.model.js');

// Tạo mới comment
router.post('/', commentController.createComment);

// Lấy danh sách comment, có thể truyền productId để lọc comment cho một sản phẩm
router.get('/', commentController.getComments);

// Cập nhật comment
router.put('/:id', commentController.updateComment);

// Xóa comment
router.delete('/:id', commentController.deleteComment);

module.exports = router;
