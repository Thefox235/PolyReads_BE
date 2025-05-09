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
const commentModel = require('./comment.model')
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET || 'kchi';
const googleClient = new OAuth2Client(CLIENT_ID);
const paymentModel = require('./payment.model');
const addressModel = require('./address.model');
const OrderDetail = require('./order_detail.model');
const postModel = require('./post.model');
const favoriteModel = require("./favorite.model");
const crypto = require('crypto');
const querystring = require('querystring');
const axios = require('axios');
const slugify = require('slugify');
const { log } = require('console')
require('dotenv').config();
const qs = require("qs");
const moment = require("moment");
const order_detailModel = require('./order_detail.model')

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
    updatePublisherById, getAllDiscounts, createDiscount, deleteDiscount,
    deleteComment, updateComment, getComments, createComment,
    resendOtp, resetPassword, verifyForgotPasswordOTP, sendForgotPasswordOTP,
    createVNPayPaymentIntent, createMomoPaymentIntent, deleteOrder,
    updateOrder, createOrder, getOrderById, getOrders, deleteAddress,
    updateAddress, createAddress, getAddressById, getAllAddresses,
    getOrderDetailsByOrderId, createOrderDetail, getOrdersByUserId,
    likeComment, unlikeComment, toggleLike, createPost, getPosts,
    getPostBySlug, updatePost, deletePost, getPostById, confirmPayment,
    createFavorite, getFavoritesByUser, getFavoriteById, deleteFavorite,
    getAllFavorites, getProByCataPage, getProductsFilter, getProductSearch,
    calculateShippingFee, getWards, getDistricts, getProvinces, getCities,
    getWardsByDistrict, getDistrictsByCity, getRates, notifyCustomer,
    createFullOrder

}
//
async function createFullOrder(req, res, next) {
    try {
        // Lấy dữ liệu từ req.body
        const {
            name,
            quantity,
            img,
            price,
            status,
            payment_status,
            total,
            userId,
            paymentId,
            addressId,
            customerName,
            customerEmail,
            items  // mảng các sản phẩm, mỗi item có các trường: productId, quantily, price, name
        } = req.body;

        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ message: "items phải là một mảng" });
        }

        // 1. Tạo Order
        const newOrder = new orderModel({
            name,
            quantity,
            img,
            price,
            status,
            payment_status,
            total,
            userId,
            paymentId,
            addressId,
            date: new Date(),
            customerName,
            customerEmail
        });
        const savedOrder = await newOrder.save();

        // 2. Tạo Order Detail cho từng sản phẩm
        const createdItems = await Promise.all(
            items.map(item =>
                OrderDetail.create({
                    orderId: savedOrder._id,
                    productId: item.productId,
                    quantily: item.quantily,
                    price: item.price,
                    name: item.name
                })
            )
        );

        // 3. Cập nhật tồn kho cho mỗi sản phẩm
        await Promise.all(
            items.map(item =>
                productModel.findByIdAndUpdate(
                    item.productId,
                    { $inc: { stock: -item.quantily } }
                )
            )
        );

        // Gộp thông tin order với order detail để gửi email
        const fullOrder = {
            ...savedOrder._doc,
            items: createdItems
        };

        // 4. Gửi email thông báo cho khách hàng
        await notifyCustomer(fullOrder);

        // Trả về response cho FE
        return res.status(201).json({
            message: "Order và order details được tạo thành công, email đã được gửi",
            order: fullOrder
        });
    } catch (error) {
        console.error("Lỗi tạo đơn hàng đầy đủ:", error);
        return res.status(500).json({ message: error.message });
    }
}

// controllers/shippingController.js
async function notifyCustomer (order) {
    // Truy vấn userModel bằng userId từ order
    const user = await userModel.findById(order.userId);
    if (!user || !user.email) {
        throw new Error("Không tìm thấy thông tin email của người dùng.");
    }

    const customerEmail = user.email;
    const customerName = user.name;
    console.log("Sending email to:", customerEmail);

    // Xây dựng nội dung email
    const htmlContent = `
      <p>Chào ${customerName},</p>
      <p>Cảm ơn bạn đã đặt hàng tại Shop của chúng tôi. Dưới đây là thông tin đơn hàng của bạn:</p>
      <p><strong>Mã đơn hàng:</strong> ${order._id}</p>
      <ul>
        ${order.items.map((item) =>
        `<li>${item.name} - ${item.quantily} x ${new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(item.price)} = ${new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(item.price * item.quantily)}</li>`
    ).join('')}
      </ul>
      <p><strong>Tổng tiền:</strong> ${new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(order.total)}</p>
      <p>Chúng tôi sẽ nhanh chóng xử lý đơn hàng của bạn và thông báo khi đơn hàng được giao.</p>
      <p>Trân trọng,</p>
      <p>Team Shop</p>
    `;

    const subject = `Thông báo đơn hàng ${order._id} từ Shop của chúng tôi`;

    // Gửi mail qua nodemailer
    const mailPayload = {
        email: customerEmail, // sử dụng email truy vấn từ userModel
        subject,
        html: htmlContent
    };

    const result = await sendMail(mailPayload);
    console.log("Notification email sent:", result.messageId);
};

