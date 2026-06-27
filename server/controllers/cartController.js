const { CartItem, ProductVariant, Product, ProductImage } = require('../models');

exports.getCart = async (req, res) => {
  try {
    const items = await CartItem.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: ProductVariant, as: 'variant',
        include: [{
          model: Product, as: 'product',
          include: [{ model: ProductImage, as: 'images', where: { is_primary: true }, required: false }],
        }],
      }],
      order: [['created_at', 'DESC']],
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy giỏ hàng' });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { variant_id, quantity = 1 } = req.body;
    const variant = await ProductVariant.findByPk(variant_id);
    if (!variant) return res.status(404).json({ message: 'Không tìm thấy biến thể sản phẩm' });
    if (variant.stock < quantity) return res.status(400).json({ message: 'Sản phẩm không đủ số lượng trong kho' });

    let item = await CartItem.findOne({ where: { user_id: req.user.id, variant_id } });
    if (item) {
      item.quantity += quantity;
      await item.save();
    } else {
      item = await CartItem.create({ user_id: req.user.id, variant_id, quantity });
    }
    res.json({ message: 'Đã thêm vào giỏ hàng', item });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi thêm vào giỏ hàng' });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const item = await CartItem.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!item) return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ' });
    const { quantity } = req.body;
    if (quantity <= 0) {
      await item.destroy();
      return res.json({ message: 'Đã xóa sản phẩm khỏi giỏ hàng' });
    }
    item.quantity = quantity;
    await item.save();
    res.json({ message: 'Cập nhật số lượng thành công', item });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật giỏ hàng' });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const item = await CartItem.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!item) return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ' });
    await item.destroy();
    res.json({ message: 'Đã xóa sản phẩm khỏi giỏ hàng' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa sản phẩm khỏi giỏ' });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await CartItem.destroy({ where: { user_id: req.user.id } });
    res.json({ message: 'Đã xóa toàn bộ giỏ hàng' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa giỏ hàng' });
  }
};
