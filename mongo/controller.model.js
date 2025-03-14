const productModel = require('./product.model')
const categoryModel = require('./category.model')
const authorModel = require('./author.model')
const discountModel = require('./discount.model')
const userModel = require('./user.model')
const orderModel = require('./order.model')
const bannerModel = require('./banner.model');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const imagesModel = require('./images.model')
const { sendMail } = require('../hepler/sendmail')
const publisherModel = require('./publisher.model')
module.exports = {
    insert, getAll, updateById,
    getNewPro, getCategory, getUsers, deleteById,
    insertCategory, deleteCategoryById, getProByCata,
    updateCateById, insertUser, deleteUserById, updateUserById,
    getProducts, getByKey, getLimitPro, deleteProductByKey,
    getSimilarProducts, register, login, getHotPro,
    getViewCount, changePassword, forgotPassword,
    getAuthor, insertAuthor, deleteAuthorById, updateAuthorById,
    checkEmailExists, getOrderByIdUser, updateDiscount, getDiscountById,
    insertImages, getImages, addNewProduct, getImagesByProductId,
    verifyOTP, getBanners, createBanner, updateBanner,
    deleteBanner, getPublisher, insertPublisher, deletePublisherById,
    updatePublisherById, getAllDiscounts, createDiscount, deleteDiscount
}

// controllers/discountController.js


/**
 * Tạo mới discount
 */
async function createDiscount(req, res) {
  try {
    const { value, code, start_date, end_date, is_active } = req.body;
    const discount = new discountModel({ value, code, start_date, end_date, is_active });
    await discount.save();
    res.status(201).json({
      message: "Discount created successfully",
      discount
    });
  } catch (error) {
    console.error("Error creating discount:", error);
    res.status(500).json({ message: "Error creating discount", error });
  }
};

/**
 * Lấy danh sách tất cả discount
 */
async function getAllDiscounts (req, res) {
  try {
    const discounts = await discountModel.find({});
    res.status(200).json({ discounts });
  } catch (error) {
    console.error("Error fetching discounts:", error);
    res.status(500).json({ message: "Error fetching discounts", error });
  }
};

/**
 * Lấy discount theo id
 */
async function getDiscountById (req, res) {
  try {
    const { id } = req.params;
    const discount = await discountModel.findById(id);
    if (!discount) {
      return res.status(404).json({ message: "Discount not found" });
    }
    res.status(200).json( { discount } );
  } catch (error) {
    console.error("Error fetching discount:", error);
    res.status(500).json({ message: "Error fetching discount", error });
  }
};

/**
 * Cập nhật discount theo id
 */
async function updateDiscount (req, res) {
  try {
    const { id } = req.params;
    const { value, code, start_date, end_date, is_active } = req.body;
    const discount = await discountModel.findByIdAndUpdate(
      id,
      { value, code, start_date, end_date, is_active },
      { new: true }
    );
    if (!discount) {
      return res.status(404).json({ message: "Discount not found" });
    }
    res.status(200).json({
      message: "Discount updated successfully",
      discount
    });
  } catch (error) {
    console.error("Error updating discount:", error);
    res.status(500).json({ message: "Error updating discount", error });
  }
};

/**
 * Xóa discount theo id
 */
async function deleteDiscount (req, res) {
  try {
    const { id } = req.params;
    const discount = await discountModel.findByIdAndDelete(id);
    if (!discount) {
      return res.status(404).json({ message: "Discount not found" });
    }
    res.status(200).json({ message: "Discount deleted successfully" });
  } catch (error) {
    console.error("Error deleting discount:", error);
    res.status(500).json({ message: "Error deleting discount", error });
  }
};

//hàm sửa nxb
async function updatePublisherById(id, body) {
    try {
        const result = await publisherModel.findByIdAndUpdate(id, body, { new: true });
        if (result) {
            return { message: 'Sửa nxb thành công', data: result };
        } else {
            throw new Error('Ko tìm thấy nxb');
        }
    } catch (error) {
        console.error('lỗi sửa nxb:', error);
        throw error;
    }
}

//hàm xoá nxb
async function deletePublisherById(id) {
    try {
        // Kiểm tra xem có sản phẩm nào sử dụng tác giả này hay không
        const count = await productModel.countDocuments({ publisher: id });
        if (count > 0) {
            throw new Error(`Không thể xóa tác giả vì có ${count} sản phẩm đang sử dụng`);
        }

        // Nếu không có sản phẩm nào liên kết, tiến hành xóa
        const result = await publisherModel.findByIdAndDelete(id);
        if (result) {
            return { message: 'NXB Xóa thành công', data: result };
        } else {
            throw new Error('Nxb not found');
        }
    } catch (error) {
        console.error('Error deleting nxb:', error);
        throw error;
    }
}

