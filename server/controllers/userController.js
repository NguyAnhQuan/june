const bcrypt = require('bcryptjs');
const { User, Address } = require('../models');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy thông tin cá nhân' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByPk(req.user.id);
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar) user.avatar = avatar;
    await user.save();
    res.json({ message: 'Cập nhật thông tin thành công', user: { id: user.id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật thông tin' });
  }
};

exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.findAll({ where: { user_id: req.user.id }, order: [['is_default', 'DESC'], ['created_at', 'DESC']] });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách địa chỉ' });
  }
};

exports.createAddress = async (req, res) => {
  try {
    const { name, phone, province, district, ward, detail, is_default } = req.body;
    if (is_default) {
      await Address.update({ is_default: false }, { where: { user_id: req.user.id } });
    }
    const address = await Address.create({ user_id: req.user.id, name, phone, province, district, ward, detail, is_default: is_default || false });
    res.status(201).json({ message: 'Thêm địa chỉ thành công', address });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi thêm địa chỉ' });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!address) return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });
    const { name, phone, province, district, ward, detail, is_default } = req.body;
    if (is_default) {
      await Address.update({ is_default: false }, { where: { user_id: req.user.id } });
    }
    await address.update({ name, phone, province, district, ward, detail, is_default });
    res.json({ message: 'Cập nhật địa chỉ thành công', address });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật địa chỉ' });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!address) return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });
    await address.destroy();
    res.json({ message: 'Xóa địa chỉ thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa địa chỉ' });
  }
};

exports.setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!address) return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });
    await Address.update({ is_default: false }, { where: { user_id: req.user.id } });
    address.is_default = true;
    await address.save();
    res.json({ message: 'Đã đặt địa chỉ mặc định', address });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi đặt địa chỉ mặc định' });
  }
};

