const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  content: { type: DataTypes.TEXT('long'), allowNull: true },
  thumbnail: { type: DataTypes.STRING, defaultValue: '' },
  is_published: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'posts', timestamps: true, underscored: true });

module.exports = Post;