//hàm thêm nxb
async function insertPublisher(body) {
    try {
        const { name, is_active } = body;
        const newPublisher = new publisherModel({
            name,
            is_active: true
        });
        const result = await newPublisher.save();
        return result;
    } catch (error) {
        console.log('Lỗi khi thêm nxb:', error);
        throw error;
    }
}
//hàm lấy danh sách publisher
async function getPublisher() {
    try {
        const result = await publisherModel.find();
        return result;
    } catch (error) {
        console.log('loi getPublisher', error);
        throw error;
    }
}
// Lấy danh sách banner
async function getBanners(req, res) {
    try {
        const banners = await bannerModel.find()
        return banners;
    } catch (error) {
        console.error("Có lỗi khi lấy danh sách banner:", error);
        return res.status(500).json({ message: "Có lỗi khi lấy danh sách banner", error });
    }
}

// Tạo banner mới
async function createBanner(body, res) { // Added 'res' as a parameter
    try {
        const { image_url, title, position, is_active } = body;
        // Set is_active to true if it is not provided in the body
        const isActive = is_active !== undefined ? is_active : true;
        const newBanner = new bannerModel({
            _id: new mongoose.Types.ObjectId(),
            image_url,
            title,
            position,
            is_active: isActive
        });
        const result = await newBanner.save();
        return result;
    } catch (error) {
        console.error("Có lỗi khi tạo banner:", error);
        return { message: "Có lỗi khi tạo banner", error }; // Return error message and details
    }
}

// Cập nhật banner
async function updateBanner(id, body) {
    try {
        const banner = await bannerModel.findById(id);
        if (!banner) {
            throw new Error('Không tìm thấy banner');
        }
        const { image_url, title, position, is_active } = body;
        const result = await bannerModel.findByIdAndUpdate(
            id,
            { image_url, title, position, is_active },
            { new: true }
        );
        return result;
    } catch (error) {
        console.log('Lỗi update theo id', error);
        throw error;
    }
}

