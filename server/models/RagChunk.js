const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RagChunk = sequelize.define(
  'RagChunk',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    document_id: { type: DataTypes.INTEGER, allowNull: false },
    chunk_index: { type: DataTypes.INTEGER, allowNull: false },
    content: { type: DataTypes.TEXT('long'), allowNull: false },
    /** JSON mảng số thực (vector embedding), có thể null khi chỉ dùng tìm theo từ khóa */
    embedding: { type: DataTypes.TEXT('long'), allowNull: true },
  },
  {
    tableName: 'rag_chunks',
    timestamps: true,
    underscored: true,
    updatedAt: false,
  }
);

module.exports = RagChunk;