//lấy thông tin giao hàng 
async function getRates(req, res) {
    try {
        // Lấy payload từ req.body để sử dụng dữ liệu từ FE
        const payload = req.body;

        // Lấy token từ biến môi trường hoặc sử dụng giá trị tạm thời
        const token = process.env.GOSHIP_TOKEN || 'YOUR_TOKEN_HERE';

        const response = await axios.post(
            'http://sandbox.goship.io/api/v2/rates',
            payload,
            {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return res.status(200).json(response.data);
    } catch (error) {
        console.error(
            "Lỗi khi lấy rates từ Goship:",
            error.response ? error.response.data : error.message
        );
        return res.status(500).json({ message: error.message });
    }
}

async function getDistrictsByCity(req, res) {
    try {
        const { code } = req.params; // Code của thành phố
        const token = process.env.GOSHIP_TOKEN || 'YOUR_TOKEN_HERE';
        const url = `http://sandbox.goship.io/api/v2/cities/${code}/districts`;
        const response = await axios.get(url, {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        return res.status(200).json(response.data);
    } catch (error) {
        console.error("Lỗi khi lấy districts:", error.response ? error.response.data : error.message);
        return res.status(500).json({ message: error.message });
    }
}

/**
 * Lấy danh sách phường theo mã quận/huyện từ Goship Sandbox API
 * Endpoint: http://sandbox.goship.io/api/v2/districts/{code}/wards
 */
async function getWardsByDistrict(req, res) {
    try {
        const { code } = req.params; // Code của quận/huyện
        const token = process.env.GOSHIP_TOKEN || 'YOUR_TOKEN_HERE';
        const url = `http://sandbox.goship.io/api/v2/districts/${code}/wards`;
        const response = await axios.get(url, {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });
        return res.status(200).json(response.data);
    } catch (error) {
        console.error("Lỗi khi lấy wards:", error.response ? error.response.data : error.message);
        return res.status(500).json({ message: error.message });
    }
}

async function getCities(req, res) {
    try {
        // Lấy token từ biến môi trường hoặc thay thế bằng token tĩnh nếu cần
        const token = process.env.GOSHIP_TOKEN || 'YOUR_TOKEN_HERE';

        // Gọi Goship API
        const response = await axios.get('http://sandbox.goship.io/api/v2/cities', {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        });

        // Trả về dữ liệu JSON nhận được từ Goship
        return res.status(200).json(response.data);
    } catch (error) {
        // Log lỗi để gỡ rối
        console.error("Lỗi khi lấy cities từ Goship:", error.response ? error.response.data : error.message);
        return res.status(500).json({ message: error.message });
    }
}

/**
 * Lấy danh sách các tỉnh thành từ GHN.
 */
async function getProvinces(req, res) {
    try {
        const axios = require('axios');
        const url = 'https://online-gateway.ghn.vn/shiip/public-api/master-data/province';
        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Token: process.env.GHN_API_TOKEN  // Lấy token từ biến môi trường
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error in getProvinces:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: error.message });
    }
}

/**
 * Lấy danh sách các quận/huyện từ GHN.
 */
async function getDistricts(req, res) {
    try {
        const axios = require('axios');
        const url = 'https://online-gateway.ghn.vn/shiip/public-api/master-data/district';
        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Token: process.env.GHN_API_TOKEN
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error in getDistricts:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: error.message });
    }
}

/**
 * Lấy danh sách các phường/xã từ GHN dựa theo district_id gửi qua query.
 */
async function getWards(req, res) {
    try {
        const axios = require('axios');
        var district_id = req.query.district_id;
        if (!district_id) {
            res.status(400).json({ message: 'Query parameter "district_id" is required' });
            return;
        }
        const url = 'https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=' + district_id;
        const response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Token: process.env.GHN_API_TOKEN
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error in getWards:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: error.message });
    }
}
async function calculateShippingFee(req, res) {
    try {
        // Nhận các thông tin cần thiết từ req.body do FE truyền lên.
        // Các key này phải khớp với cURL của GHN:
        // service_type_id, from_district_id, from_ward_code, to_district_id, to_ward_code,
        // length, width, height, weight, insurance_value, coupon, items.
        const {
            service_type_id,
            from_district_id,
            from_ward_code,
            to_district_id,
            to_ward_code,
            length,
            width,
            height,
            weight,
            insurance_value,
            coupon,
            items,
        } = req.body;

        // URL cho môi trường test (đổi sang production khi cần)
        const ghnUrl = 'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee';

        // Sử dụng header tương tự như cURL mẫu:
        // Lấy Token và ShopId từ biến môi trường để đảm bảo bảo mật
        const headers = {
            'Content-Type': 'application/json',
            Token: process.env.GHN_API_TOKEN, // Ví dụ: "c518-c4bb-11ea-be3a-f636b1deefb9"
            ShopId: process.env.GHN_SHOP_ID,    // Ví dụ: "885"
        };

        // Xây dựng payload theo đúng cấu trúc của GHN
        const payload = {
            service_type_id,      // VD: 5
            from_district_id,     // VD: 1442
            from_ward_code,       // VD: "21211"
            to_district_id,       // VD: 1820
            to_ward_code,         // VD: "030712"
            length,               // Kích thước kiện hàng (cm), VD: 30
            width,                // VD: 40
            height,               // VD: 20
            weight,               // Trọng lượng (gam), VD: 3000
            insurance_value,      // VD: 0
            coupon,               // Có thể null nếu không có mã ưu đãi
            items,                // Danh sách các món hàng, ví dụ như: [{ name: "TEST1", quantity: 1, length: 200, width: 200, height: 200, weight: 1000 }]
        };

        console.log("Payload gửi đến GHN:", payload);

        // Gửi request POST đến GHN
        const response = await axios.post(ghnUrl, payload, { headers });

        // Kiểm tra mã trạng thái trả về từ GHN
        if (response.data.code !== 200) {
            return res.status(400).json({ message: response.data.message });
        }
        // Trả về data tính phí cho FE (chứa số tiền cước hoặc thông tin cấu hình chi phí)
        return res.json(response.data.data);
    } catch (error) {
        console.error('Lỗi khi tính phí vận chuyển:', error.response ? error.response.data : error.message);
        return res.status(500).json({ message: error.message });
    }

};

//tìm kiếm sản phẩm theo evryhting
async function getProductSearch({ field, keyword, page = 1, limit = 20 }) {
    try {
        // Tạo regex, tìm kiếm có chứa keyword (case-insensitive)
        const regex = new RegExp(keyword, 'i');
        let query = {};

        if (field === 'all') {
            query = {
                $or: [
                    { name: regex },
                    { title: regex },
                    { description: regex }
                    // Bạn có thể thêm các trường khác nếu cần, ví dụ:
                    // { 'categoryName': regex } nếu bạn đã lưu tên danh mục trong product,
                    // { 'authorName': regex } hoặc { 'publisherName': regex }
                ]
            };
        } else if (field === 'category') {
            // Nếu lưu category dưới dạng reference thì bạn có thể cần gọi lookup hoặc sắp xếp dữ liệu khác,
            // Tuy nhiên, nếu product chứa trường categoryName thì:
            query = { categoryName: regex };
        } else if (field === 'author') {
            // Tương tự cho tác giả, nếu product chứa authorName
            query = { authorName: regex };
        } else if (field === 'publisher') {
            query = { publisherName: regex };
        } else {
            // Nếu field là một trong những trường chính của product, dùng trực tiếp:
            query = { [field]: regex };
        }

        const skip = (page - 1) * limit;
        const products = await productModel.find(query)
            .skip(skip)
            .limit(limit);

        return products;
    } catch (error) {
        console.error("Error in getProductSearch:", error);
        throw error;
    }
};

//lấy product theo filter list 
async function getProductsFilter(filter, skip, limit) {
    try {
        const products = await productModel.find(filter)
            .skip(skip)
            .limit(limit)
            .populate('author')
            .populate('publisher')
            .populate('category');
        return products;
    } catch (error) {
        console.error('Lỗi khi truy vấn sản phẩm:', error);
        throw error;
    }
}

