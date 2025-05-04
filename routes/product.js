var express = require('express');
const productModel = require('../mongo/product.model.js');
var router = express.Router();
productController = require('../mongo/controller.model.js')
const checktoken = require('../hepler/checktoken.js');
const authorizeRole = require("../hepler/authorizeRole.js");  //cách dùng router.put("/:id", checktoken, authorizeRole("1"), async (req, res) => {
const mongoose = require('mongoose');
const discountModel = require('../mongo/discount.model.js');
/* GET users listing. */
//filter theo nxb
router.get('/filter-publishers', async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};
    if (category) {
      filter.category = new mongoose.Types.ObjectId(category);
    }
    const publisherIds = await productModel.distinct('publisher', filter);

    const publisherModel = require('../mongo/publisher.model.js');
    // Sắp xếp theo _id giảm dần (newest first)
    const publishers = await publisherModel.find({ _id: { $in: publisherIds } }).sort({ _id: -1 });
    return res.status(200).json({ publishers });
  } catch (error) {
    console.error('Lỗi khi lấy nhà xuất bản theo category:', error);
    return res.status(500).json({ message: error.message });
  }
});
//filter theo author
router.get('/filter-authors', async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};
    if (category) {
      filter.category = new mongoose.Types.ObjectId(category);
    }
    // Lấy danh sách các tác giả duy nhất mà có sản phẩm thỏa mãn filter
    const authorIds = await productModel.distinct('author', filter);

    const authorModel = require('../mongo/author.model.js');
    // Sắp xếp theo _id giảm dần (tác giả mới nhất first)
    const authors = await authorModel.find({ _id: { $in: authorIds } }).sort({ _id: -1 });
    return res.status(200).json({ authors });
  } catch (error) {
    console.error('Lỗi khi lấy tác giả theo category:', error);
    return res.status(500).json({ message: error.message });
  }
});
//filter sản phẩm 
router.get('/filter', async (req, res) => {
  try {
    const { category, author, publisher, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (category) {
      filter.category = new mongoose.Types.ObjectId(category);
    }
    if (author) {
      const authorIds = author.split(",").map(id => new mongoose.Types.ObjectId(id));
      filter.author = { $in: authorIds };
    }
    if (publisher) {
      const publisherIds = publisher.split(",").map(id => new mongoose.Types.ObjectId(id));
      filter.publisher = { $in: publisherIds };
    }
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skipNum = (pageNum - 1) * limitNum;
    
    // Lấy tổng số sản phẩm dựa theo filter
    const total = await productModel.countDocuments(filter);
    
    const products = await productModel.find(filter)
      .sort({ _id: -1 })
      .skip(skipNum)
      .limit(limitNum)
      .populate('author')
      .populate('publisher')
      .populate('category');
      
    return res.status(200).json({ total, products });
  } catch (error) {
    console.error("Error in product filter:", error);
    return res.status(500).json({ message: error.message });
  }
});

router.put('/apply-discount', async (req, res) => {
  const { discountId, filter } = req.body; // filter: object chứa điều kiện ví dụ: { category: '...' }
  try {
    const result = await productModel.updateMany(filter, { discount: discountId });
    res.status(200).json({ message: 'Discount applied successfully', result });
  } catch (error) {
    console.error("Error applying discount:", error);
    res.status(500).json({ message: "Error applying discount", error });
  }
});

router.put('/discount', async (req, res) => {
  try {
    const { categoryId, discountId } = req.body;

    if (!categoryId) {
      return res.status(400).json({ message: "Thiếu categoryId." });
    }

    // Nếu discountId được truyền và không null, kiểm tra xem discount có tồn tại không
    if (discountId) {
      const discount = await discountModel.findById(discountId);
      if (!discount) {
        return res.status(404).json({ message: "Discount không tồn tại." });
      }
    }

    // Thực hiện update tất cả các sản phẩm mà trường category phù hợp
    // Nếu discountId không có (hoặc null) thì cập nhật discount: null
    const updateResult = await productModel.updateMany(
      { category: categoryId },
      { discount: discountId || null }
    );

    return res.status(200).json({
      message: "Cập nhật discount cho sản phẩm thành công.",
      modifiedCount: updateResult.nModified || updateResult.modifiedCount,
      details: updateResult,
    });
  } catch (error) {
    console.error("Error updating discount for products:", error);
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

//lấy tất cả sản phẩm localhost:3000/product/
router.get('/', async (req, res) => {
  try {
    const products =
      await productController.getAll()
    return res.status(200).json({ products })
  } catch (error) {
    console.log('lỗi get all: ', error);
    return res.status(500).json({ mess: error })
  }
})
//thêm sản phẩm localhost:3000/product/addpro
router.post('/addpro', async (req, res) => {
  try {
    const body = req.body;
    const result = await productController.insert(body)
    return res.status(210).json({ prodcutNew: result });
  } catch (error) {
    console.log('Loi insert product: ', error);
    res.status(500).json({ mess: error })
  }
});
//thêm sản phẩm localhost:3000/product/add
router.post('/add', checktoken, authorizeRole("1"), async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', 'https://poly-reads.vercel.app');
    const { productData, images } = req.body;
    const result = await productController.addNewProduct(productData, images);
    return res.status(201).json({ productNew: result });
  } catch (error) {
    console.error('Lỗi insert product:', error);
    return res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
});

//lấy sản phẩm xem nhiều localhost:3000/product/viewCount
// router.get('/viewCount',async (req,res)=>{
//   try {
//     const products = 
//     await productController.getViewCount()
//     return res.status(200).json({products})
//   } catch (error) {
//     console.log('Lỗi get view count: ',error);
//     return res.status(500).json({mess: error})
//   }
// })

//lấy sản phẩm hot localhost:3000/product/hot
router.get('/hot', async (req, res) => {
  try {
    const products =
      await productController.getHotPro()
    return res.status(200).json({ products })
  } catch (error) {
    console.log('Lỗi get hot: ', error);
    return res.status(500).json({ mess: error })
  }
})


//lay san pham theo tien tang dan
router.get('/limit', async (req, res) => {
  try {
    const products =
      await productController.getLimitPro()
    return res.status(200).json({ products })
  } catch (error) {
    console.log('lỗi get all: ', error);
    return res.status(500).json({ mess: error })
  }
})

router.get('/page', async (req, res) => {
  try {
    // Lấy số trang và giới hạn số lượng từ yêu cầu
    const { page = 1, limit = 20 } = req.query;

    // Chuyển đổi chúng thành số nguyên
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || isNaN(limitNum)) {
      return res.status(400).json({ message: 'Page và limit phải là số hợp lệ' });
    }

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
// routes/product.routes.js
// API tìm kiếm sản phẩm theo query parameters: field và keyword
router.get('/search', async (req, res) => {
  try {
    const { field, keyword } = req.query;
    if (!field || !keyword) {
      return res.status(400).json({ message: "Missing 'field' or 'keyword' query parameter" });
    }
    const products = await productController.getByKey(field, keyword);
    return res.status(200).json({ products });
  } catch (error) {
    console.error("Error in product search:", error);
    return res.status(500).json({ message: error.message });
  }
});


// update sản phẩm (với cả cập nhật hình ảnh)
router.put('/:id', checktoken, authorizeRole("1"), async (req, res) => {
  try {
    const { id } = req.params;
    // Destructure body nhận được: phải có key productData và images
    const { productData, images } = req.body;
    // Gọi hàm updateById truyền vào id, productData và images
    const updatedProduct = await productController.updateById(id, productData, images);
    return res.status(200).json({ product: updatedProduct });
  } catch (error) {
    console.error('Lỗi update:', error);
    return res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
});

//xoa san pham theo id
router.delete('/delete/:id', checktoken, authorizeRole("1"), async (req, res) => {
  try {
    const { id } = req.params;
    const prodel = await productController.deleteById(id);
    // Gửi về response khi xóa thành công:
    return res.status(200).json(prodel);
  } catch (error) {
    console.log('Lỗi xóa sản phẩm:', error);
    return res.status(500).json({ mess: error.message || 'Internal Server Error' });
  }
});


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
router.get('/new', async (req, res) => {
  try {
    const proNew = await productController.getNewPro()
    return res.status(200).json({ proNew })
  } catch (error) {
    console.log('lỗi get new:', error);
    return res.status(500).json({ mess: error })
  }
})

//chi tiết sản phẩm http://localhost:3000/product/id
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    return res.status(200).json({ productNew: product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

//sản phẩm theo danh mục
router.get('/cate/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const pros = await productController.getProByCata(id);
    return res.status(200).json({ pros });
  } catch (error) {
    console.log('Lỗi lấy sản phẩm theo danh mục: ', error);
    return res.status(500).json({ mess: error });
  }
});
//sản phẩm theo danh mục có phân trang 
router.get('/cate-page/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // Lấy page và limit từ query parameter, mặc định là 1 và 20
    const { page = 1, limit = 20 } = req.query;

    // Gọi hàm controller mới có phân trang
    const products = await productController.getProByCataPage(id, page, limit);

    return res.status(200).json({ products });
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm theo danh mục (phân trang): ', error);
    return res.status(500).json({ mess: error.message });
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
