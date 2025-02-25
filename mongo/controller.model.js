const productModel = require('./product.model')
const categoryModel = require('./category.model')
const authorModel = require('./author.model')
const discountModel = require('./discount.model')
const userModel = require('./user.model')
const orderModel = require('./order.model')
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
module.exports = {insert, getAll, updateById,
     getNewPro, getCategory, getUsers, deleteById, 
     insertCategory, deleteCategoryById, getProByCata, 
     updateCateById, insertUser, deleteUserById, updateUserById,
     getProducts, getByKey, getLimitPro, deleteProductByKey,
     getSimilarProducts, register, login, getHotPro,
     getViewCount, changePassword, forgotPassword, 
     getAuthor, insertAuthor, deleteAuthorById, updateAuthorById,
     checkEmailExists, getOrderByIdUser}

//tạo otp code
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }  

//hàm lấy order từ idUser
async function getOrderByIdUser(IdUser) {
    try {
        let order = await orderModel.find({ userId: IdUser });
        if (!order) {
            throw new Error("Người dùng không tồn tại");
        }
        return order;
    } catch (error) {
        console.log("Lỗi: ", error);
        throw error;
    }
}
//kiểm tra xem email đã tồn tại chưa
async function checkEmailExists (email) {
    try {
      const user = await userModel.findOne({ email });
      return !!user; // Trả về true nếu user tồn tại, ngược lại false
    } catch (error) {
      console.log('Error in checkEmailExists function:', error);
      throw error;
    }
  };
