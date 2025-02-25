var express = require('express');
var router = express.Router();
const discountModel = require('../mongo/discount.model.js');
const discountController = require('../mongo/controller.model.js');



router.get('/',async (req,res)=>{
    try {
      const result = await discountController.getDiscount(); 

      return res.status(200).json({result})
    } catch (error) {
      console.log('lỗi get all discount: ',error);
      return res.status(500).json({mess: error})
    }
  })


// Thêm discount mới
router.post('/add', async (req, res) => {
    try {
        const body = req.body;
        const result = await discountController.insertDiscount(body);
        return res.status(201).json({newDiscount: result});
    } catch (error) {
        console.log('Lỗi thêm discount: ', error);
        return res.status(500).json({mess: error});
    }
  });
  

module.exports = router;