var express = require('express');
var router = express.Router();
const orderModel = require('../mongo/order.model.js');
var productController = require('../mongo/controller.model.js');

//get order by id user
router.get('/user/:id',async function(req, res, next) {
  const id = req.params.id;
  const order = await(productController.getOrderByIdUser(id))
  res.send(order);
})

//them order
router.post('/add',async function(req, res, next) {
    const sp =  new orderModel(req.body);
    try {
        await sp.save();
        res.json(sp);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
})

// get all order
router.get('/', async function(req, res, next) {
  try {
    const sp = await orderModel.find({}).sort({ _id: -1 }); // Sắp xếp theo _id giảm dần
    res.send(sp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//update sanpham
router.put('/:id',async function(req, res, next) {
  try {
      await orderModel.findByIdAndUpdate(req.params.id,req.body);
      res.send('Cập nhật thành công!');
  } catch (error) {
      res.status(500).send(error);
  }
})

//xoa sanpham
router.delete('/:id',async function(req, res, next) {
  try {
    await orderModel.findByIdAndDelete(req.params.id,req.body);
    res.send();
  } catch (error) {
    res.status(500).send(error);    
  }
})


//lay 1 sp
router.get('/:id',async function(req, res, next) {
  const sp = await(orderModel.findById(req.params.id,res.body));
  try {
    res.send(sp);
  } catch (error) {
    res.status(500).json({message: error.message});
  }
})


module.exports = router;