// Xóa banner
async function deleteBanner(id) {
    try {
        const deletedBanner = await bannerModel.findByIdAndDelete(id);
        if (deletedBanner) {
            return { message: 'banner xóa thành công', data: deletedBanner };
        } else {
            throw new Error('Product not found');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
}

//sát thức otp
async function verifyOTP({ userId, otp }) {
    try {
        if (!userId || !otp) {
            throw new Error("Thiếu thông tin userId hoặc OTP");
        }

        const user = await userModel.findById(userId);
        if (!user) {
            throw new Error("Không tìm thấy user");
        }

        if (user.otp_code !== otp) {
            return { verified: false, message: "OTP không chính xác" };
        }

        // Nếu OTP khớp, sử dụng updateOne với $unset để xóa trường otp_code
        await userModel.updateOne(
            { _id: userId },
            {
                $set: { is_verified: true },
                $unset: { otp_code: "" }  // Xóa trường otp_code
            }
        );

        // Lấy lại user đã được cập nhật
        const updatedUser = await userModel.findById(userId);
        return { verified: true, user: updatedUser };
    } catch (error) {
        console.error("Lỗi xác thực OTP:", error);
        throw error;
    }
};
//get hình ảnh bằng id product
async function getImagesByProductId(id) {
    try {
        // Tìm các ảnh có productId khớp với tham số được truyền vào
        const images = await imagesModel.find({ 'productId': id });
        return images;
    } catch (error) {
        console.error("Có lỗi khi lấy hình ảnh cho sản phẩm:", error);
        throw error;
    }
}
async function updateById(productId, productData, images) {
    // Khởi tạo session
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Tìm sản phẩm theo productId và sử dụng session
        const product = await productModel.findById(productId).session(session);
        if (!product) {
            throw new Error('Không tìm thấy sản phẩm');
        }

        // Nếu có cập nhật cho category, kiểm tra sự tồn tại của category đó
        if (productData.category) {
            const categoryFind = await categoryModel.findById(productData.category).session(session);
            if (!categoryFind) {
                throw new Error('Không tìm thấy category');
            }
        }

        // Nếu có cập nhật cho author, kiểm tra sự tồn tại của author
        if (productData.author) {
            const authorFind = await authorModel.findById(productData.author).session(session);
            if (!authorFind) {
                throw new Error('Không tìm thấy author');
            }
        }

        // Nếu có cập nhật cho discount, kiểm tra sự tồn tại của discount
        if (productData.discount) {
            const discountFind = await discountModel.findById(productData.discount).session(session);
            if (!discountFind) {
                throw new Error('Không tìm thấy discount');
            }
        }

        // Cập nhật sản phẩm với các trường mới (chỉ cập nhật nếu có dữ liệu mới)
        const updatedProduct = await productModel.findByIdAndUpdate(
            productId,
            productData,
            { new: true, session }
        );

        // Xử lý cập nhật ảnh:
        // Ta thực hiện xóa hết các ảnh cũ liên quan đến sản phẩm này
        await imagesModel.deleteMany({ productId }, { session });

        // Nếu có hình ảnh mới được truyền vào (mảng images không rỗng)
        if (images && images.length > 0) {
            const newImagesData = images.map(image => ({
                productId,
                url: image.url,
                // Thêm các trường khác nếu cần.
            }));
            // Chèn các ảnh mới vào collection cùng với session.
            await imagesModel.insertMany(newImagesData, { session });
        }

        // Commit transaction nếu mọi thứ đều thành công
        await session.commitTransaction();
        session.endSession();

        return updatedProduct;
    } catch (error) {
        // Nếu gặp lỗi, rollback transaction và ném lỗi ra
        await session.abortTransaction();
        session.endSession();
        console.error('Error in transaction update:', error);
        throw error;
    }
}
//thêm sản phẩm và hình ảnh
async function addNewProduct(productData, images) {
    // Tạo một session mới
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Bước 1: Tạo sản phẩm mới trong collection Product.
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
            sale_count,
            category,  // Đây là id của Category
            author,    // Đây là id của Author
            discount   // Đây là id của Discount
        } = productData;
        // Kiểm tra xem Category có tồn tại không
        const categoryFind = await categoryModel.findById(category);
        if (!categoryFind) {
            throw new Error('Không tìm thấy category', categoryFind);
        }

        // Tương tự, bạn có thể kiểm tra Author và Discount nếu cần
        const authorFind = await authorModel.findById(author);
        if (!authorFind) {
            throw new Error('Không tìm thấy author');
        }

        // Tương tự, bạn có thể kiểm tra Author và Discount nếu cần
        const publisherFind = await publisherModel.findById(publisher);
        if (!publisherFind) {
            throw new Error('Không tìm thấy nxb');
        }
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
            sale_count: 0,
            category,  // chỉ cần truyền id
            author,    // chỉ cần truyền id
            discount   // chỉ cần truyền id
        });
        // Nếu hàm insert của bạn hỗ trợ truyền session, hãy dùng:
        const newProduct = await proNew.save();
        // console.log(newProduct);

        const productId = newProduct._id; // Lấy _id của sản phẩm mới tạo

        // Bước 2: Xử lý dữ liệu cho ảnh dựa trên productId vừa tạo
        const imageData = images.map(image => ({
            productId: productId,
            url: image.url,
            // Thêm các trường khác nếu cần
        }));

        // Thêm ảnh vào collection ProductImage cùng với session
        await imagesModel.insertMany(imageData, { session });

        // Nếu mọi thao tác đều thành công, commit transaction
        await session.commitTransaction();
        session.endSession();

        return newProduct;
    }
    catch (error) {
        // Nếu có lỗi, rollback transaction
        await session.abortTransaction();
        session.endSession();
        console.error("Error in transaction:", error);
        throw error;
    }
}

//truy vấn images
async function getImages(body) {
    try {
        const result =
            await imagesModel.find()
        return result;
    } catch (error) {
        console.log('Lỗi khi getimages:', error);
        throw error;
    }
}
//thêm images
async function insertImages(body) {
    try {
        const { url, productId } = body;
        const productFind = await productModel.findById(productId);
        if (!productFind) {
            throw new Error('Không tìm thấy images');
        }
        const newImages = new imagesModel({
            url,
            productId
        });
        // Lưu vào collection categories
        const result = await newImages.save();
        return result;
    } catch (error) {
        console.log('Lỗi khi thêm sản phẩm:', error);
        throw error;
    }
}
//tạo otp code
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