//lấy product theo cate có phân trang
async function getProByCataPage(categoryId, page = 1, limit = 20) {
    try {
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skipNum = (pageNum - 1) * limitNum;

        // Sử dụng từ khóa `new` khi tạo ObjectId
        const products = await productModel
            .find({ category: new mongoose.Types.ObjectId(categoryId) })
            .skip(skipNum)
            .limit(limitNum);

        return products;
    } catch (error) {
        console.error('Lỗi lấy sản phẩm theo danh mục với phân trang: ', error);
        throw error;
    }
}
// controllers/favorite.controller.js
async function getAllFavorites(req, res) {
    try {
        const favorites = await favoriteModel.find({})
            .populate("productId")
            .populate("userId");
        return res.status(200).json({ favorites });
    } catch (error) {
        console.error("Lỗi khi lấy tất cả favorite:", error);
        return res.status(500).json({ message: error.message });
    }
}

async function createFavorite(req, res) {
    try {
        const { userId, productId } = req.body;
        if (!userId || !productId) {
            return res.status(400).json({ message: "userId và productId là bắt buộc." });
        }

        // Kiểm tra xem favorite đã tồn tại chưa để tránh trùng lặp
        const existingFavorite = await favoriteModel.findOne({ userId, productId });
        if (existingFavorite) {
            return res.status(400).json({ message: "Favorite đã tồn tại." });
        }

        const favorite = await favoriteModel.create({ userId, productId });
        return res.status(201).json({
            message: "Favorite được tạo thành công",
            favorite
        });
    } catch (error) {
        console.error("Lỗi tạo favorite:", error);
        return res.status(500).json({ message: error.message });
    }
}

async function getFavoritesByUser(req, res) {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ message: "userId là bắt buộc." });
        }

        // Populated nếu cần thông tin chi tiết về sản phẩm và người dùng
        const favorites = await favoriteModel.find({ userId })
            .populate("productId")
            .populate("userId");
        return res.status(200).json({ favorites });
    } catch (error) {
        console.error("Lỗi lấy favorites cho user:", error);
        return res.status(500).json({ message: error.message });
    }
}

async function getFavoriteById(req, res) {
    try {
        const { id } = req.params;
        const favorite = await favoriteModel.findById(id)
            .populate("productId")
            .populate("userId");
        if (!favorite) {
            return res.status(404).json({ message: "Favorite không tồn tại." });
        }
        return res.status(200).json({ favorite });
    } catch (error) {
        console.error("Lỗi lấy favorite theo id:", error);
        return res.status(500).json({ message: error.message });
    }
}

async function deleteFavorite(req, res) {
    try {
        const { id } = req.params;
        const favorite = await favoriteModel.findByIdAndDelete(id);
        if (!favorite) {
            return res.status(404).json({ message: "Favorite không tồn tại." });
        }
        return res.status(200).json({ message: "Favorite đã được xóa thành công." });
    } catch (error) {
        console.error("Lỗi xóa favorite:", error);
        return res.status(500).json({ message: error.message });
    }
}

//
async function confirmPayment(req, res, next) {
    try {
        // FE gửi trường unified 'responseCode' với các quy ước:
        // VNPay: "00" khi thành công, Zalopay: "1" khi thành công
        const { orderId, paymentId, responseCode } = req.body;

        // Xác định trạng thái thanh toán: thành công nếu responseCode là "00" (VNPay) hoặc "1" (Zalopay)
        const newPaymentStatus = (responseCode === '00' || responseCode === '1') ? 'success' : 'failed';

        // Cập nhật Payment theo paymentId
        const updatedPayment = await paymentModel.findByIdAndUpdate(
            paymentId,
            { status: newPaymentStatus },
            { new: true }
        );

        // Quy ước: payment_status của Order: 0: pending, 1: success, 2: failed
        const orderPaymentStatus = newPaymentStatus === 'success' ? 1 : 2;

        // Cập nhật Order theo orderId và lưu luôn paymentId
        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId,
            { payment_status: orderPaymentStatus, paymentId: updatedPayment._id },
            { new: true }
        );

        return res.status(200).json({
            message: "Cập nhật trạng thái thanh toán thành công",
            payment: updatedPayment,
            order: updatedOrder,
        });
    } catch (error) {
        console.error("Lỗi cập nhật trạng thái thanh toán:", error);
        return res.status(500).json({ message: "Lỗi cập nhật trạng thái thanh toán" });
    }
}

//lấy post theo id
// async function to get a post by its id
async function getPostById(req, res) {
    try {
        // get the id from the request parameters
        const { id } = req.params;
        // find the post by its id
        const post = await postModel.findById(id);
        // if the post is not found, return a 404 status code with a message
        if (!post) {
            return res.status(404).json({ message: "Không tìm thấy bài viết" });
        }
        // if the post is found, return a 200 status code with the post
        return res.status(200).json({ post });
    } catch (error) {
        // if there is an error, log it to the console and return a 500 status code with a message and the error
        console.error("Lỗi khi lấy bài viết:", error);
        res.status(500).json({ message: "Lỗi khi lấy bài viết", error: error.message });
    }
}
// Tạo mới bài viết từ dữ liệu gửi lên từ Toast Editor
async function createPost(req, res) {
    try {
        const { title, content, tag, coverImage } = req.body;

        // Tạo slug dựa trên tiêu đề
        const slug = slugify(title, { lower: true, strict: true });

        const newPost = new postModel({
            title,
            content,  // Nội dung HTML hoặc Markdown từ Toast Editor
            tag,
            coverImage,
            slug
        });

        await newPost.save();

        return res.status(201).json({
            message: "Bài viết được tạo thành công",
            post: newPost
        });
    } catch (error) {
        console.error("Lỗi khi tạo bài viết:", error);
        res.status(500).json({ message: "Lỗi khi tạo bài viết", error: error.message });
    }
}

// Lấy danh sách bài viết
async function getPosts(req, res) {
    try {
        // Có thể bổ sung phân trang hoặc filter theo tag
        const posts = await postModel.find().sort({ createdAt: -1 });
        return res.status(200).json({ posts });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách bài viết:", error);
        res.status(500).json({ message: "Lỗi khi lấy danh sách bài viết", error: error.message });
    }
}

// Lấy bài viết theo slug (cho URL thân thiện)
async function getPostBySlug(req, res) {
    try {
        const { slug } = req.params;
        const post = await postModel.findOne({ slug });
        if (!post) {
            return res.status(404).json({ message: "Không tìm thấy bài viết" });
        }
        return res.status(200).json({ post });
    } catch (error) {
        console.error("Lỗi khi lấy bài viết:", error);
        res.status(500).json({ message: "Lỗi khi lấy bài viết", error: error.message });
    }
}

