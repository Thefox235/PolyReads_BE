var express = require('express');
var router = express.Router();
const publisherController = require('../mongo/controller.model.js');
const checktoken = require('../hepler/checktoken.js');
const publisherModel = require('../mongo/publisher.model.js');

router.get('/',async (req,res)=>{
    try {
      const result = await publisherController.getPublisher(); 

      return res.status(200).json({result})
    } catch (error) {
      console.log('lỗi get all: ',error);
      return res.status(500).json({mess: error})
    }
  })

// Thêm nxb mới
router.post('/add', async (req, res) => {
  try {
      const body = req.body;
      const result = await publisherController.insertPublisher(body);
      return res.status(201).json({newNXB: result});
  } catch (error) {
      console.log('Lỗi thêm nxb: ', error);
      return res.status(500).json({mess: error});
  }
});

// Xóa nxb theo id
router.delete('/delete/:id', async (req, res) => {
  try {
      const {id} = req.params;
      await publisherController.deletePublisherById(id);
      return res.status(200).json({message: 'Author đã được xóa thành công.'});
  } catch (error) {
      console.log('Lỗi xóa nxb: ', error);
      return res.status(500).json({mess: error});
  }
});

//update nxb
router.put('/:id',async (req,res)=>{
  try {
    const {id} = req.params;
    const body = req.body;
    const result = await publisherController.updatePublisherById(id,body)
    return res.status(200).json({NXB: result})
  } catch (error) {
    console.log('lỗi update: ',error);
    return res.status(500).json({mess: error});
  }
})

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const product = await publisherModel.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy nxb' });
    }
    return res.status(210).json({NXB: product});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

  module.exports = router;