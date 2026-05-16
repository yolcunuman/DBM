// ═══════════════════════════════════════════════
//  Artwork (Eser) Modeli — Geliştirici 2
//  Sanat eserleri: başlık, açıklama, sanatçı, fiyat,
//  görsel, kategori, stok durumu vb.
// ═══════════════════════════════════════════════

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Artwork = sequelize.define('artworks', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  artist_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'Bilinmeyen Sanatçı',
  },
  artist_bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Diğer',
  },
  technique: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  dimensions: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  image_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  }
});

module.exports = Artwork;