// Cập nhật bài viết
async function updatePost(req, res) {
    try {
        const { id } = req.params;
        const { title, content, tag, coverImage } = req.body;

        const updateData = { updatedAt: new Date() };

        if (title) {
            updateData.title = title;
            updateData.slug = slugify(title, { lower: true, strict: true });
        }
        if (content) {
            updateData.content = content;
        }
        if (tag) {
            updateData.tag = tag;
        }
        if (coverImage) {
            updateData.coverImage = coverImage;
        }

        const updatedPost = await postModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!updatedPost) {
            return res.status(404).json({ message: "Bài viết không tồn tại" });
        }

        return res.status(200).json({ message: "Bài viết được cập nhật thành công", post: updatedPost });
    } catch (error) {
        console.error("Lỗi khi cập nhật bài viết:", error);
        res.status(500).json({ message: "Lỗi khi cập nhật bài viết", error: error.message });
    }
}

// Xóa bài viết
async function deletePost(req, res) {
    try {
        const { id } = req.params;
        const deletedPost = await postModel.findByIdAndDelete(id);
        if (!deletedPost) {
            return res.status(404).json({ message: "Bài viết không tồn tại" });
        }
        return res.status(200).json({ message: "Bài viết đã được xóa thành công" });
    } catch (error) {
        console.error("Lỗi khi xóa bài viết:", error);
        res.status(500).json({ message: "Lỗi khi xóa bài viết", error: error.message });
    }
}

// Hàm lấy đơn hàng theo userId (ví dụ sử dụng query parameter)
async function getOrdersByUserId(req, res) {
    try {
        const userId = req.params.id;
        if (!userId) {
            return res.status(400).json({ message: "Missing userId" });
        }
        // Nếu userId ở database là ObjectId, bạn có thể ép chúng về chuỗi để so sánh
        const orders = await orderModel.find({ userId: userId })
            .sort({ _id: -1 })
            .populate('userId')
            .populate('paymentId')
            .populate('addressId');
        res.status(200).json({ orders });
    } catch (error) {
        console.error("Lỗi lấy đơn hàng theo userId:", error);
        res.status(500).json({ message: error.message });
    }
}

// Tạo Order Detail mới (tạo nhiều record cho một order)
async function createOrderDetail(req, res) {
    try {
        const { orderId, items } = req.body;
        console.log("Payload Order Detail:", req.body); // Log payload nhận được
        if (!items || !Array.isArray(items)) {
            throw new Error("items phải là một mảng");
        }
        const createdItems = await Promise.all(
            items.map((item) =>
                OrderDetail.create({
                    orderId,
                    productId: item.productId,
                    quantily: item.quantily, // trường yêu cầu
                    price: item.price,
                })
            )
        );

        // Cập nhật stock của sản phẩm: giảm đi số lượng đã đặt đối với mỗi sản phẩm
        await Promise.all(
            items.map(item =>
                productModel.findByIdAndUpdate(
                    item.productId,
                    { $inc: { stock: -item.quantily } } // Giảm stock đi quantily
                )
            )
        );
        res.status(201).json({ message: "Order details created and product stocks updated", orderDetails: createdItems });
    } catch (error) {
        console.error("Error creating order details:", error);
        res.status(500).json({ message: error.message });
    }
}



// Lấy Order Details theo orderId
async function getOrderDetailsByOrderId(req, res) {
    try {
        const { orderId } = req.params;
        const orderDetails = await OrderDetail.find({ orderId })
            .populate("productId"); // Nếu muốn lấy thông tin sản phẩm
        res.status(200).json({ orderDetails });
    } catch (error) {
        console.error("Error getting order details:", error);
        res.status(500).json({ message: error.message });
    }
}
//
// Lấy tất cả các địa chỉ
async function getAllAddresses(req, res) {
    try {
        // Có thể lọc theo userId nếu FE truyền lên qua req.query
        const filter = req.query.userId ? { userId: req.query.userId } : {};
        const addresses = await addressModel.find(filter);
        return res.status(200).json({ addresses });
    } catch (error) {
        console.error("Lỗi lấy danh sách địa chỉ:", error);
        return res.status(500).json({ mess: error.message });
    }
}

// Lấy địa chỉ theo ID
async function getAddressById(req, res) {
    try {
        const { id } = req.params;
        const address = await addressModel.findById(id);
        if (!address) {
            return res.status(404).json({ mess: "Không tìm thấy địa chỉ" });
        }
        return res.status(200).json({ address });
    } catch (error) {
        console.error("Lỗi lấy địa chỉ:", error);
        return res.status(500).json({ mess: error.message });
    }
}

// Tạo địa chỉ mới
async function createAddress(req, res) {
    try {
        // Dữ liệu nhận từ FE có thể bao gồm trường extraCodes chứa các thông tin mã vùng bổ sung
        const newAddress = new addressModel(req.body);
        const savedAddress = await newAddress.save();
        return res
            .status(201)
            .json({ mess: "Địa chỉ được tạo thành công", address: savedAddress });
    } catch (error) {
        console.error("Lỗi tạo địa chỉ:", error);
        return res.status(500).json({ mess: error.message });
    }
}

// Cập nhật địa chỉ theo ID
async function updateAddress(req, res) {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedAddress = await addressModel.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
        if (!updatedAddress) {
            return res.status(404).json({ mess: "Không tìm thấy địa chỉ để cập nhật" });
        }
        return res
            .status(200)
            .json({ mess: "Địa chỉ được cập nhật thành công", address: updatedAddress });
    } catch (error) {
        console.error("Lỗi cập nhật địa chỉ:", error);
        return res.status(500).json({ mess: error.message });
    }
}

// Xóa địa chỉ theo ID
async function deleteAddress(req, res) {
    try {
        const { id } = req.params;
        const deletedAddress = await addressModel.findByIdAndDelete(id);
        if (!deletedAddress) {
            return res.status(404).json({ mess: "Không tìm thấy địa chỉ để xóa" });
        }
        return res.status(200).json({ mess: "Địa chỉ đã được xóa thành công" });
    } catch (error) {
        console.error("Lỗi xóa địa chỉ:", error);
        return res.status(500).json({ mess: error.message });
    }
}

// Lấy tất cả đơn hàng
async function getOrders(req, res) {
    try {
        // Sắp xếp theo _id giảm dần để order mới nhất xuất hiện trước
        const orders = await orderModel.find()
            .sort({ _id: -1 })
            .populate('userId')
            .populate('paymentId')
            .populate('addressId');
        res.status(200).json({ orders });
    } catch (error) {
        console.error("Lỗi lấy danh sách order:", error);
        res.status(500).json({ message: error.message });
    }
};

