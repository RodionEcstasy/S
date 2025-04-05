require('dotenv').config();

module.exports = {
  development: {
    dialect: process.env.DB_CLIENT || 'sqlite',
    storage: process.env.DB_FILENAME || './database.db',
    logging: console.log
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:'
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_CLIENT,
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};
