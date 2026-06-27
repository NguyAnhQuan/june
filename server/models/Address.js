const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Address = sequelize.define('Address', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  province: { type: DataTypes.STRING, allowNull: false },
  district: { type: DataTypes.STRING, allowNull: false },
  ward: { type: DataTypes.STRING, allowNull: false },
  detail: { type: DataTypes.STRING, allowNull: false },
  is_default: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'addresses', timestamps: true, underscored: true });

module.exports = Address;
