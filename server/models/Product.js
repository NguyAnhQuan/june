const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  price: { type: DataTypes.DECIMAL(12, 0), allowNull: false },
  original_price: { type: DataTypes.DECIMAL(12, 0), defaultValue: 0 },
  category_id: { type: DataTypes.INTEGER, allowNull: false },
  brand: { type: DataTypes.STRING, defaultValue: '' },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  sold_count: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'products', timestamps: true, underscored: true });

module.exports = Product;
