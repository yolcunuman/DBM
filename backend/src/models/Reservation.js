// ═══════════════════════════════════════════════
//  Reservation (Rezervasyon) Modeli
//  Geliştirici 2 — Madde 4, 5, 8
// ═══════════════════════════════════════════════

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reservation = sequelize.define('reservations', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Rezervasyon yapan kullanıcı (Users tablosuna FK — Geliştirici 1)',
  },
  workshop_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Rezervasyon yapılan atölye',
  },
  num_participants: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: { min: 1, max: 10 },
    comment: 'Katılımcı sayısı',
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Toplam ücret (katılımcı sayısı × birim fiyat)',
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
    defaultValue: 'pending',
    comment: 'Rezervasyon durumu',
  },
  reservation_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Rezervasyonun yapıldığı tarih',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Kullanıcı notu (opsiyonel)',
  },
});

module.exports = Reservation;
