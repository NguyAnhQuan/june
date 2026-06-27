const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User } = require('../models');
const emailService = require('../utils/emailService');


const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: 'Email đã được sử dụng' });

    const user = await User.create({ name, email, password });
    const token = generateToken(user);
    res.status(201).json({
      message: 'Đăng ký thành công',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi đăng ký tài khoản' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    if (!user.is_active) return res.status(403).json({ message: 'Tài khoản đã bị khóa' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });

    const token = generateToken(user);
    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, phone: user.phone },
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi đăng nhập' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi đổi mật khẩu' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy thông tin' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Vui lòng nhập email' });
    const user = await User.findOne({ where: { email } });
    // Always return success to prevent email enumeration
    if (!user) return res.json({ message: 'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    user.reset_token = token;
    user.reset_token_expiry = expiry;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    await emailService.sendForgotPassword(user.email, user.name, resetUrl);

    res.json({ message: 'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi gửi email' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Thiếu thông tin' });
    if (password.length < 6) return res.status(400).json({ message: 'Mật khẩu tối thiểu 6 ký tự' });

    const user = await User.findOne({ where: { reset_token: token } });
    if (!user) return res.status(400).json({ message: 'Token không hợp lệ' });
    if (new Date() > new Date(user.reset_token_expiry)) return res.status(400).json({ message: 'Token đã hết hạn' });

    user.password = await bcrypt.hash(password, 10);
    user.reset_token = null;
    user.reset_token_expiry = null;
    await user.save();

    res.json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi đặt lại mật khẩu' });
  }
};
