// authorizeRole.js
const authorizeRole = (requiredRole) => {
    return (req, res, next) => {
      if (req.user && req.user.role === requiredRole) {
        next(); // Role khớp, cho phép tiếp tục
      } else {
        return res.status(403).json({ mess: "Không có quyền truy cập" });
      }
    };
  };
  
  module.exports = authorizeRole;