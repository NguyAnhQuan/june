const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  image: { type: DataTypes.STRING, defaultValue: '' },
  parent_id: { type: DataTypes.INTEGER, defaultValue: null },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'categories', timestamps: true, underscored: true });

module.exports = Category;
