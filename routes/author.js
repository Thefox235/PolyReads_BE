var express = require('express');
var router = express.Router();
const authorController = require('../mongo/controller.model.js');
const checktoken = require('../hepler/checktoken.js');
const authorModel = require('../mongo/author.model.js');
const authorizeRole = require("../hepler/authorizeRole");  //cách dùng router.put("/:id", checktoken, authorizeRole("1"), async (req, res) => {

router.get('/',async (req,res)=>{
    try {
      const result = await authorController.getAuthor(); 

      return res.status(200).json({result})
    } catch (error) {
      console.log('lỗi get all: ',error);
      return res.status(500).json({mess: error})
    }
  })

// Thêm tác giả mới
router.post('/add', async (req, res) => {
  try {
      const body = req.body;
      const result = await authorController.insertAuthor(body);
      return res.status(201).json({newAuthor: result});
  } catch (error) {
      console.log('Lỗi thêm author: ', error);
      return res.status(500).json({mess: error});
  }
});

// Xóa danh mục theo id
router.delete('/delete/:id', async (req, res) => {
  try {
      const {id} = req.params;
      await authorController.deleteAuthorById(id);
      return res.status(200).json({message: 'Author đã được xóa thành công.'});
  } catch (error) {
      console.log('Lỗi xóa tác giả: ', error);
      return res.status(500).json({mess: error});
  }
});

//update tác giả
router.put('/:id',async (req,res)=>{
  try {
    const {id} = req.params;
    const body = req.body;
    const pro = await authorController.updateAuthorById(id,body)
    return res.status(200).json({Products: pro})
  } catch (error) {
    console.log('lỗi update: ',error);
    return res.status(500).json({mess: error});
  }
})

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const product = await authorModel.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy Author' });
    }
    return res.status(210).json({productNew: product});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

  module.exports = router;