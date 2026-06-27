const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RagSessionChunk = sequelize.define(
  'RagSessionChunk',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    session_id: { type: DataTypes.STRING(128), allowNull: false },
    content: { type: DataTypes.TEXT('long'), allowNull: false },
    embedding: { type: DataTypes.TEXT('long'), allowNull: true },
    original_filename: { type: DataTypes.STRING(255), allowNull: true },
  },
  {
    tableName: 'rag_session_chunks',
    timestamps: true,
    underscored: true,
    updatedAt: false,
  }
);

module.exports = RagSessionChunk;
