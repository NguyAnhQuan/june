const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Coupon = sequelize.define('Coupon', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  discount_type: { type: DataTypes.ENUM('percent', 'fixed'), defaultValue: 'percent' },
  discount_value: { type: DataTypes.DECIMAL(12, 0), allowNull: false },
  min_order: { type: DataTypes.DECIMAL(12, 0), defaultValue: 0 },
  max_discount: { type: DataTypes.DECIMAL(12, 0), defaultValue: 0 },
  start_date: { type: DataTypes.DATE, allowNull: false },
  end_date: { type: DataTypes.DATE, allowNull: false },
  usage_limit: { type: DataTypes.INTEGER, defaultValue: 0 },
  used_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'coupons', timestamps: true, underscored: true });

module.exports = Coupon;
