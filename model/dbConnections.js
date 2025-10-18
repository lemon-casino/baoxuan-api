const { Sequelize } = require('sequelize');
const { dbConfig } = require('../config/index');
const cloudStockpileDB = new Sequelize("cloud_stockpile", dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'mysql',
    define: dbConfig.define,
    logging: dbConfig.logging,
    timezone: dbConfig.timezone,
});

module.exports = cloudStockpileDB
