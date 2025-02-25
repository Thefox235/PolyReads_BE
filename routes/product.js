var express = require('express');
const productModel = require('../mongo/product.model.js');
var router = express.Router();
productController = require('../mongo/controller.model.js')
const checktoken = require('../hepler/checktoken.js')
/* GET users listing. */
router.post('/addpro', async (req, res)=> {
  try {
    const body = req.body;
    const result = await productController.insert(body)
    return res.status(210).json({prodcutNew: result});
  } catch (error) {
    console.log('Loi insert product: ',error);
    res.status(500).json({mess: error})
  }
});

//lấy sản phẩm xem nhiều localhost:3000/product/viewCount
router.get('/viewCount',async (req,res)=>{
  try {
    const products = 
    await productController.getViewCount()
    return res.status(200).json({products})
  } catch (error) {
    console.log('Lỗi get view count: ',error);
    return res.status(500).json({mess: error})
  }
})

//lấy sản phẩm hot localhost:3000/product/hot
router.get('/hot',async (req,res)=>{
  try {
    const products = 
    await productController.getHotPro()
    return res.status(200).json({products})
  } catch (error) {
    console.log('Lỗi get hot: ',error);
    return res.status(500).json({mess: error})
  }
})

router.get('/',async (req,res)=>{
  try {
    const products = 
    await productController.getAll()
    return res.status(200).json({products})
  } catch (error) {
    console.log('lỗi get all: ',error);
    return res.status(500).json({mess: error})
  }
})
//lay san pham theo tien tang dan
router.get('/limit',async (req,res)=>{
  try {
    const products = 
    await productController.getLimitPro()
    return res.status(200).json({products})
  } catch (error) {
    console.log('lỗi get all: ',error);
    return res.status(500).json({mess: error})
  }
})

router.get('/page', async (req, res) => {
  try {
      // Lấy số trang và giới hạn số lượng từ yêu cầu
      const { page = 1, limit = 10 } = req.query;

      // Chuyển đổi chúng thành số nguyên
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      // Lấy sản phẩm từ cơ sở dữ liệu
      const products = await productController.getProducts(pageNum, limitNum);

      // Trả về sản phẩm
      return res.status(200).json({ products });
  } catch (error) {
      console.log('Lỗi khi lấy sản phẩm:', error);
      return res.status(500).json({ mess: error });
  }
});

//tìm kiếm
//localhost:3000/product/key/value
router.get('/:key/:value',async (req,res)=>{
  try {
    const {key, value} = req.params;
    const pro = await productController.getByKey(key,value)
    return res.status(200).json({Products: pro})
  } catch (error) {
    console.log('lỗi get by key: ',error);
    return res.status(500).json({mess: error});
  }
})
//update sản phẩm
router.put('/:id',async (req,res)=>{
  try {
    const {id} = req.params;
    const body = req.body;
    const pro = await productController.updateById(id,body)
    return res.status(200).json({Products: pro})
  } catch (error) {
    console.log('lỗi update: ',error);
    return res.status(500).json({mess: error});
  }
})

//xoa san pham theo id
router.delete('/delete/:id',async (req,res)=>{
  try {
    const {id} = req.params;
    const prodel = await productController.deleteById(id)
  } catch (error) {
    console.log('lỗi xóa sản phẩm:',error); 
    return res.status(500).json({mess: error})
  }
})

//xoa san pham theo điều kiện
router.delete('/delete/:key/:value', async (req, res) => {
  try {
      const { key, value } = req.params;
      const deletedProduct = await productController.deleteProductByKey(key, value);
      if (deletedProduct) {
          res.status(200).json({ message: 'Sản phẩm đã được xóa', product: deletedProduct });
      } else {
          res.status(404).json({ message: 'Không tìm thấy sản phẩm để xóa' });
      }
  } catch (error) {
      console.log('Lỗi khi xóa sản phẩm:', error);
      res.status(500).json({ message: 'Lỗi server' });
  }
});

//http://localhost:3000/product/new
router.get('/new',async (req,res)=>{
  try {
    const proNew = await productController.getNewPro()
    return res.status(200).json({proNew})
  } catch (error) {
    console.log('lỗi get new:',error); 
    return res.status(500).json({mess: error})
  }
})

//http://localhost:3000/product/id
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const product = await productModel.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    // Tăng viewCount lên 1
    product.viewCount = (product.viewCount || 0) + 1;
    await product.save();

    return res.status(200).json({productNew: product});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});
router.get('/cate/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const pros = await productController.getProByCata(id);
    return res.status(200).json({pros});
  } catch (error) {
    console.log('Lỗi lấy sản phẩm theo danh mục: ', error);
    return res.status(500).json({ mess: error });
  }
});

// router.get('/similar/:catagoryId', async (req, res) => {
//   try {
//       const catagoryId = req.params.catagoryId;
//       console.log('cata: ',catagoryId);
//       const similarProducts = await productModel.find({'catagory.catagoryId': catagoryId});
//       console.log('===>',similarProducts);
//       return res.status(200).json({Products: similarProducts});
//   } catch (error) {
//       console.log('Lỗi khi lấy sản phẩm tương tự: ', error);
//       return res.status(500).json({ mess: error });
//   }
// });



module.exports = router;