//hàm sửa brand
async function updateAuthorById(id, body) {
    try {
        const result = await authorModel.findByIdAndUpdate(id, body, { new: true });
        if (result) {
            return { message: 'Brand updated successfully', data: result };
        } else {
            throw new Error('Brand not found');
        }
    } catch (error) {
        console.error('Error updating brand:', error);
        throw error;
    }
}
//hàm xoá brand
async function deleteAuthorById (id) {
    try {
        const result = await categoryModel.findByIdAndDelete(id);
        if (result) {
            return { message: 'Product deleted successfully', data: result };
        } else {
            throw new Error('Product not found');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
}
//hàm lấy brand
async function getAuthor(){
    try {
        const result = await authorModel.find();
        return result;
    } catch (error) {
        console.log('loi getAuthor',error);
        throw error;
    }
}

//hàm thêm brand
async function insertAuthor(body){
    try{
        const {name, bio} = body;
        const newbrand = new authorModel({
            name,
            bio
        });
        // Lưu vào collection categories
        const result = await newbrand.save();
        return result;
    }catch(error){
        console.log('Lỗi khi thêm brand:', error);
        throw error;
    }
}
// Hàm đổi mật khẩu
async function changePassword(email, oldPassword, newPassword) {
    try {
        // Tìm kiếm người dùng bằng email
        let user = await userModel.findOne({ email: email });
        if (!user) {
            throw new Error("Người dùng không tồn tại");
        }
        // Kiểm tra mật khẩu cũ
        const validPassword = bcrypt.compareSync(oldPassword, user.pass);
        if (!validPassword) {
            throw new Error("Mật khẩu cũ không chính xác");
        }
        // Tạo hash cho mật khẩu mới
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(newPassword, salt);
        // Cập nhật mật khẩu mới
        user.pass = hash;
        const result = await user.save();
        return result;
    } catch (error) {
        console.log("Lỗi đổi mật khẩu: ", error);
        throw error;
    }
}

// Hàm quên mật khẩu (đặt lại mật khẩu)
async function forgotPassword(email, newPassword) {
    try {
        // Tìm kiếm người dùng bằng email
        let user = await userModel.findOne({ email: email });
        if (!user) {
            throw new Error("Người dùng không tồn tại");
        }
        // Tạo hash cho mật khẩu mới
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(newPassword, salt);
        // Cập nhật mật khẩu mới
        user.pass = hash;
        const result = await user.save();
        return result;
    } catch (error) {
        console.log("Lỗi quên mật khẩu: ", error);
        throw error;
    }
}


async function getViewCount(){
    try {
        const viewestProducts = await productModel.find().sort({viewCount: -1}).limit(8);
        return viewestProducts;
    } catch (error) {
        console.log("loi getViewCount",error);
                throw error;
    }
}
     
async function getHotPro(){
    try {
        const hotProducts = await productModel.find({ hot: { $gt: 0 } });
        return hotProducts;
    } catch (error) {
        console.log("loi getHot",error);
                throw error;
    }
}

async function login(body){
    try {
        //lấy dữ liệu
        const { email, pass } = body;
        //kiễm tra email
        let user = await userModel.findOne({ email: email});
        if (!user) {
            throw new Error("Email không tồn tại!");
        }
        //kiểm tra pass
        const checkpass = bcrypt.compareSync(pass, user.pass);
        if (!checkpass) {
            throw new Error("Mật khẩu không chính xác");
        }
        //xóa field pass
        delete user._doc.pass;
        //tạo token
        const token = jwt.sign(
            {_id: user._id, email: user.email, role: user.role},
            'kchi',//key secert
            {expiresIn: 1 * 1 * 60 * 60}// thoi gian het cua token
        )
        user = {...user._doc, token}
        return user
    } catch (error) {
        console.log("Lỗi đăng nhập", error);
        throw error
    }
}



async function register(body) {
    try {
      const {
        email,
        pass,
        name,
        phone,
        url_image,
        role
      } = body;
      
      // Kiểm tra email đã tồn tại chưa
      let user = await userModel.findOne({ email: email });
      if (user) {
        throw new Error("Email đã tồn tại");
      }
      
      // Hash mật khẩu
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(pass, salt);
      
      // Tạo OTP và đặt is_verified là false
      const otp = generateOTP();
      
      // Tạo user mới – không cần truyền trường `date` vì đã có default
      user = new userModel({
        _id: new mongoose.Types.ObjectId(),
        email,
        name,
        pass: hash,
        phone,
        otp_code: otp,          // Lưu OTP vừa tạo vào database
        is_verified: false,     // Chưa xác thực
        url_image,
        role: role || "0"       // Nếu role không được đăng ký, thiết lập mặc định
      });
      
      // Lưu user vào database
      const result = await user.save();
      
      // Sau khi lưu, bạn có thể gửi OTP đến người dùng qua email/SMS ở đây.
      // Ví dụ: sendOtpToUser(email, otp);
      
      return result;
    } catch (error) {
      console.log("Lỗi đăng ký: ", error);
      throw error;
    }
  }
  
async function getSimilarProducts(categoryId) {
try {
    // Sử dụng phương thức find để lấy tất cả các sản phẩm có cùng categoryId
    let similarProducts = await productModel.find({ 'category.categoryId': categoryId });

    return similarProducts;
} catch (error) {
    console.log('Lỗi khi lấy sản phẩm tương tự: ', error);
}
}
    

async function deleteProductByKey(key, value){
try {
    // Tìm và xóa sản phẩm có thuộc tính key chính xác bằng value
    let deletedProduct = await productModel.findOneAndDelete({[key]: value});

    if(deletedProduct) {
        console.log(`Đã xóa sản phẩm: ${deletedProduct.name}`);
        return deletedProduct;
    } else {
        console.log('Không tìm thấy sản phẩm để xóa');
        return null;
    }
} catch (error) {
    console.log('Lỗi khi xóa sản phẩm:', error);
}
}    

async function getLimitPro(){
try {
    const result = await productModel.find().sort({price: -1}).limit(8);
    return result;
} catch (error) {
    console.log('loi getlimit',error);
    throw error;
}
}

async function getProducts(page, limit) {
try {
    // Chuyển đổi từ số trang và giới hạn số lượng thành số lượng bản ghi cần bỏ qua
    const skipCount = (page - 1) * limit;

    // Lấy sản phẩm từ cơ sở dữ liệu
    const products = await productModel.find().skip(skipCount).limit(limit);

    return products;
} catch (error) {
    console.log('Lỗi khi lấy sản phẩm:', error);
    throw error;
}
}

async function updateUserById(id, body) {
try {
    const pro = await userModel.findById(id);
    if (!pro) {
        throw new Error('Không tìm thấy danh mục');
    }
    const { email, pass, name, phone, role, address } = body;
    const result = await userModel.findByIdAndUpdate(
        id,
        { email, pass, name, phone, role, address },
        { new: true }
    );
    return result;
} catch (error) {
    console.log('Lỗi update theo id', error);
    throw error;
}
}
    
async function deleteUserById (id) {
    try {
        const result = await userModel.findByIdAndDelete(id);
        if (result) {
            return { message: 'Product deleted successfully', data: result };
        } else {
            throw new Error('Product not found');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
}

async function insertUser(body) {
    try {
        const { email, pass, name, phone, role, address } = body;

        // Tạo một đối tượng user mới
        const newUser = new userModel({
            _id: new mongoose.Types.ObjectId(),
            email,
            pass,
            name,
            phone,
            role,
            address
        });
        // Lưu user vào cơ sở dữ liệu
        const result = await newUser.save();

        return result;
    } catch (error) {
        console.log('Lỗi khi thêm user:', error);
        throw error;
    }
}

async function getProByCata(categoryId){
    try {
        const products = await productModel.find({ 'category.categoryId': categoryId });
        return products;
    } catch (error) {
        console.error('Lỗi lấy sản phẩm theo danh mục: ', error);
        throw error;
    }
}

async function getUsers(){
    try {
        const result = await userModel.find();
        return result;
    } catch (error) {
        console.log('loi getCategory',error);
        throw error;
    }
}

async function deleteById (id) {
    try {
        const result = await productModel.findByIdAndDelete(id);
        if (result) {
            return { message: 'Product deleted successfully', data: result };
        } else {
            throw new Error('Product not found');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
}

async function deleteCategoryById (id) {
    try {
        const result = await categoryModel.findByIdAndDelete(id);
        if (result) {
            return { message: 'Product deleted successfully', data: result };
        } else {
            throw new Error('Product not found');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
}

async function getCategory(){
    try {
        const result = await categoryModel.find();
        return result;
    } catch (error) {
        console.log('loi getCategory',error);
        throw error;
    }
}



async function insert(body) {
    try {
      const {
        name,
        title,
        description,
        price,
        stock,
        weight,
        size,
        pages,
        language,
        format,
        published_date,
        publisher,
        sale_cout,
        category,  // Đây là id của Category
        author,    // Đây là id của Author
        discount   // Đây là id của Discount
      } = body;
      
      // Kiểm tra xem Category có tồn tại không
      const categoryFind = await categoryModel.findById(category);
      if (!categoryFind) {
        throw new Error('Không tìm thấy category');
      }
      
      // Tương tự, bạn có thể kiểm tra Author và Discount nếu cần
      const authorFind = await authorModel.findById(author);
      if (!authorFind) {
        throw new Error('Không tìm thấy author');
      }
      
      const discountFind = await discountModel.findById(discount);
      if (!discountFind) {
        throw new Error('Không tìm thấy discount');
      }
      
      // Tạo mới sản phẩm với các trường được liên kết
      const proNew = new productModel({
        name,
        title,
        description,
        price,
        stock,
        weight,
        size,
        pages,
        language,
        format,
        published_date,
        publisher,
        sale_cout,
        category,  // chỉ cần truyền id
        author,    // chỉ cần truyền id
        discount   // chỉ cần truyền id
      });
      
      // Lưu vào collection products
      const result = await proNew.save();
      return result;
    } catch (error) {
      console.log('Lỗi khi insert product', error);
      throw error;
    }
  }

async function insertCategory(body){
    try{
        const {name, description, img} = body;
        const newCategory = new categoryModel({
            name,
            description,
            img
        });
        // Lưu vào collection categories
        const result = await newCategory.save();
        return result;
    }catch(error){
        console.log('Lỗi khi thêm danh mục:', error);
        throw error;
    }
}

async function getAll(body){
    try{
        const result = 
        await productModel.find()
        return result;
    }catch(error){
        console.log('loi GetAll',error);
        throw error;
    }
}

async function getNewPro(){
    try {
        const result = await productModel.find().sort({_id: -1}).limit(8)
        return result;
    } catch (error) {
        console.log('loi getnewpro',error);
        throw error;
    }
}

async function getByKey(key, value){
    try {
        // Sử dụng biểu thức chính quy để tìm kiếm tương đối
        let regex = new RegExp(value, 'i'); // 'i' là cờ không phân biệt hoa thường

        // Sử dụng phương thức find thay vì findOne để lấy tất cả các kết quả phù hợp
        let results = await productModel.find({[key]: regex}, 'name price quantity images');

        // Chuyển đổi kết quả thành định dạng mong muốn
        results = results.map(result => ({
            Masp: result._id,
            Ten: result.name,
            Gia: result.price,
            SoLuong: result.stock,    
            Hinh: result.images
        }));

        return results;
    } catch (error) {
        console.log('lỗi get prodcut by key: ',error);
    }
}

async function updateById(id, body) {
    try {
      // Tìm sản phẩm theo id
      const pro = await productModel.findById(id);
      if (!pro) {
        throw new Error('Không tìm thấy sản phẩm');
      }
      
      // Lấy các trường cần cập nhật từ body
      const {
        name,
        title,
        description,
        price,
        stock,
        weight,
        size,
        pages,
        language,
        format,
        published_date,
        publisher,
        sale_cout,
        category,  // Đây là id của Category
        author,    // Đây là id của Author
        discount   // Đây là id của Discount
      } = body;
      
      // Chuẩn bị object update, chỉ cập nhật những field được truyền (nếu không, giữ nguyên cũ)
      const updateData = {};
      if (name) updateData.name = name;
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (price) updateData.price = price;
      if (stock) updateData.stock = stock;
      if (weight) updateData.weight = weight;
      if (size) updateData.size = size;
      if (pages) updateData.pages = pages;
      if (language) updateData.language = language;
      if (format) updateData.format = format;
      if (published_date) updateData.published_date = published_date;
      if (publisher) updateData.publisher = publisher;
      if (sale_cout) updateData.sale_cout = sale_cout;
      
      // Nếu cập nhật category, kiểm tra xem id đó có tồn tại không
      if (category) {
        const categoryFind = await categoryModel.findById(category);
        if (!categoryFind) {
          throw new Error('Không tìm thấy category');
        }
        updateData.category = category; // Lưu trực tiếp ID của category
      }
      
      // Tương tự, nếu cung cấp author, kiểm tra
      if (author) {
        const authorFind = await authorModel.findById(author);
        if (!authorFind) {
          throw new Error('Không tìm thấy author');
        }
        updateData.author = author;
      }
      
      // Tương tự, nếu cung cấp discount, kiểm tra
      if (discount) {
        const discountFind = await discountModel.findById(discount);
        if (!discountFind) {
          throw new Error('Không tìm thấy discount');
        }
        updateData.discount = discount;
      }
      
      // Thực hiện cập nhật và trả về kết quả mới (new:true)
      const result = await productModel.findByIdAndUpdate(id, updateData, { new: true });
      return result;
      
    } catch (error) {
      console.log('Lỗi update theo id', error);
      throw error;
    }
  }
  
async function updateCateById(id, body) {
    try {
        const pro = await categoryModel.findById(id);
        if (!pro) {
            throw new Error('Không tìm thấy danh mục');
        }
        const { name, img, description } = body;
        const result = await categoryModel.findByIdAndUpdate(
            id,
            { name, img, description },
            { new: true }
        );
        return result;
    } catch (error) {
        console.log('Lỗi update theo id', error);
        throw error;
    }
}

//xoa  