//thêm discount
// async function insertDiscount(body) {
//     try {
//         const { value, code, start_date, end_date, is_active } = body;
//         const newDiscount = new discountModel({
//             value,
//             code,
//             start_date,
//             end_date,
//             is_active
//         });
//         // Lưu vào collection categories
//         const result = await newDiscount.save();
//         return result;
//     } catch (error) {
//         console.log('Lỗi khi thêm discount:', error);
//         throw error;
//     }
// }

//getAllDiscount
// async function getDiscount(body) {
//     try {
//         const result =
//             await discountModel.find()
//         return result;
//     } catch (error) {
//         console.log('loi GetAllDiscount', error);
//         throw error;
//     }
// }

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
async function checkEmailExists(email) {
    try {
        const user = await userModel.findOne({ email });
        return !!user; // Trả về true nếu user tồn tại, ngược lại false
    } catch (error) {
        console.log('Error in checkEmailExists function:', error);
        throw error;
    }
};
//hàm sửa tác giả
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
//hàm xoá author
async function deleteAuthorById(id) {
    try {
        // Kiểm tra xem có sản phẩm nào sử dụng tác giả này hay không
        const count = await productModel.countDocuments({ author: id });
        if (count > 0) {
            throw new Error(`Không thể xóa tác giả vì có ${count} sản phẩm đang sử dụng`);
        }

        // Nếu không có sản phẩm nào liên kết, tiến hành xóa
        const result = await authorModel.findByIdAndDelete(id);
        if (result) {
            return { message: 'Author deleted successfully', data: result };
        } else {
            throw new Error('Author not found');
        }
    } catch (error) {
        console.error('Error deleting author:', error);
        throw error;
    }
}

//hàm lấy brand
async function getAuthor() {
    try {
        const result = await authorModel.find();
        return result;
    } catch (error) {
        console.log('loi getAuthor', error);
        throw error;
    }
}

