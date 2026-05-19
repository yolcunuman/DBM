const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.USE_LOCAL_SQLITE !== 'true' && process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    }
  });
} else if (process.env.DB_NAME && process.env.DB_USER) {
  sequelize = new Sequelize(
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
    );
} else {
  sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: require('path').resolve(__dirname, '../../dev.db'),
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
      },
    });
}

module.exports = sequelize;
