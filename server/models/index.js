const sequelize = require('../config/database');
const User = require('./User');
const Address = require('./Address');
const Category = require('./Category');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const ProductVariant = require('./ProductVariant');
const CartItem = require('./CartItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Review = require('./Review');
const Wishlist = require('./Wishlist');
const Coupon = require('./Coupon');
const Banner = require('./Banner');
const Post = require('./Post');
const Notification = require('./Notification');
const Contact = require('./Contact');
const Setting = require('./Setting');
const Payment = require('./Payment');
const RagDocument = require('./RagDocument');
const RagChunk = require('./RagChunk');
const RagSessionChunk = require('./RagSessionChunk');
const RagChatSession = require('./RagChatSession');
const RagChatMessage = require('./RagChatMessage');

// User
User.hasMany(Address, { foreignKey: 'user_id', as: 'addresses' });
Address.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(CartItem, { foreignKey: 'user_id', as: 'cartItems' });
CartItem.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Wishlist, { foreignKey: 'user_id', as: 'wishlists' });
Wishlist.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// Category
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

Category.hasMany(Category, { foreignKey: 'parent_id', as: 'children' });
Category.belongsTo(Category, { foreignKey: 'parent_id', as: 'parent' });

// Product
Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id' });

Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants' });
ProductVariant.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Product.hasMany(Wishlist, { foreignKey: 'product_id' });
Wishlist.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Cart
CartItem.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });
ProductVariant.hasMany(CartItem, { foreignKey: 'variant_id' });

// Order
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

Order.hasMany(Payment, { foreignKey: 'order_id', as: 'payments' });
Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

OrderItem.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

// RAG / Chatbot
RagDocument.hasMany(RagChunk, { foreignKey: 'document_id', as: 'chunks', onDelete: 'CASCADE' });
RagChunk.belongsTo(RagDocument, { foreignKey: 'document_id', as: 'document' });
User.hasMany(RagDocument, { foreignKey: 'uploaded_by', as: 'ragDocuments' });
RagDocument.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

RagChatSession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(RagChatSession, { foreignKey: 'user_id', as: 'ragChatSessions' });
RagChatSession.hasMany(RagChatMessage, { foreignKey: 'chat_session_id', as: 'messages', onDelete: 'CASCADE' });
RagChatMessage.belongsTo(RagChatSession, { foreignKey: 'chat_session_id', as: 'chatSession' });

module.exports = {
  sequelize,
  User, Address, Category, Product, ProductImage, ProductVariant,
  CartItem, Order, OrderItem, Review, Wishlist, Coupon,
  Banner, Post, Notification, Contact, Setting, Payment,
  RagDocument, RagChunk, RagSessionChunk, RagChatSession, RagChatMessage,
};