// Lấy đơn hàng theo ID
async function getOrderById(req, res) {
    try {
        const orderId = req.params.id;
        const order = await orderModel.findById(orderId)
            .populate('userId')
            .populate('paymentId')
            .populate('addressId');
        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy Order" });
        }
        res.status(200).json({ order });
    } catch (error) {
        console.error("Lỗi lấy order:", error);
        res.status(500).json({ message: error.message });
    }
};

// Tạo đơn hàng mới
async function createOrder(req, res) {
    try {
        const {
            name,
            quantity,
            img,
            price,
            status,
            payment_status,
            total,
            userId,
            paymentId,
            addressId
        } = req.body;

        const newOrder = new orderModel({
            name,
            quantity,
            img,
            price,
            status,
            payment_status,
            total,
            userId,
            paymentId,
            addressId,
            date: new Date()
        });

        const savedOrder = await newOrder.save();
        res.status(201).json({ message: "Order được tạo thành công", order: savedOrder });
    } catch (error) {
        console.error("Lỗi tạo order:", error);
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật Order theo ID
async function updateOrder(req, res) {
    try {
        const orderId = req.params.id;
        const updateData = req.body;

        // Lấy thông tin đơn hàng hiện tại để kiểm tra trạng thái
        const currentOrder = await orderModel.findById(orderId);
        if (!currentOrder) {
            return res.status(404).json({ message: "Không tìm thấy Order để cập nhật" });
        }

        // Nếu có cập nhật trạng thái, hãy kiểm tra chuyển đổi có hợp lệ không
        if (updateData.status !== undefined) {
            const currentStatus = currentOrder.status;
            const newStatus = updateData.status;

            // Nếu đơn hàng đã hoàn tất, bị hủy hoặc đổi trả, không cho phép cập nhật trạng thái
            if ([2, -1, 3].includes(currentStatus)) {
                return res.status(400).json({
                    message: "Đơn hàng đã ở trạng thái cuối (Hoàn tất, Bị hủy hoặc Đổi trả) nên không thể cập nhật thêm."
                });
            }

            // Bạn có thể thêm logic kiểm tra bổ sung nếu muốn chỉ cho phép chuyển từ trạng thái 0 sang 1 hoặc từ 1 sang 2, v.v.
            // Ví dụ:
            // if (currentStatus === 0 && newStatus !== 1) { ... }
        }

        // Cập nhật đơn hàng và trả về dữ liệu đã được populate
        const updatedOrder = await orderModel.findByIdAndUpdate(orderId, updateData, {
            new: true,
            runValidators: true,
        })
            .populate('userId')
            .populate('paymentId')
            .populate('addressId');

        if (!updatedOrder) {
            return res.status(404).json({ message: "Không tìm thấy Order để cập nhật" });
        }
        res.status(200).json({ message: "Order được cập nhật thành công", order: updatedOrder });
    } catch (error) {
        console.error("Lỗi cập nhật order:", error);
        res.status(500).json({ message: error.message });
    }
}
// Xóa Order theo ID
async function deleteOrder(req, res) {
    try {
        const orderId = req.params.id;
        const deletedOrder = await orderModel.findByIdAndDelete(orderId);
        if (!deletedOrder) {
            return res.status(404).json({ message: "Không tìm thấy Order để xóa" });
        }
        res.status(200).json({ message: "Order đã được xóa thành công" });
    } catch (error) {
        console.error("Lỗi xóa order:", error);
        res.status(500).json({ message: error.message });
    }
};

//
async function createMomoPaymentIntent(req, res) {
    try {
        // Lấy dữ liệu từ request (ví dụ orderId, amount, orderInfo)
        const { orderId, amount, orderInfo } = req.body;

        // Các thông số MoMo (nên đặt trong .env)
        const partnerCode = process.env.MOMO_PARTNER_CODE;
        const accessKey = process.env.MOMO_ACCESS_KEY;
        const secretKey = process.env.MOMO_SECRET_KEY;
        const requestId = partnerCode + new Date().getTime();
        const redirectUrl = process.env.MOMO_REDIRECT_URL;
        const ipnUrl = process.env.MOMO_IPN_URL;
        const extraData = ""; // có thể để rỗng hoặc mã hóa thông tin bổ sung

        // Tạo chuỗi ký theo định dạng yêu cầu của MoMo
        // Ví dụ chuỗi: "partnerCode=MOMO_PARTNER_CODE&accessKey=...&requestId=...&amount=...&orderId=...&orderInfo=...&redirectUrl=...&ipnUrl=...&extraData="
        const rawSignature = `partnerCode=${partnerCode}&accessKey=${accessKey}&requestId=${requestId}&amount=${amount}&orderId=${orderId}&orderInfo=${orderInfo}&redirectUrl=${redirectUrl}&ipnUrl=${ipnUrl}&extraData=${extraData}`;

        // Tạo signature bằng HMAC SHA256
        const signature = crypto.createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');

        // Xây dựng payload gửi lên MoMo
        const requestBody = {
            partnerCode,
            accessKey,
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            extraData,
            requestType: "captureMoMoWallet", // hoặc "payWithMoMo" tùy API đang sử dụng
            signature
        };

        // Gọi API của MoMo (thường là endpoint test)
        const momoEndpoint = process.env.MOMO_ENDPOINT; // ví dụ: https://test-payment.momo.vn/gw_payment/transactionProcessor
        const response = await axios.post(momoEndpoint, requestBody);

        // Trả về dữ liệu từ MoMo, thường bao gồm URL thanh toán
        return res.status(200).json(response.data);
    } catch (error) {
        console.error("Lỗi tạo MoMo payment:", error.message);
        return res.status(500).json({ mess: error.message });
    }
}

// Hàm chuyển đổi sang dạng không dấu (để xử lý các ký tự có dấu)
function removeDiacritics(str) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
}

async function createVNPayPaymentIntent(req, res) {
    try {
        // Lấy dữ liệu đơn hàng từ request body
        const { orderId, amount, orderInfo } = req.body;

        // Lấy các biến môi trường (đảm bảo các biến này đã được set đúng)
        const vnp_TmnCode = process.env.VNP_TMN_CODE;
        const vnp_HashSecret = process.env.VNP_HASH_SECRET;
        const vnp_PayUrl = process.env.VNP_PAY_URL;        // VD: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
        const vnp_ReturnUrl = process.env.VNP_RETURN_URL;       // VD: http://localhost:3000/vnpay_return

        // VNPay yêu cầu số tiền là số nguyên (đơn vị nhỏ nhất) -> nhân 100
        const vnp_Amount = amount * 100;

        // Chuẩn hoá thông tin đơn hàng: loại bỏ khoảng trắng, chuyển sang dạng không dấu
        const normalizedOrderInfo = removeDiacritics((orderInfo || "Thanh toán mua hàng").trim());

        // Thiết lập các tham số theo chuẩn VNPay với phiên bản "2.0.0"
        let vnp_Params = {
            vnp_Version: "2.0.0",               // dùng version 2.0.0 như code Ruby
            vnp_Command: "pay",
            vnp_TmnCode: vnp_TmnCode,
            vnp_Amount: vnp_Amount,
            vnp_CurrCode: "VND",
            vnp_TxnRef: orderId,               // Mã đơn hàng duy nhất
            vnp_OrderInfo: normalizedOrderInfo,
            vnp_OrderType: "190000",           // Theo code Ruby, Order Type: "190000"
            vnp_Locale: "vn",
            vnp_ReturnUrl: vnp_ReturnUrl,
            vnp_IpAddr: req.ip === "::ffff:127.0.0.1" ? "127.0.0.1" : req.ip,
            vnp_CreateDate: moment().format("YYYYMMDDHHmmss")
        };

        // Sắp xếp các key theo thứ tự alphabet, sau đó tạo chuỗi dữ liệu gốc (original_data)
        const sortedKeys = Object.keys(vnp_Params).sort();
        const original_data = sortedKeys
            .map(key => `${key}=${vnp_Params[key]}`)
            .join("&");
        console.log("Original data:", original_data);

        // Tạo URL query từ input data (không cần encode vì Rails sẽ encode theo cách của nó)
        let vnp_url = vnp_PayUrl + "?" + qs.stringify(vnp_Params);

        // Tính secure hash bằng SHA256 theo cách Ruby: hash = SHA256(vnp_hash_secret + original_data)
        let vnp_security_hash = crypto
            .createHash("sha256")
            .update(vnp_HashSecret + original_data)
            .digest("hex");
        console.log("vnp_security_hash:", vnp_security_hash);

        // Đính kèm các tham số bảo mật vào URL
        vnp_url += '&vnp_SecureHashType=SHA256&vnp_SecureHash=' + vnp_security_hash;
        console.log("Payment URL:", vnp_url);

        // Chuyển hướng người dùng đến URL thanh toán
        return res.redirect(vnp_url);
    } catch (error) {
        console.error("Lỗi tạo Payment VNPay:", error);
        return res.status(500).json({ message: error.message });
    }
}

async function resetPassword(req, res) {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.status(400).json({ mess: "Thiếu email hoặc mật khẩu mới" });
        }
        // Gọi hàm forgotPassword mà bạn đã có để cập nhật mật khẩu
        const result = await forgotPassword(email, newPassword);
        return res.status(200).json({ mess: "Mật khẩu đã được đặt lại thành công", result });
    } catch (error) {
        console.error("Lỗi reset mật khẩu:", error);
        return res.status(500).json({ mess: error.message });
    }
}
//
async function verifyForgotPasswordOTP(req, res) {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ mess: "Thiếu email hoặc OTP" });
        }
        const user = await userModel.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            return res.status(400).json({ mess: "Người dùng không tồn tại" });
        }
        if (user.otp_code !== otp) {
            return res.status(400).json({ mess: "OTP không chính xác" });
        }
        // Nếu xác thực thành công, có thể trả về một token tạm thời hoặc thông báo thành công
        return res.status(200).json({ verified: true, mess: "OTP xác thực thành công" });
    } catch (error) {
        console.error("Lỗi xác thực OTP:", error);
        return res.status(500).json({ mess: error.message });
    }
}
//
async function sendForgotPasswordOTP(req, res) {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ mess: "Thiếu email" });
        }

        // Tìm người dùng theo email (ép về lowercase để đảm bảo nhất quán)
        const user = await userModel.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            return res.status(400).json({ mess: "Người dùng không tồn tại" });
        }

        // Tạo OTP (ví dụ: mã 6 chữ số)
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Cập nhật OTP vào database (bạn cũng có thể lưu thời gian hết hạn nếu cần)
        user.otp_code = otpCode;
        await user.save();

        // Gửi OTP qua email
        await sendMail({
            email: user.email,
            subject: "OTP đặt lại mật khẩu",
            text: `Mã OTP của bạn là: ${otpCode}`,
            html: `<p>Mã OTP của bạn là: <strong>${otpCode}</strong></p>`
        });

        return res.status(200).json({ mess: "OTP đã được gửi tới email của bạn" });
    } catch (error) {
        console.error("Lỗi gửi OTP quên mật khẩu:", error);
        return res.status(500).json({ mess: error.message });
    }
}
//tạo comment
async function createComment(req, res) {
    try {
        // Destructure thêm orderId từ req.body
        const { userId, orderId, productId, content, rating } = req.body;

        // Kiểm tra sự tồn tại của user
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Kiểm tra sự tồn tại của product
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Lấy danh sách đơn hàng của user có status hoàn thành (status === 2)
        const completedOrders = await orderModel.find({ userId: userId, status: 2 });
        if (!completedOrders || completedOrders.length === 0) {
            return res.status(400).json({
                message:
                    "Bạn chưa mua sản phẩm này hoặc đơn hàng của bạn chưa hoàn thành. Không được phép đánh giá."
            });
        }

        // Kiểm tra qua từng đơn hàng hoàn thành xem có đơn nào có order detail chứa productId không
        let purchased = false;
        for (const order of completedOrders) {
            const detail = await order_detailModel.findOne({
                orderId: order._id,
                productId: productId
            });
            if (detail) {
                purchased = true;
                break;
            }
        }
        if (!purchased) {
            return res.status(400).json({
                message:
                    "Bạn chưa mua sản phẩm này hoặc đơn hàng của bạn chưa hoàn thành. Không được phép đánh giá."
            });
        }

        // Kiểm tra nếu người dùng đã đánh giá sản phẩm này trong đơn hàng đó trước đó
        const existingComment = await commentModel.findOne({ userId, productId, orderId });
        if (existingComment) {
            return res.status(400).json({
                message:
                    "Bạn đã đánh giá sản phẩm này cho đơn hàng này rồi. Nếu muốn đánh giá lại, vui lòng mua sản phẩm lần nữa."
            });
        }

        // Tạo mới bình luận với trạng thái "pending"
        const comment = new commentModel({
            userId,
            orderId, // lưu orderId vào bình luận
            productId,
            content,
            date: Date.now(),
            status: "pending",
            rating
        });
        await comment.save();

        res.status(201).json({ message: "Comment created successfully", comment });
    } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({ message: "Error creating comment", error });
    }
}
//kiểm tra người dùng like hay chưa
async function toggleLike(req, res) {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        // Kiểm tra userId có được gửi lên không
        if (!userId) {
            return res.status(400).json({ message: "User ID is required for toggling like" });
        }

        // Lấy comment theo id
        const comment = await commentModel.findById(id);
        if (!comment) {
            return res.status(404).json({ message: "Comment không tồn tại" });
        }

        // Kiểm tra xem user đã like comment hay chưa
        if (comment.likedBy.includes(userId)) {
            // Nếu đã like -> hủy like: xóa userId khỏi likedBy
            comment.likedBy.pull(userId);
        } else {
            // Nếu chưa like -> thực hiện like: thêm userId vào likedBy
            comment.likedBy.push(userId);
        }

        // Cập nhật lại số lượt like dựa trên độ dài của mảng likedBy
        comment.likes = comment.likedBy.length;

        await comment.save();

        res.status(200).json({
            message: comment.likedBy.includes(userId) ? "Comment đã được like" : "Đã hủy like comment",
            comment
        });

    } catch (error) {
        console.error("Lỗi khi toggle like:", error);
        res.status(500).json({ message: "Có lỗi xảy ra khi xử lý like", error: error.message });
    }
}
//lấy comment
async function getComments(req, res) {
    try {
        const { productId } = req.query;  // Lấy productId từ query string
        const filter = productId ? { productId } : {};
        // Tùy chọn: populate user và product nếu cần
        const comments = await commentModel.find(filter)
            .populate('userId', 'name')  // Chỉ lấy tên người dùng
            .populate('productId', 'name')  // (tuỳ chọn)
            .sort({ date: -1 });  // Sắp xếp giảm dần theo ngày tạo
        res.status(200).json({ comments });
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: "Error fetching comments", error });
    }
};
//unlike comment
async function unlikeComment(req, res) {
    try {
        const { id } = req.params;

        // Cập nhật giảm 1 của trường likes chỉ khi likes hiện tại > 0
        const updatedComment = await commentModel.findOneAndUpdate(
            { _id: id, likes: { $gt: 0 } }, // chỉ update nếu likes > 0
            { $inc: { likes: -1 } },
            { new: true }
        );

        if (!updatedComment) {
            return res.status(404).json({ message: "Comment không tồn tại hoặc chưa có lượt like để hủy" });
        }

        res.status(200).json({
            message: "Đã hủy like comment",
            comment: updatedComment
        });
    } catch (error) {
        console.error("Lỗi khi hủy like comment:", error);
        res.status(500).json({
            message: "Có lỗi xảy ra khi hủy like comment",
            error: error.message
        });
    }
}
//like comment
async function likeComment(req, res) {
    try {
        const { id } = req.params;
        const updatedComment = await commentModel.findByIdAndUpdate(
            id,
            { $inc: { likes: 1 } },
            { new: true }
        );

        if (!updatedComment) {
            return res.status(404).json({ message: "Comment không tồn tại" });
        }

        res.status(200).json({
            message: "Comment đã được like",
            comment: updatedComment
        });
    } catch (error) {
        console.error("Lỗi khi like comment:", error);
        res.status(500).json({ message: "Có lỗi xảy ra khi like comment", error: error.message });
    }
}
//sửa comment

