// ═══════════════════════════════════════════════
//  SupportTicket (Destek Talebi) Modeli
//  Geliştirici 2 — Madde 10, 16
// ═══════════════════════════════════════════════

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SupportTicket = sequelize.define('support_tickets', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Destek talebi oluşturan kullanıcı (Users tablosuna FK — Geliştirici 1)',
  },
  subject: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Talep konusu',
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Talep mesajı',
  },
  category: {
    type: DataTypes.ENUM('general', 'order', 'reservation', 'technical', 'other'),
    defaultValue: 'general',
    comment: 'Talep kategorisi',
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium',
    comment: 'Öncelik seviyesi',
  },
  status: {
    type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
    defaultValue: 'open',
    comment: 'Talep durumu',
  },
  admin_response: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Yönetici yanıtı',
  },
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Çözüm tarihi',
  },
});

module.exports = SupportTicket;
