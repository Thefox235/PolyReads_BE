const express = require('express');
const router = express.Router();
const favoriteController = require('../mongo/controller.model');
const Favorite = require('../mongo/favorite.model');

router.get("/search", async (req, res) => {
    try {
      const { userId, keyword } = req.query;
      if (!userId || !keyword) {
        return res.status(400).json({ message: "Missing 'userId' or 'keyword' query parameter" });
      }
      
      // Tạo regex để tìm kiếm theo tên sản phẩm
      const regex = new RegExp(keyword, "i");
      
      // Tìm các document Favorite của user đó và populate productId
      const favDocs = await Favorite.find({ userId })
        .populate({
          path: "productId",
          select: "name price discount",
        });
        
      // Lọc các favorites mà tên sản phẩm chứa keyword
      const filteredFavorites = favDocs.filter(doc => doc.productId && regex.test(doc.productId.name));
      
      return res.status(200).json({ favorites: filteredFavorites });
    } catch (error) {
      console.error("Error in favorite search:", error);
      return res.status(500).json({ message: error.message });
    }
  });
  
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