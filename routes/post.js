// routes/postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../mongo/controller.model.js');
const checktoken = require('../hepler/checktoken.js');
const authorizeRole = require("../hepler/authorizeRole");  //cách dùng router.put("/:id", checktoken, authorizeRole("1"), async (req, res) => {
// Tạo mới bài viết (Toast Editor gửi dữ liệu gồm title, content, tag, coverImage)
router.post('/', postController.createPost);

// Lấy danh sách bài viết
router.get('/', postController.getPosts);

// Lấy chi tiết bài viết
router.get('/:id', postController.getPostById);

// Lấy bài viết theo slug (URL thân thiện)
router.get('/:slug', postController.getPostBySlug);

// Cập nhật bài viết (theo id)
router.put('/:id', postController.updatePost);

// Xóa bài viết (theo id)
router.delete('/:id', postController.deletePost);

module.exports = router;