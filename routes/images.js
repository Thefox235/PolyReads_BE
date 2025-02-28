var express = require('express');
var router = express.Router();
const imagesModel = require('../mongo/images.model.js');
const imagesController = require('../mongo/controller.model.js');

router.get('/',async (req,res)=>{
    try {
      const result = await imagesController.getImages(); 

      return res.status(200).json({result})
    } catch (error) {
      console.log('lỗi get all: ',error);
      return res.status(500).json({mess: error})
    }
  })

// lấy hình ảnh bằng id product localhost:3000/product/:productId
router.get('/product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const images = await imagesController.getImagesByProductId(id);
    return res.status(200).json({ images });
  } catch (error) {
    console.error('Error retrieving images for product:', error);
    return res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
});
// Thêm hình ảnh mới
router.post('/add', async (req, res) => {
  try {
      const body = req.body;
      const result = await imagesController.insertImages(body);
      return res.status(201).json({newImages: result});
  } catch (error) {
      console.log('Lỗi thêm hình ảnh: ', error);
      return res.status(500).json({mess: error});
  }
});

module.exports = router;