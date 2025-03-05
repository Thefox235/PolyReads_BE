const express = require('express');
const router = express.Router();
const bannerController = require('../mongo/controller.model.js');

// Lấy danh sách banner
router.get('/', async (req, res) => {
  try {
    const banners = await bannerController.getBanners(req, res);
    return res.status(200).json({ banners });
  } catch (error) {
    console.log('lỗi get all banner: ', error);
    return res.status(500).json({ mess: error });
  }
});

// Lấy banner theo id
router.get('/:id', async (req, res) => {
  try {
    const result = await bannerController.getBannerById(req, res);
    return res.status(200).json({ result });
  } catch (error) {
    console.log('lỗi get banner by id: ', error);
    return res.status(500).json({ mess: error });
  }
});

// Tạo banner mới
router.post('/', async (req, res) => {
  try {
    const result = await bannerController.createBanner(req, res);
    return res.status(201).json({ result });
  } catch (error) {
    console.log('lỗi create banner: ', error);
    return res.status(500).json({ mess: error });
  }
});

// Cập nhật banner
router.put('/:id', async (req, res) => {
  try {
    const result = await bannerController.updateBanner(req, res);
    return res.status(200).json({ result });
  } catch (error) {
    console.log('lỗi update banner: ', error);
    return res.status(500).json({ mess: error });
  }
});

// Xóa banner
router.delete('/:id', async (req, res) => {
  try {
    const result = await bannerController.deleteBanner(req, res);
    return res.status(200).json({ result });
  } catch (error) {
    console.log('lỗi delete banner: ', error);
    return res.status(500).json({ mess: error });
  }
});

module.exports = router;
