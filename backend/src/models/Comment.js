// ═══════════════════════════════════════════════
//  Comment (Yorum) Modeli
//  Geliştirici 2 — Madde 12, 13, 14, 15
// ═══════════════════════════════════════════════

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Comment = sequelize.define('comments', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Yorumu yazan kullanıcı (Users tablosuna FK — Geliştirici 1)',
  },
  target_type: {
    type: DataTypes.ENUM('artwork', 'workshop'),
    allowNull: false,
    comment: 'Yorum hedefi: eser veya atölye (polymorphic)',
  },
  target_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Hedef kaydın ID\'si (artwork_id veya workshop_id)',
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Yorum içeriği',
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 1, max: 5 },
    comment: 'Puanlama (1-5 yıldız)',
  },
  helpful_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Faydalı bulma oyu sayısı',
  },
  admin_reply: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Yönetici/Etkinlik sorumlusu yanıtı (Madde 14)',
  },
  is_verified_purchase: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Doğrulanmış satın alma/katılım (Madde 15)',
  },
});

module.exports = Comment;
