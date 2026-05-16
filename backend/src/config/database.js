const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = process.env.DB_NAME && process.env.DB_USER
  ? new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false,
        define: {
          timestamps: true,
          underscored: true,
          freezeTableName: true,
        },
      }
    )
  : new Sequelize({
      dialect: 'sqlite',
      storage: require('path').resolve(__dirname, '../../dev.db'),
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
      },
    });

module.exports = sequelize;
