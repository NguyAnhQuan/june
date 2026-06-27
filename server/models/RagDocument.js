const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RagDocument = sequelize.define(
  'RagDocument',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    original_filename: { type: DataTypes.STRING(255), allowNull: false },
    mime_type: { type: DataTypes.STRING(128), allowNull: true },
    chunk_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    uploaded_by: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: 'rag_documents',
    timestamps: true,
    underscored: true,
  }
);

module.exports = RagDocument;
