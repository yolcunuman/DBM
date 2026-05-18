// ═══════════════════════════════════════════════
//  Order (Sipariş) Modeli
//  Kullanıcıların eser satın alma kayıtları
// ═══════════════════════════════════════════════

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('orders', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  artwork_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'credit_card',
  },
  shipping_address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  cancel_requested: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  cancel_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  // Yeni alanları mevcut tabloya eklemek için alter kullan
});

module.exports = Order;
