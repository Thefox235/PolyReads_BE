const express = require('express');
const router = express.Router();
const bannerController = require('../mongo/controller.model.js');
const bannerModel = require('../mongo/banner.model.js');
const checktoken = require('../hepler/checktoken.js');
const authorizeRole = require("../hepler/authorizeRole");  //cách dùng router.put("/:id", checktoken, authorizeRole("1"), async (req, res) => {
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
        const id = req.params.id;
        const banners = await bannerModel.findById(id);
        if (!banners) {
            return res.status(404).json({ message: 'Không tìm thấy banner' });
        }
        return res.status(200).json({ BannerNew: banners });
    } catch (error) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// Tạo banner mới
router.post('/', async (req, res) => {
    try {
        const body = req.body;
        const result = await bannerController.createBanner(body);
        return res.status(201).json({ NewBanner: result });
    } catch (error) {
        console.log('lỗi create banner: ', error);
        return res.status(500).json({ mess: error });
    }
});

// Cập nhật banner
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const result = await bannerController.updateBanner(id, body)
        return res.status(200).json({ NewBanner: result });
    } catch (error) {
        console.log('lỗi update banner: ', error);
        return res.status(500).json({ mess: error });
    }
});

// Xóa banner
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await bannerController.deleteBanner(id);
        return res.status(200).json({ message: "banner đã được xóa thành công" });
    } catch (error) {
        console.log('lỗi delete banner: ', error);
        return res.status(500).json({ mess: error });
    }
});

module.exports = router;
