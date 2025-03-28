const express = require('express');
const router = express.Router();
const favoriteController = require('../mongo/controller.model');
//lấy danh sách favorite
router.get('/', favoriteController.getAllFavorites);
// Tạo mới một favorite (thêm sản phẩm vào danh sách yêu thích)
router.post('/', favoriteController.createFavorite);

// Lấy danh sách favorite theo userId
router.get('/user/:userId', favoriteController.getFavoritesByUser);

// Lấy thông tin một favorite cụ thể (nếu cần)
router.get('/:id', favoriteController.getFavoriteById);

// Xóa một favorite theo id (bỏ theo dõi/sản phẩm yêu thích)
router.delete('/:id', favoriteController.deleteFavorite);

module.exports = router;