const { Coupon } = require('../models');

exports.apply = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const coupon = await Coupon.findOne({ where: { code, is_active: true } });
    if (!coupon) return res.status(404).json({ message: 'Mã giảm giá không hợp lệ' });

    const now = new Date();
    if (now < new Date(coupon.start_date)) return res.status(400).json({ message: 'Mã giảm giá chưa có hiệu lực' });
    if (now > new Date(coupon.end_date)) return res.status(400).json({ message: 'Mã giảm giá đã hết hạn' });
    if (coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit) return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng' });
    if (subtotal < Number(coupon.min_order)) return res.status(400).json({ message: `Đơn hàng tối thiểu ${Number(coupon.min_order).toLocaleString('vi-VN')}đ` });

    let discount = 0;
    if (coupon.discount_type === 'percent') {
      discount = Math.floor(subtotal * Number(coupon.discount_value) / 100);
      if (Number(coupon.max_discount) > 0 && discount > Number(coupon.max_discount)) discount = Number(coupon.max_discount);
    } else {
      discount = Number(coupon.discount_value);
    }

    res.json({ message: 'Áp dụng mã giảm giá thành công', discount, coupon: { code: coupon.code, discount_type: coupon.discount_type, discount_value: coupon.discount_value } });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi áp dụng mã giảm giá' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const coupons = await Coupon.findAll({ order: [['created_at', 'DESC']] });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách mã giảm giá' });
  }
};

exports.create = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ message: 'Tạo mã giảm giá thành công', coupon });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo mã giảm giá' });
  }
};

exports.update = async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
    await coupon.update(req.body);
    res.json({ message: 'Cập nhật mã giảm giá thành công', coupon });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật mã giảm giá' });
  }
};

exports.remove = async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
    await coupon.destroy();
    res.json({ message: 'Xóa mã giảm giá thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa mã giảm giá' });
  }
};
