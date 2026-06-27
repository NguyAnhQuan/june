const { Review, User, Product, Order, OrderItem } = require('../models');

exports.getByProduct = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { product_id: req.params.productId, is_approved: true },
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }],
      order: [['created_at', 'DESC']],
    });
    const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;
    res.json({ reviews, avgRating: parseFloat(avgRating), totalReviews: reviews.length });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy đánh giá' });
  }
};

exports.create = async (req, res) => {
  try {
    const { product_id, order_id, rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Đánh giá phải từ 1 đến 5 sao' });

    const where = { user_id: req.user.id, product_id };
    if (order_id) {
      where.order_id = order_id;
    } else {
      const existing = await Review.findOne({ where });
      if (existing) return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi' });
    }

    if (order_id) {
      const existing = await Review.findOne({ where });
      if (existing) return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này trong đơn hàng này' });
    }

    const review = await Review.create({ user_id: req.user.id, product_id, order_id: order_id || null, rating, comment: comment || '' });
    res.status(201).json({ message: 'Đánh giá thành công', review });
  } catch (error) {
    console.error('Review create error:', error);
    res.status(500).json({ message: 'Lỗi đánh giá sản phẩm' });
  }
};

exports.getAllAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { count, rows } = await Review.findAndCountAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }, { model: Product, as: 'product', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
    });
    res.json({ reviews: rows, pagination: { total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy đánh giá' });
  }
};

exports.approve = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    review.is_approved = req.body.is_approved !== undefined ? req.body.is_approved : !review.is_approved;
    await review.save();
    res.json({ message: review.is_approved ? 'Đã duyệt đánh giá' : 'Đã ẩn đánh giá', review });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi duyệt đánh giá' });
  }
};

exports.remove = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    await review.destroy();
    res.json({ message: 'Xóa đánh giá thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa đánh giá' });
  }
};
