const { Notification } = require('../models');

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({ where: { user_id: req.user.id }, order: [['created_at', 'DESC']], limit: 50 });
    const unreadCount = await Notification.count({ where: { user_id: req.user.id, is_read: false } });
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy thông báo' });
  }
};

exports.markRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!notification) return res.status(404).json({ message: 'Không tìm thấy thông báo' });
    notification.is_read = true;
    await notification.save();
    res.json({ message: 'Đã đánh dấu đã đọc' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật thông báo' });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.update({ is_read: true }, { where: { user_id: req.user.id, is_read: false } });
    res.json({ message: 'Đã đánh dấu tất cả đã đọc' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật thông báo' });
  }
};
