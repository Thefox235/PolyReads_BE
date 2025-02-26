var express = require('express');
var router = express.Router();
const productModel = require('../mongo/product.model');
const categoryModel = require('../mongo/category.model.js');
categoryController = require('../mongo/controller.model.js');
const checktoken = require('../hepler/checktoken.js')

router.get('/',async (req,res)=>{
    try {
      const result = await categoryController.getCategory(); 

      return res.status(200).json({result})
    } catch (error) {
      console.log('lỗi get all: ',error);
      return res.status(500).json({mess: error})
    }
  })

  router.get('/similar/:categoryId', async (req, res) => {
    try {
        const catagoryId = req.params.categoryId;
        console.log('cata: ',catagoryId);
        const similarProducts = await productModel.find({'category': catagoryId});
        console.log('===>',similarProducts);
        return res.status(200).json({Products: similarProducts});
    } catch (error) {
        console.log('Lỗi khi lấy sản phẩm tương tự: ', error);
        return res.status(500).json({ mess: error });
    }
  });

// Thêm danh mục mới
router.post('/add', async (req, res) => {
  try {
      const body = req.body;
      const result = await categoryController.insertCategory(body);
      return res.status(201).json({newCategory: result});
  } catch (error) {
      console.log('Lỗi thêm danh mục: ', error);
      return res.status(500).json({mess: error});
  }
});

// Cập nhật danh mục theo id
// router.put('/:id', async (req, res) => {
//   try {
//       const {id} = req.params;
//       const body = req.body;
//       const updatedCategory = await categoryController.updateCategoryById(id, body);
//       return res.status(200).json({updatedCategory});
//   } catch (error) {
//       console.log('Lỗi cập nhật danh mục: ', error);
//       return res.status(500).json({mess: error});
//   }
// });

// Xóa danh mục theo id
router.delete('/delete/:id', async (req, res) => {
  try {
      const {id} = req.params;
      await categoryController.deleteCategoryById(id);
      return res.status(200).json({message: 'Danh mục đã được xóa thành công.'});
  } catch (error) {
      console.log('Lỗi xóa danh mục: ', error);
      return res.status(500).json({mess: error});
  }
});

//update danh mục
router.put('/:id',async (req,res)=>{
  try {
    const {id} = req.params;
    const body = req.body;
    const pro = await categoryController.updateCateById(id,body)
    return res.status(200).json({Products: pro})
  } catch (error) {
    console.log('lỗi update: ',error);
    return res.status(500).json({mess: error});
  }
})

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const product = await categoryModel.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    return res.status(210).json({productNew: product});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});
  module.exports = router;