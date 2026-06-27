const { Wishlist, Product, ProductImage } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const items = await Wishlist.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Product, as: 'product', include: [{ model: ProductImage, as: 'images', where: { is_primary: true }, required: false }] }],
      order: [['created_at', 'DESC']],
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách yêu thích' });
  }
};

exports.toggle = async (req, res) => {
  try {
    const { product_id } = req.body;
    const existing = await Wishlist.findOne({ where: { user_id: req.user.id, product_id } });
    if (existing) {
      await existing.destroy();
      return res.json({ message: 'Đã xóa khỏi danh sách yêu thích', wishlisted: false });
    }
    await Wishlist.create({ user_id: req.user.id, product_id });
    res.json({ message: 'Đã thêm vào danh sách yêu thích', wishlisted: true });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật yêu thích' });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await Wishlist.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!item) return res.status(404).json({ message: 'Không tìm thấy' });
    await item.destroy();
    res.json({ message: 'Đã xóa khỏi danh sách yêu thích' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa yêu thích' });
  }
};
