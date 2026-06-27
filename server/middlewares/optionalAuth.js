const jwt = require('jsonwebtoken');
const { User } = require('../models');

/** Gắn req.user nếu có Bearer hợp lệ; không có token vẫn cho qua (dùng cho chatbot công khai). */
module.exports = async function optionalAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return next();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (user && user.is_active) req.user = user;
  } catch {
    /* bỏ qua token lỗi — coi như khách */
  }
  next();
};
