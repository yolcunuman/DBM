// ═══════════════════════════════════════════════
//  Artwork (Eser) Modeli — PLACEHOLDER
//  NOT: Bu model Geliştirici 1'in sorumluluğundadır. 
//  Yorumlar (Comments) tablosu ile ilişkisi için
//  temel haliyle oluşturulmuştur. Geliştirici 1 burayı genişletecektir.
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
  }
});

module.exports = Artwork;
