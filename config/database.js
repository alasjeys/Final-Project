require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',       // MariaDB is MySQL-compatible; mysql2 driver works perfectly
    logging: false,         // set to console.log to see raw SQL
  }
);

module.exports = sequelize;