async function updateComment(req, res) {
    try {
        const { id } = req.params;
        const { content, rating } = req.body;

        // Khởi tạo đối tượng cập nhật, luôn cập nhật ngày
        const updateData = {
            date: new Date()
        };

        // Nếu có content, kiểm tra tính hợp lệ và thêm vào đối tượng cập nhật
        if (content !== undefined) {
            if (typeof content !== 'string' || !content.trim()) {
                return res.status(400).json({ message: "Nội dung comment không hợp lệ" });
            }
            updateData.content = content;
        }

        // Nếu có rating được gửi lên, kiểm tra tính hợp lệ (ví dụ: số, trong khoảng 0 đến 5)
        if (rating !== undefined) {
            if (typeof rating !== 'number' || isNaN(rating) || rating < 0 || rating > 5) {
                return res.status(400).json({ message: "Rating phải là số hợp lệ trong khoảng từ 0 đến 5" });
            }
            updateData.rating = rating;
        }

        // Nếu không có trường nào được cập nhật (tức cả content và rating đều không có)
        if (!updateData.content && updateData.rating === undefined) {
            return res.status(400).json({ message: "Không có thông tin cập nhật được cung cấp" });
        }

        // Cập nhật comment theo id
        const updatedComment = await commentModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        // Nếu không tìm thấy comment
        if (!updatedComment) {
            return res.status(404).json({ message: "Comment không tồn tại" });
        }

        res.status(200).json({
            message: "Comment được cập nhật thành công",
            comment: updatedComment
        });
    } catch (error) {
        console.error("Lỗi cập nhật comment:", error);
        res.status(500).json({ message: "Có lỗi xảy ra khi cập nhật comment", error: error.message });
    }
}


