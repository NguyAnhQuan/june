const { Op } = require('sequelize');
const { Order, OrderItem, CartItem, ProductVariant, Product, ProductImage, User, Payment, Notification, Coupon, sequelize } = require('../models');
const emailService = require('../utils/emailService');


const generateOrderCode = () => {
  const date = new Date();
  const prefix = 'JN';
  const timestamp = date.getFullYear().toString().slice(2) + String(date.getMonth() + 1).padStart(2, '0') + String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp}${random}`;
};

exports.create = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { receiver_name, receiver_phone, address, note, payment_method, coupon_code, shipping_fee = 30000 } = req.body;

    const cartItems = await CartItem.findAll({
      where: { user_id: req.user.id },
      include: [{ model: ProductVariant, as: 'variant', include: [{ model: Product, as: 'product', include: [{ model: ProductImage, as: 'images', where: { is_primary: true }, required: false }] }] }],
    });

    if (cartItems.length === 0) return res.status(400).json({ message: 'Giỏ hàng trống' });

    let subtotal = 0;
    const orderItems = [];
    for (const item of cartItems) {
      const variant = item.variant;
      if (variant.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({ message: `Sản phẩm "${variant.product.name}" (${variant.size}/${variant.color}) không đủ số lượng` });
      }
      const itemPrice = Number(variant.product.price);
      subtotal += itemPrice * item.quantity;
      orderItems.push({
        variant_id: variant.id,
        product_name: variant.product.name,
        product_image: variant.product.images?.[0]?.image_url || '',
        size: variant.size,
        color: variant.color,
        quantity: item.quantity,
        price: itemPrice,
      });
    }

    let discount = 0;
    if (coupon_code) {
      const coupon = await Coupon.findOne({ where: { code: coupon_code, is_active: true } });
      if (coupon && new Date() >= coupon.start_date && new Date() <= coupon.end_date && (coupon.usage_limit === 0 || coupon.used_count < coupon.usage_limit) && subtotal >= Number(coupon.min_order)) {
        if (coupon.discount_type === 'percent') {
          discount = Math.floor(subtotal * Number(coupon.discount_value) / 100);
          if (Number(coupon.max_discount) > 0 && discount > Number(coupon.max_discount)) discount = Number(coupon.max_discount);
        } else {
          discount = Number(coupon.discount_value);
        }
        coupon.used_count += 1;
        await coupon.save({ transaction: t });
      }
    }

    const total = subtotal - discount + Number(shipping_fee);
    const order = await Order.create({
      user_id: req.user.id,
      order_code: generateOrderCode(),
      receiver_name, receiver_phone, address,
      note: note || '',
      subtotal, discount, shipping_fee, total,
      coupon_code: coupon_code || '',
      payment_method: payment_method || 'cod',
      payment_status: 'pending',
      order_status: 'pending',
    }, { transaction: t });

    for (const item of orderItems) {
      await OrderItem.create({ order_id: order.id, ...item }, { transaction: t });
    }

    for (const item of cartItems) {
      await ProductVariant.decrement('stock', { by: item.quantity, where: { id: item.variant_id }, transaction: t });
      await Product.increment('sold_count', { by: item.quantity, where: { id: item.variant.product_id }, transaction: t });
    }

    await CartItem.destroy({ where: { user_id: req.user.id }, transaction: t });

    await Payment.create({ order_id: order.id, method: payment_method || 'cod', amount: total, status: 'pending' }, { transaction: t });

    await Notification.create({ user_id: req.user.id, title: 'Đặt hàng thành công', message: `Đơn hàng #${order.order_code} đã được đặt thành công`, type: 'order' }, { transaction: t });

    await t.commit();

    const fullOrder = await Order.findByPk(order.id, { include: [{ model: OrderItem, as: 'items' }] });

    // Gửi email xác nhận đơn hàng
    try {
      const user = await User.findByPk(req.user.id, { attributes: ['name', 'email'] });
      if (user?.email) await emailService.sendOrderConfirmation(user.email, user.name, fullOrder);
    } catch (emailErr) { console.error('Email error:', emailErr.message); }

    res.status(201).json({ message: 'Đặt hàng thành công', order: fullOrder });

  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ message: 'Lỗi đặt hàng' });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const where = { user_id: req.user.id };
    if (status) where.order_status = status;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [{ model: OrderItem, as: 'items' }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
    });

    res.json({ orders: rows, pagination: { total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách đơn hàng' });
  }
};

exports.getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [{ model: OrderItem, as: 'items' }, { model: Payment, as: 'payments' }],
    });
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết đơn hàng' });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    if (order.order_status !== 'pending') return res.status(400).json({ message: 'Chỉ có thể hủy đơn hàng đang chờ xác nhận' });

    const items = await OrderItem.findAll({ where: { order_id: order.id } });
    for (const item of items) {
      await ProductVariant.increment('stock', { by: item.quantity, where: { id: item.variant_id } });
    }

    order.order_status = 'cancelled';
    await order.save();

    await Notification.create({ user_id: req.user.id, title: 'Hủy đơn hàng', message: `Đơn hàng #${order.order_code} đã được hủy`, type: 'order' });

    res.json({ message: 'Hủy đơn hàng thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi hủy đơn hàng' });
  }
};

// Admin
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const where = {};
    if (status) where.order_status = status;
    if (search) where.order_code = { [Op.like]: `%${search}%` };

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }, { model: OrderItem, as: 'items' }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
    });

    res.json({ orders: rows, pagination: { total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách đơn hàng' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    const { order_status, payment_status } = req.body;
    if (order_status) order.order_status = order_status;
    if (payment_status) order.payment_status = payment_status;
    if (order_status === 'completed' && order.payment_method === 'cod') order.payment_status = 'paid';
    await order.save();

    if (payment_status) {
      await Payment.update({ status: payment_status }, { where: { order_id: order.id } });
    }

    const statusMap = { pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận', shipping: 'Đang giao hàng', completed: 'Hoàn thành', cancelled: 'Đã hủy' };
    await Notification.create({ user_id: order.user_id, title: 'Cập nhật đơn hàng', message: `Đơn hàng #${order.order_code}: ${statusMap[order.order_status] || order.order_status}`, type: 'order' });

    // Gửi email thông báo thay đổi trạng thái
    if (order_status && ['confirmed', 'shipping', 'completed', 'cancelled'].includes(order_status)) {
      try {
        const user = await User.findByPk(order.user_id, { attributes: ['name', 'email'] });
        if (user?.email) await emailService.sendOrderStatusUpdate(user.email, user.name, order.order_code, order_status);
      } catch (emailErr) { console.error('Email error:', emailErr.message); }
    }

    res.json({ message: 'Cập nhật trạng thái thành công', order });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật trạng thái' });
  }
};

exports.getOrderDetailAdmin = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: 'items' }, { model: User, as: 'user', attributes: { exclude: ['password'] } }, { model: Payment, as: 'payments' }],
    });
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy chi tiết đơn hàng' });
  }
};
