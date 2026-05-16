// ═══════════════════════════════════════════════
//  Favorite (Favori) Modeli
//  Kullanıcının beğendiği eserleri saklar
// ═══════════════════════════════════════════════

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Favorite = sequelize.define('favorites', {
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
  }
});

module.exports = Favorite;
