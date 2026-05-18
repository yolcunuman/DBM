// ═══════════════════════════════════════════════
//  User (Kullanıcı) Modeli — PLACEHOLDER
//  NOT: Bu model Geliştirici 1'in sorumluluğundadır. 
//  İlişkilerin (Foreign Key) tam kurulabilmesi için
//  temel haliyle oluşturulmuştur. Geliştirici 1 burayı genişletecektir.
// ═══════════════════════════════════════════════

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('users', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  role: {
    type: DataTypes.STRING(50),
    defaultValue: 'USER', // 'USER' or 'ADMIN'
  }
});

module.exports = User;
