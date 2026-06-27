const { Banner } = require('../models');

exports.getActive = async (req, res) => {
  try {
    const banners = await Banner.findAll({ where: { is_active: true }, order: [['position', 'ASC']] });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy banner' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const banners = await Banner.findAll({ order: [['position', 'ASC']] });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy banner' });
  }
};

exports.create = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json({ message: 'Thêm banner thành công', banner });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi thêm banner' });
  }
};

exports.update = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Không tìm thấy banner' });
    await banner.update(req.body);
    res.json({ message: 'Cập nhật banner thành công', banner });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật banner' });
  }
};

exports.remove = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Không tìm thấy banner' });
    await banner.destroy();
    res.json({ message: 'Xóa banner thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa banner' });
  }
};