// async function to delete a comment from the database
async function deleteComment(req, res) {
    try {
        // get the id of the comment from the request parameters
        const { id } = req.params;
        // find and delete the comment from the database
        const comment = await commentModel.findByIdAndDelete(id);
        // if the comment is not found, return a 404 status code and a message
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        // if the comment is found, return a 200 status code and a message
        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        // if there is an error, log the error and return a 500 status code and a message
        console.error("Error deleting comment:", error);
        res.status(500).json({ message: "Error deleting comment", error });
    }
};
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
async function getAllDiscounts(req, res) {
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
async function getDiscountById(req, res) {
    try {
        const { id } = req.params;
        const discount = await discountModel.findById(id);
        if (!discount) {
            return res.status(404).json({ message: "Discount not found" });
        }
        res.status(200).json({ discount });
    } catch (error) {
        console.error("Error fetching discount:", error);
        res.status(500).json({ message: "Error fetching discount", error });
    }
};

/**
 * Cập nhật discount theo id
 */
async function updateDiscount(req, res) {
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
async function deleteDiscount(req, res) {
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
        const validPassword = await bcrypt.compare(oldPassword, user.pass);
        if (!validPassword) {
            throw new Error("Mật khẩu cũ không chính xác");
        }
        // Tạo hash cho mật khẩu mới
        var salt = bcrypt.genSaltSync(10);
        const hash = await bcrypt.hash(newPassword, 10);
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

async function resendOtp(req, res) {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ mess: "Thiếu thông tin userId" });
        }
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ mess: "Không tìm thấy user" });
        }
        // Tạo OTP mới (6 chữ số)
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp_code = otpCode;
        await user.save();
        // Gửi mail OTP
        await sendMail({
            email: user.email,
            subject: "OTP Xác Thực Mới",
            text: `Mã OTP của bạn là: ${otpCode}`,
            html: `<p>Mã OTP của bạn là: <strong>${otpCode}</strong></p>`
        });
        return res.status(200).json({ mess: "Mã OTP đã được gửi lại thành công" });
    } catch (error) {
        console.error("Lỗi gửi lại OTP:", error);
        return res.status(500).json({ mess: error.message });
    }
}
async function register(req, res) {
    try {
        const { email, googleToken } = req.body;
        if (googleToken) {
            // Đăng ký qua Google sử dụng access token
            // Thay vì verifyIdToken, gọi API userinfo để lấy thông tin người dùng
            const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
                headers: {
                    'Authorization': `Bearer ${googleToken}`
                }
            });
            const payload = await response.json();
            // payload bây giờ chứa email, name, picture,...

            // Kiểm tra xem email đã tồn tại chưa
            const userExists = await userModel.findOne({ email: payload.email });
            if (userExists) {
                return res.status(400).json({ mess: 'Email đã được đăng ký' });
            }

            // Tạo mật khẩu ngẫu nhiên
            const randomPass = Math.random().toString(36).substring(2);
            const hashedPassword = bcrypt.hashSync(randomPass, 10);

            // Xử lý số điện thoại và avatar mặc định
            const defaultPhone = "000";
            const defaultAvatarUrl = "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg";
            const avatarUrl = payload.picture ? payload.picture : defaultAvatarUrl;

            const newUser = new userModel({
                _id: new mongoose.Types.ObjectId(),
                email: payload.email,
                pass: hashedPassword,
                name: payload.name,
                phone: defaultPhone, // gán số mặc định khi Google không cung cấp
                url_image: avatarUrl,
                role: '0',
                is_verified: true
            });
            const savedUser = await newUser.save();

            // Tạo JWT token cho user
            const token = jwt.sign(
                { _id: savedUser._id, email: savedUser.email, role: savedUser.role },
                JWT_SECRET,
                { expiresIn: 3600 }
            );
            return res.status(200).json({ ...savedUser._doc, token });
        } else {
            // Đăng ký thông thường với OTP
            const existingUser = await userModel.findOne({ email: req.body.email });
            if (existingUser) {
                return res.status(400).json({ mess: 'Email đã được đăng ký' });
            }

            // Tạo OTP (ví dụ: mã 6 chữ số)
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

            // Kiểm tra trường pass để đảm bảo có giá trị hợp lệ
            if (!req.body.pass) {
                return res.status(400).json({ mess: 'Thiếu trường mật khẩu' });
            }

            // Hash mật khẩu
            const hashedPassword = bcrypt.hashSync(req.body.pass, 10);

            const newUser = new userModel({
                _id: new mongoose.Types.ObjectId(),
                email: req.body.email,
                pass: hashedPassword,
                name: req.body.name,
                phone: req.body.phone, // Đối với đăng ký thông thường, người dùng phải nhập phone
                url_image: 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg',
                role: req.body.role || '0',
                is_verified: false,
                otp_code: otpCode
            });
            const savedUser = await newUser.save();

            try {
                await sendMail({
                    email: req.body.email,
                    subject: "OTP của bạn",
                    text: `Mã OTP của bạn là: ${otpCode}`,
                    html: `<p>Mã OTP của bạn là: <strong>${otpCode}</strong></p>`
                });
            } catch (emailError) {
                console.error("Gửi email OTP thất bại:", emailError);
            }

            return res.status(200).json({
                mess: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực OTP.'
            });
        }
    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        return res.status(500).json({ mess: error.message });
    }
}


