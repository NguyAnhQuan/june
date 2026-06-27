const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RagChatSession = sequelize.define(
  'RagChatSession',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    public_session_key: { type: DataTypes.STRING(128), allowNull: false, unique: true },
    user_id: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: 'rag_chat_sessions',
    timestamps: true,
    underscored: true,
  }
);

module.exports = RagChatSession;
