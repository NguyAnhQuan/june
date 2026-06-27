const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.INTEGER, allowNull: false },
  variant_id: { type: DataTypes.INTEGER, allowNull: false },
  product_name: { type: DataTypes.STRING, allowNull: false },
  product_image: { type: DataTypes.STRING, defaultValue: '' },
  size: { type: DataTypes.STRING, allowNull: false },
  color: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.DECIMAL(12, 0), allowNull: false },
}, { tableName: 'order_items', timestamps: false, underscored: true });

module.exports = OrderItem;