/**
 * Hàm đăng nhập (login): Hỗ trợ đăng nhập thông thường và qua Google.
 */
async function login(req, res) {
    try {
        const { googleToken, email, pass } = req.body;
        let user;
        if (googleToken) {
            // Xử lý đăng nhập qua Google sử dụng access token:
            // Thay vì verifyIdToken, sử dụng endpoint userinfo để lấy thông tin người dùng
            const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
                headers: {
                    'Authorization': `Bearer ${googleToken}`
                }
            });
            if (!response.ok) {
                throw new Error("Không thể lấy thông tin người dùng từ Google");
            }
            const payload = await response.json();
            // payload sẽ có dạng:
            // {
            //   email: "...",
            //   name: "...",
            //   picture: "...",
            //   ... các trường khác
            // }

            // Tìm user dựa trên email trả về từ Google
            user = await userModel.findOne({ email: payload.email });
            if (!user) {
                // Nếu user chưa tồn tại, tự động đăng ký với thông tin mặc định
                const randomPass = Math.random().toString(36).substring(2);
                const hashedPassword = bcrypt.hashSync(randomPass, 10);
                user = new userModel({
                    _id: new mongoose.Types.ObjectId(),
                    email: payload.email,
                    pass: hashedPassword,
                    name: payload.name || payload.email.split('@')[0],
                    phone: "000", // Gán số điện thoại mặc định vì Google không cung cấp
                    url_image: payload.picture || "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
                    role: '0',
                    is_verified: true,
                });
                user = await user.save();
            }
        } else {
            // Xử lý đăng nhập truyền thống
            user = await userModel.findOne({ email });
            if (!user) throw new Error('Email không tồn tại!');
            const isMatch = bcrypt.compareSync(pass, user.pass);
            if (!isMatch) throw new Error('Mật khẩu không chính xác');
        }
        // Tạo JWT cho user
        const token = jwt.sign(
            { _id: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: 3600 }
        );
        user = user.toObject();
        delete user.pass;
        return res.status(200).json({ ...user, token });
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        return res.status(500).json({ mess: error.message });
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
            throw new Error('Không tìm thấy user');
        }
        const { email, pass, name, phone, role, address } = body;
        const result = await userModel.findByIdAndUpdate(
            id,
            { email, pass, name, phone, role, address },
            { new: true }
        );
        // Trả về trực tiếp object result thay vì { Products: result }
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
        // Tạo regex để khớp các chuỗi bắt đầu bằng 'value' (không phân biệt chữ hoa chữ thường)
        const regex = new RegExp(value, 'i');

        // Tìm kiếm sản phẩm với điều kiện khớp prefix mà không dùng projection nào,
        // do đó đầy đủ thông tin được trả về
        let results = await productModel.find({ [key]: regex });

        // Mapping kết quả theo định dạng mong muốn với các tên trường tiếng Anh
        results = results.map(result => ({
            _id: result._id,
            name: result.name,
            title: result.title,
            description: result.description,
            price: result.price,
            stock: result.stock,
            weight: result.weight,
            size: result.size,
            pages: result.pages,
            language: result.language,
            format: result.format,
            published_date: result.published_date,
            sale_count: result.sale_count,
            publisher: result.publisher,
            category: result.category,
            author: result.author,
            discount: result.discount
        }));

        return results;
    } catch (error) {
        console.error("Error in getByKey:", error);
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