// ═══════════════════════════════════════════════
//  Workshop (Atölye/Etkinlik) Modeli
//  Geliştirici 2 — Madde 2, 11
// ═══════════════════════════════════════════════

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Workshop = sequelize.define('workshops', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Atölye/Etkinlik başlığı',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Atölye açıklaması',
  },
  instructor: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Eğitmen adı',
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Genel',
    comment: 'Kategori (Resim, Heykel, Seramik vb.)',
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Etkinlik tarihi',
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'Başlangıç saati',
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false,
    comment: 'Bitiş saati',
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: 'Katılım ücreti (TL)',
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 20,
    comment: 'Toplam kontenjan',
  },
  enrolled: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Kayıtlı katılımcı sayısı',
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Etkinlik mekanı/adresi',
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Atölye görseli URL',
  },
  status: {
    type: DataTypes.ENUM('active', 'cancelled', 'completed'),
    defaultValue: 'active',
    comment: 'Etkinlik durumu',
  },
});

module.exports = Workshop;
