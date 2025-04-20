const jwt = require("jsonwebtoken");

const checktoken = (req, res, next) => {
  try {
    // Kiểm tra header Authorization có tồn tại hay không
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Không tìm thấy header Authorization' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      return res.status(401).json({ message: 'Cấu trúc header không hợp lệ' });
    }

    const token = parts[1];
    if (!token) {
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }

    // Giải mã token
    jwt.verify(token, 'kchi', (error, decoded) => {
      if (error) {
        return res.status(401).json({ message: 'Token không hợp lệ' });
      }
      // Lưu thông tin giải mã vào req.user và chuyển qua middleware tiếp theo
      req.user = decoded;
      next();
    });
  } catch (error) {
    // Trả về lỗi nếu có ngoại lệ
    return res.status(500).json({ message: error.message });
  }
};

module.exports = checktoken;