var express = require('express');
const userModel = require('../mongo/user.model.js');
var router = express.Router();
userController = require('../mongo/controller.model.js');
const checktoken = require('../hepler/checktoken.js');

router.get('/',async (req,res)=>{
    try {
      const result = await userController.getUsers();
      return res.status(200).json({result})
    } catch (error) {
      console.log('lỗi get all user: ',error);
      return res.status(500).json({mess: error})
    }
  })
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
 // Router để đổi mật khẩu
router.post('/changepass',checktoken, async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
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
router.post('/register', async (req, res) => {
  try {
    const { email } = req.body;
    const emailExists = await userController.checkEmailExists(email);
    if (emailExists) {
      return res.status(400).json({ mess: 'Email đã được đăng ký' });
    }
    const result = await userController.register(req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.log('lỗi đăng ký: ', error);
    return res.status(500).json({ mess: error });
  }
});
//đăng nhập localhost:3000/users/login
router.post('/login',async(req,res)=>{
  try {
    const body = req.body
    const result = await userController.login(body)
    return res.status(200).json(result)
  } catch (error) {
    console.log('lỗi đăng nhập: ',error);
    return res.status(500).json({mess: error})
  }

  
})

// Thêm một user mới
router.post('/add', async (req, res) => {
  try {
      const body = req.body;
      const result = await userController.insertUser(body);
      return res.status(201).json({newUser: result});
  } catch (error) {
      console.log('Lỗi thêm user: ', error);
      return res.status(500).json({mess: error});
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
      const {id} = req.params;
      await userController.deleteUserById(id);
      return res.status(200).json({message: 'user đã được xóa thành công.'});
  } catch (error) {
      console.log('Lỗi xóa user: ', error);
      return res.status(500).json({mess: error});
  }
});

router.put('/:id',async (req,res)=>{
  try {
    const {id} = req.params;
    const body = req.body;
    const pro = await userController.updateUserById(id,body)
    return res.status(200).json({Products: pro})
  } catch (error) {
    console.log('lỗi update: ',error);
    return res.status(500).json({mess: error});
  }
})

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const product = await userModel.findById(id);
    
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
