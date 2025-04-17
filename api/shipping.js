// routes/shipping.js
const express = require('express');
const router = express.Router();
const shippingController  = require('../mongo/controller.model');

router.post('/fee', shippingController.calculateShippingFee);
router.get('/provinces', shippingController.getProvinces);
router.get('/districts', shippingController.getDistricts);
router.get('/wards', shippingController.getWards);
// Route lấy danh sách city từ Goship Sandbox
router.get('/cities', shippingController.getCities);
// Route lấy danh sách quận/huyện theo mã thành phố
router.get('/cities/:code/districts', shippingController.getDistrictsByCity);
// Route lấy danh sách phường theo mã quận/huyện
router.get('/districts/:code/wards', shippingController.getWardsByDistrict);
// Route lấy thời gian vận chuyển
router.post('/rates', shippingController.getRates);

module.exports = router;