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

// Endpoint để like comment: tăng số lượt like (+1)
router.put('/:id/like', commentController.likeComment);

// Endpoint để unlike comment: giảm số lượt like (-1)
router.put('/:id/unlike', commentController.unlikeComment);

module.exports = router;