//hàm thêm brand
async function insertAuthor(body) {
    try {
        const { name, bio } = body;
        const newbrand = new authorModel({
            name,
            bio
        });
        // Lưu vào collection categories
        const result = await newbrand.save();
        return result;
    } catch (error) {
        console.log('Lỗi khi thêm tác giả:', error);
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


async function getViewCount() {
    try {
        const viewestProducts = await productModel.find().sort({ viewCount: -1 }).limit(8);
        return viewestProducts;
    } catch (error) {
        console.log("loi getViewCount", error);
        throw error;
    }
}

async function getHotPro() {
    try {
        const hotProducts = await productModel.find().sort({ sale_count: -1 });
        return hotProducts;
    } catch (error) {
        console.log("loi getHot", error);
        throw error;
    }
}

// async function to login a user
// async function to login a user
async function login(body) {
    try {
        // get data
        //lấy dữ liệu
        const { email, pass } = body;
        // check email
        //kiễm tra email
        let user = await userModel.findOne({ email: email });
        if (!user) {
            // throw error if email does not exist
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
            { _id: user._id, email: user.email, role: user.role },
            'kchi',//key secert
            { expiresIn: 1 * 1 * 60 * 60 }// thoi gian het cua token
        )
        user = { ...user._doc, token }
        return user
    } catch (error) {
        console.log("Lỗi đăng nhập", error);
        throw error
    }
}



async function register(body) {
    try {
        const { email, pass, name, phone, url_image, role } = body;

        // Kiểm tra email đã tồn tại chưa
        let user = await userModel.findOne({ email });
        if (user) {
            throw new Error("Email đã tồn tại");
        }

        // Hash mật khẩu
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(pass, salt);

        // Tạo OTP
        const otp = generateOTP();

        // Tạo user mới
        user = new userModel({
            _id: new mongoose.Types.ObjectId(),
            email,
            name,
            pass: hash,
            phone,
            otp_code: otp,          // Lưu OTP vừa tạo vào database
            is_verified: false,     // Chưa xác thực
            url_image: "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
            role: role || "0"       // Nếu role không được đăng ký, thiết lập mặc định
        });
        // Lưu user vào database
        const result = await user.save();

        // Gửi email xác thực "fire-and-forget" không đợi kết quả gửi mail
        sendMail({
            email,
            subject: 'Xác thực tài khoản',
            html: `<p>Vui lòng nhập mã OTP: ${otp} để xác thực tài khoản của bạn.</p>`
        }).catch(error => {
            // Log lỗi gửi mail, hoặc xử lý theo cách bạn muốn nhưng không làm gián đoạn flow
            console.error("Lỗi khi gửi email:", error);
        });

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


async function deleteProductByKey(key, value) {
    try {
        // Tìm và xóa sản phẩm có thuộc tính key chính xác bằng value
        let deletedProduct = await productModel.findOneAndDelete({ [key]: value });

        if (deletedProduct) {
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

async function getLimitPro() {
    try {
        const result = await productModel.find().sort({ price: -1 }).limit(8);
        return result;
    } catch (error) {
        console.log('loi getlimit', error);
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

async function deleteUserById(id) {
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

async function getProByCata(categoryId) {
    try {
        const products = await productModel.find({ category: mongoose.Types.ObjectId(categoryId) });
        return products;
    } catch (error) {
        console.error('Lỗi lấy sản phẩm theo danh mục: ', error);
        throw error;
    }
}

async function getUsers() {
    try {
        const result = await userModel.find();
        return result;
    } catch (error) {
        console.log('loi getUser', error);
        throw error;
    }
}

async function deleteById(id) {
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
//xóa category
async function deleteCategoryById(id) {
    try {
        // Kiểm tra xem có sản phẩm nào sử dụng danh mục này hay không
        const count = await productModel.countDocuments({ category: id });
        if (count > 0) {
            throw new Error(`Không thể xóa danh mục vì có ${count} sản phẩm đang sử dụng`);
        }

        // Nếu không có sản phẩm nào liên kết, tiến hành xóa
        const result = await categoryModel.findByIdAndDelete(id);
        if (result) {
            return { message: 'Category deleted successfully', data: result };
        } else {
            throw new Error('Category not found');
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
}


async function getCategory() {
    try {
        const result = await categoryModel.find();
        return result;
    } catch (error) {
        console.log('loi getCategory', error);
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
            sale_count,
            category,  // Đây là id của Category
            author,    // Đây là id của Author
            discount   // Đây là id của Discount
        } = body;

        // Kiểm tra xem Category có tồn tại không
        const categoryFind = await categoryModel.findById(category);
        if (!categoryFind) {
            throw new Error('Không tìm thấy category', categoryFind);
        }


        // Tương tự, bạn có thể kiểm tra Author và Discount nếu cần
        const authorFind = await authorModel.findById(author);
        if (!authorFind) {
            throw new Error('Không tìm thấy author');
        }

        // Tương tự, bạn có thể kiểm tra Author và Discount nếu cần
        const publisherFind = await publisherModel.findById(publisher);
        if (!publisherFind) {
            throw new Error('Không tìm thấy nxb');
        }

        //   const discountFind = await discountModel.findById(discount);
        //   if (!discountFind) {
        //     throw new Error('Không tìm thấy discount');
        //   }

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
            sale_count: 0,
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

async function insertCategory(body) {
    try {
        const { name, type, is_active } = body;
        const newCategory = new categoryModel({
            name,
            type,
            is_active
        });
        // Lưu vào collection categories
        const result = await newCategory.save();
        return result;
    } catch (error) {
        console.log('Lỗi khi thêm danh mục:', error);
        throw error;
    }
}

async function getAll(body) {
    try {
        const result =
            await productModel.find().sort({ _id: -1 })
        return result;
    } catch (error) {
        console.log('loi GetAll', error);
        throw error;
    }
}

async function getNewPro() {
    try {
        const result = await productModel.find().sort({ _id: -1 }).limit(8)
        return result;
    } catch (error) {
        console.log('loi getnewpro', error);
        throw error;
    }
}

async function getByKey(key, value) {
    try {
        // Sử dụng biểu thức chính quy để tìm kiếm tương đối
        let regex = new RegExp(value, 'i'); // 'i' là cờ không phân biệt hoa thường

        // Sử dụng phương thức find thay vì findOne để lấy tất cả các kết quả phù hợp
        let results = await productModel.find({ [key]: regex }, 'name price quantity images');

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
        console.log('lỗi get prodcut by key: ', error);
    }
}

async function updateCateById(id, body) {
    try {
        const pro = await categoryModel.findById(id);
        if (!pro) {
            throw new Error('Không tìm thấy danh mục');
        }
        const { name, type, is_active } = body;
        const result = await categoryModel.findByIdAndUpdate(
            id,
            { name, type, is_active },
            { new: true }
        );
        return result;
    } catch (error) {
        console.log('Lỗi update theo id', error);
        throw error;
    }
}

//xoa  