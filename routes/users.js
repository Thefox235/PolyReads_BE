var express = require('express');
const userModel = require('../mongo/user.model.js');
var router = express.Router();
userController = require('../mongo/controller.model.js');
const checktoken = require('../hepler/checktoken.js');
const authorizeRole = require("../hepler/authorizeRole.js");  //cách dùng router.put("/:id", checktoken, authorizeRole("1"), async (req, res) => {
const jwt = require('jsonwebtoken');

router.get('/', async (req, res) => {
  try {
    const result = await userController.getUsers();
    return res.status(200).json({ result })
  } catch (error) {
    console.log('lỗi get all user: ', error);
    return res.status(500).json({ mess: error })
  }
})

router.post('/refresh-token', (req, res) => {
  // Bạn có thể lấy refresh token từ body hoặc từ cookie, tùy cách lưu trữ của bạn.
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token không tồn tại' });
  }

  // Xác thực refresh token với bí mật JWT_REFRESH_SECRET
  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Refresh token không hợp lệ' });
    }
    // Nếu refresh token hợp lệ, tạo một access token mới
    const newAccessToken = jwt.sign(
      { _id: decoded._id, email: decoded.email, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Thời gian sống cho access token mới
    );

    // Tùy chọn: bạn có thể tạo thêm refresh token mới ở đây để thay thế token cũ.
    return res.status(200).json({ token: newAccessToken });
  });
});

// Endpoint gửi OTP khi quên mật khẩu
router.post('/forgotPass/send-otp', userController.sendForgotPasswordOTP);

// Endpoint xác thực OTP
router.post('/forgotPass/verify-otp', userController.verifyForgotPasswordOTP);

// Endpoint đổi mật khẩu sau khi xác thực OTP
router.post('/forgotPass/reset', userController.resetPassword);
//router để sát thực otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const result = await userController.verifyOTP({ userId, otp });
    if (!result.verified) {
      return res.status(400).json({ mess: result.message });
    }
    return res.json({ verified: true, user: result.user });
  } catch (error) {
    return res.status(500).json({ mess: error.message });
  }
});
// Endpoint gửi lại OTP
router.post('/resend-otp', userController.resendOtp);
// Router để đổi mật khẩu
router.post('/changepass', checktoken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  // Lấy thông tin user từ token (được gán bởi middleware checktoken)
  const email = req.user.email;
  try {
    const result = await userController.changePassword(email, oldPassword, newPassword);
    res.status(200).json({ message: 'Mật khẩu đã được thay đổi thành công', result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Router để đặt lại mật khẩu khi quên
router.post('/forgotPass', async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const result = await userController.forgotPassword(email, newPassword);
    res.status(200).json({ message: 'Mật khẩu mới đã được đặt lại thành công', result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//đăng ký localhost:3000/users/regsiter
// đăng ký localhost:3000/users/register
// Endpoint đăng ký
router.post('/register', userController.register);

// Endpoint đăng nhập
router.post('/login', userController.login);


router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await userController.deleteUserById(id);
    return res.status(200).json({ message: 'user đã được xóa thành công.' });
  } catch (error) {
    console.log('Lỗi xóa user: ', error);
    return res.status(500).json({ mess: error });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const pro = await userController.updateUserById(id, body)
    return res.status(200).json({ user: pro })
  } catch (error) {
    console.log('lỗi update: ', error);
    return res.status(500).json({ mess: error });
  }
})

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const product = await userModel.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    return res.status(210).json({ productNew: product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
