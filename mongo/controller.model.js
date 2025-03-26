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
const crypto = require('crypto');
const querystring = require('querystring');
const axios = require('axios');
const slugify = require('slugify');

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
    getPostBySlug, updatePost, deletePost, getPostById

}
//
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
      res.status(201).json({ message: "Order details created", orderDetails: createdItems });
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
async function getAllAddresses(req, res) {
    try {
        // Nếu muốn, bạn có thể lọc theo userId bằng req.query.userId
        // Ví dụ: const filter = req.query.userId ? { userId: req.query.userId } : {};
        const addresses = await addressModel.find();
        return res.status(200).json({ addresses });
    } catch (error) {
        console.error("Lỗi lấy danh sách địa chỉ:", error);
        return res.status(500).json({ mess: error.message });
    }
};

// Lấy địa chỉ theo ID
async function getAddressById (req, res)  {
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
};

// Tạo địa chỉ mới
async function createAddress (req, res) {
    try {
        // Các dữ liệu cần thiết sẽ được gửi qua req.body
        const newAddress = new addressModel(req.body);
        const savedAddress = await newAddress.save();
        return res
            .status(201)
            .json({ mess: "Địa chỉ được tạo thành công", address: savedAddress });
    } catch (error) {
        console.error("Lỗi tạo địa chỉ:", error);
        return res.status(500).json({ mess: error.message });
    }
};

// Cập nhật địa chỉ theo ID
async function updateAddress (req, res) {
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
};

// Xóa địa chỉ theo ID
async function deleteAddress (req, res) {
    try {
        const { id } = req.params;
        const deletedAddress = await addressModel.findByIdAndDelete(id);
        if (!deletedAddress) {
            return res.status(404).json({ mess: "Không tìm thấy địa chỉ để xóa" });
        }
        return res
            .status(200)
            .json({ mess: "Địa chỉ đã được xóa thành công" });
    } catch (error) {
        console.error("Lỗi xóa địa chỉ:", error);
        return res.status(500).json({ mess: error.message });
    }
};
// Lấy tất cả đơn hàng
async function getOrders(req, res) {
    try {
        // Sử dụng populate để lấy thông tin liên quan nếu cần
        const orders = await orderModel.find()
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
        const updatedOrder = await orderModel.findByIdAndUpdate(orderId, updateData, { new: true, runValidators: true });
        if (!updatedOrder) {
            return res.status(404).json({ message: "Không tìm thấy Order để cập nhật" });
        }
        res.status(200).json({ message: "Order được cập nhật thành công", order: updatedOrder });
    } catch (error) {
        console.error("Lỗi cập nhật order:", error);
        res.status(500).json({ message: error.message });
    }
};

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
//thánh toán vn pay
async function createVNPayPaymentIntent(req, res) {
    try {
        // Ví dụ: lấy thông tin đơn hàng từ request
        const { orderId, amount, orderInfo } = req.body;
        // VNPay yêu cầu số tiền tính theo đơn vị nhỏ nhất (nếu VND thì nhân 100)
        const vnp_Amount = amount * 100;
        // Các tham số cần gửi tới VNPay
        let vnp_Params = {
            vnp_Version: '2.0.0',
            vnp_Command: 'pay',
            vnp_TmnCode: process.env.VNP_TMN_CODE,
            vnp_Amount: vnp_Amount,
            vnp_CurrCode: 'VND',
            vnp_TxnRef: orderId, // mã đơn hàng duy nhất
            vnp_OrderInfo: orderInfo || 'Thanh toán đơn hàng',
            vnp_OrderType: 'other', // loại đơn, có thể tuỳ chỉnh theo nghiệp vụ
            vnp_Locale: 'vn',
            vnp_ReturnUrl: process.env.VNP_RETURN_URL,
            vnp_IpAddr: req.ip,
            vnp_CreateDate: new Date().toISOString().replace(/[-T:\.Z]/g, "").slice(0, 14) // Format: YYYYMMDDHHMMSS
        };

        // Sắp xếp các tham số theo thứ tự từ điển
        vnp_Params = sortObject(vnp_Params);

        // Tạo chuỗi query (không mã hóa giá trị) để ký số
        const signData = querystring.stringify(vnp_Params, null, null, {
            encodeURIComponent: (str) => str
        });
        // Tạo secure hash bằng HMAC SHA512
        const hmac = crypto.createHmac("sha512", process.env.VNP_HASH_SECRET);
        const secureHash = hmac.update(signData).digest("hex");

        // Thêm secureHash vào tham số
        vnp_Params.vnp_SecureHash = secureHash;

        // Tạo URL thanh toán VNPay
        const paymentUrl = `${process.env.VNP_PAY_URL}?${querystring.stringify(vnp_Params)}`;

        return res.status(200).json({ paymentUrl });
    } catch (error) {
        console.error("Lỗi tạo Payment VNPay:", error);
        return res.status(500).json({ message: error.message });
    }
}

// Hàm sắp xếp object theo key (theo thứ tự từ điển)
function sortObject(obj) {
    let sorted = {};
    Object.keys(obj)
        .sort()
        .forEach((key) => {
            sorted[key] = obj[key];
        });
    return sorted;
}

//
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
        const { userId, productId, content, rating } = req.body;

        // Kiểm tra sự tồn tại của User
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Kiểm tra sự tồn tại của Product
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Tạo mới bản ghi comment, explicit truyền cả các trường date và status
        const comment = new commentModel({
            userId,
            productId,
            content,
            date: Date.now(),          // Thời gian hiện tại
            status: "pending",
            rating          // Trạng thái mặc định, bạn có thể thay đổi thành "approved" nếu cần
        });
        await comment.save();

        res.status(201).json({ message: "Comment created successfully", comment });
    } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({ message: "Error creating comment", error });
    }
};
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