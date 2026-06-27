const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: true },
  type: { type: DataTypes.STRING, defaultValue: 'order' },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'notifications', timestamps: true, underscored: true });

module.exports = Notification;
