const { Op } = require('sequelize');
const xlsx = require('xlsx');
const { sequelize, User, Order, OrderItem, Product, ProductVariant, Setting } = require('../models');


exports.getDashboard = async (req, res) => {
  try {
    const totalRevenue = await Order.sum('total', { where: { payment_status: 'paid' } }) || 0;
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({ where: { order_status: 'pending' } });
    const totalCustomers = await User.count({ where: { role: 'user' } });
    const totalProducts = await Product.count();

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthRevenue = await Order.sum('total', { where: { payment_status: 'paid', created_at: { [Op.gte]: startOfMonth } } }) || 0;
    const monthOrders = await Order.count({ where: { created_at: { [Op.gte]: startOfMonth } } });
    const newCustomers = await User.count({ where: { role: 'user', created_at: { [Op.gte]: startOfMonth } } });

    const recentOrders = await Order.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']],
      limit: 10,
    });

    const topProducts = await Product.findAll({
      order: [['sold_count', 'DESC']],
      limit: 10,
      attributes: ['id', 'name', 'price', 'sold_count'],
    });

    res.json({
      totalRevenue, totalOrders, pendingOrders, totalCustomers, totalProducts,
      monthRevenue, monthOrders, newCustomers,
      recentOrders, topProducts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy thống kê' });
  }
};

exports.getRevenue = async (req, res) => {
  try {
    const { period = 'month', year = new Date().getFullYear() } = req.query;
    let data;

    if (period === 'day') {
      const { month = new Date().getMonth() + 1 } = req.query;
      data = await Order.findAll({
        attributes: [
          [sequelize.fn('DAY', sequelize.col('created_at')), 'day'],
          [sequelize.fn('SUM', sequelize.col('total')), 'revenue'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'orders'],
        ],
        where: {
          payment_status: 'paid',
          created_at: {
            [Op.gte]: new Date(year, month - 1, 1),
            [Op.lt]: new Date(year, month, 1),
          },
        },
        group: [sequelize.fn('DAY', sequelize.col('created_at'))],
        raw: true,
      });
    } else {
      data = await Order.findAll({
        attributes: [
          [sequelize.fn('MONTH', sequelize.col('created_at')), 'month'],
          [sequelize.fn('SUM', sequelize.col('total')), 'revenue'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'orders'],
        ],
        where: {
          payment_status: 'paid',
          created_at: {
            [Op.gte]: new Date(year, 0, 1),
            [Op.lt]: new Date(parseInt(year) + 1, 0, 1),
          },
        },
        group: [sequelize.fn('MONTH', sequelize.col('created_at'))],
        raw: true,
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy báo cáo doanh thu' });
  }
};

exports.getInventory = async (req, res) => {
  try {
    const { low_stock } = req.query;
    const where = {};

    const products = await Product.findAll({
      include: [{
        model: ProductVariant, as: 'variants',
        ...(low_stock ? { where: { stock: { [Op.lte]: 10 } } } : {}),
      }],
      order: [['name', 'ASC']],
    });

    const inventory = products.map(p => ({
      id: p.id,
      name: p.name,
      variants: p.variants.map(v => ({ id: v.id, size: v.size, color: v.color, stock: v.stock, sku: v.sku })),
      totalStock: p.variants.reduce((sum, v) => sum + v.stock, 0),
    }));

    if (low_stock) {
      res.json(inventory.filter(p => p.totalStock <= 10));
    } else {
      res.json(inventory);
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy báo cáo tồn kho' });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const where = { role: 'user' };
    if (search) where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }];

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
    });

    res.json({ customers: rows, pagination: { total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách khách hàng' });
  }
};

exports.getCustomerDetail = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    const orders = await Order.findAll({ where: { user_id: user.id }, order: [['created_at', 'DESC']], limit: 20 });
    const totalSpent = await Order.sum('total', { where: { user_id: user.id, payment_status: 'paid' } }) || 0;
    res.json({ customer: user, orders, totalSpent });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy thông tin khách hàng' });
  }
};

exports.toggleCustomerStatus = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
    user.is_active = !user.is_active;
    await user.save();
    res.json({ message: user.is_active ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản', is_active: user.is_active });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật trạng thái' });
  }
};

exports.getSettings = async (req, res) => {
  try {
    const settings = await Setting.findAll();
    const result = {};
    settings.forEach(s => { result[s.key] = s.value; });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy cấu hình' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await Setting.upsert({ key, value });
    }
    res.json({ message: 'Cập nhật cấu hình thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật cấu hình' });
  }
};

exports.exportRevenue = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const orders = await Order.findAll({
      where: {
        payment_status: 'paid',
        created_at: { [Op.gte]: new Date(year, 0, 1), [Op.lt]: new Date(parseInt(year) + 1, 0, 1) },
      },
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
      order: [['created_at', 'DESC']],
    });

    const data = orders.map(o => ({
      'Mã đơn': o.order_code,
      'Khách hàng': o.user?.name || '',
      'Email': o.user?.email || '',
      'Ngày đặt': new Date(o.created_at).toLocaleDateString('vi-VN'),
      'Tạm tính': Number(o.subtotal),
      'Giảm giá': Number(o.discount),
      'Phí ship': Number(o.shipping_fee),
      'Tổng cộng': Number(o.total),
      'Thanh toán': o.payment_method === 'cod' ? 'COD' : 'VNPay',
      'Trạng thái': o.order_status,
    }));

    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, `Doanh thu ${year}`);

    const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=doanh-thu-${year}.xlsx`);
    res.send(buf);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi xuất Excel' });
  }
};

