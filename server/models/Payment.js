const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.INTEGER, allowNull: false },
  method: { type: DataTypes.STRING, allowNull: false },
  vnpay_transaction_id: { type: DataTypes.STRING, defaultValue: '' },
  amount: { type: DataTypes.DECIMAL(12, 0), allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'), defaultValue: 'pending' },
  vnpay_response: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'payments', timestamps: true, underscored: true });

module.exports = Payment;
