// ═══════════════════════════════════════════════
//  Sequelize — PostgreSQL Bağlantı Ayarları
// ═══════════════════════════════════════════════

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false, // Konsolu gereksiz SQL sorgularıyla doldurmasın (kasmayı önler)
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,       // createdAt & updatedAt otomatik
      underscored: true,      // snake_case kolon isimleri (created_at)
      freezeTableName: true,  // Tablo isimlerini çoğullamayı engelle
    },
  }
);

module.exports = sequelize;
