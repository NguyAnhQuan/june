const { Contact } = require('../models');

exports.submit = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    const contact = await Contact.create({ name, email, phone: phone || '', message });
    res.status(201).json({ message: 'Gửi liên hệ thành công. Chúng tôi sẽ phản hồi sớm nhất!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi gửi liên hệ' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const contacts = await Contact.findAll({ order: [['created_at', 'DESC']] });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách liên hệ' });
  }
};

exports.markRead = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Không tìm thấy' });
    contact.is_read = true;
    await contact.save();
    res.json({ message: 'Đã đánh dấu đã đọc' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật' });
  }
};

exports.remove = async (req, res) => {
  try {
    const contact = await Contact.findByPk(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Không tìm thấy' });
    await contact.destroy();
    res.json({ message: 'Xóa liên hệ thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa liên hệ' });
  }
};
