const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  order_code: { type: DataTypes.STRING, allowNull: false, unique: true },
  receiver_name: { type: DataTypes.STRING, allowNull: false },
  receiver_phone: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.TEXT, allowNull: false },
  note: { type: DataTypes.TEXT, allowNull: true },
  subtotal: { type: DataTypes.DECIMAL(12, 0), allowNull: false },
  discount: { type: DataTypes.DECIMAL(12, 0), defaultValue: 0 },
  shipping_fee: { type: DataTypes.DECIMAL(12, 0), defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(12, 0), allowNull: false },
  coupon_code: { type: DataTypes.STRING, defaultValue: '' },
  payment_method: { type: DataTypes.ENUM('cod', 'vnpay'), defaultValue: 'cod' },
  payment_status: { type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'), defaultValue: 'pending' },
  order_status: { type: DataTypes.ENUM('pending', 'confirmed', 'shipping', 'completed', 'cancelled'), defaultValue: 'pending' },
}, { tableName: 'orders', timestamps: true, underscored: true });

module.exports = Order;
