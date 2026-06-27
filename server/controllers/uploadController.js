const { cloudinary } = require('../config/cloudinary');

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn hình ảnh' });
    res.json({ message: 'Tải ảnh lên thành công', url: req.file.path });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải ảnh lên' });
  }
};

exports.uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'Vui lòng chọn hình ảnh' });
    const urls = req.files.map(f => f.path);
    res.json({ message: 'Tải ảnh lên thành công', urls });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải ảnh lên' });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const { public_id } = req.body;
    if (!public_id) return res.status(400).json({ message: 'Thiếu public_id' });
    await cloudinary.uploader.destroy(public_id);
    res.json({ message: 'Xóa ảnh thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa ảnh' });
  }
};
