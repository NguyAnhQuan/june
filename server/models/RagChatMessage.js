const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RagChatMessage = sequelize.define(
  'RagChatMessage',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    chat_session_id: { type: DataTypes.INTEGER, allowNull: false },
    role: { type: DataTypes.ENUM('user', 'assistant', 'system'), allowNull: false },
    content: { type: DataTypes.TEXT('long'), allowNull: false },
    sources_json: { type: DataTypes.TEXT('long'), allowNull: true },
  },
  {
    tableName: 'rag_chat_messages',
    timestamps: true,
    underscored: true,
    updatedAt: false,
  }
);

module.exports = RagChatMessage;
