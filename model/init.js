const Sequelize = require('sequelize')
const dbConfig = require("../config/index").dbConfig

// 建立连接
const sequelize = new Sequelize(
    dbConfig.dbName,
    dbConfig.username,
    dbConfig.password,
    {
        dialect: 'mysql',
        host: dbConfig.host,
        port: dbConfig.port,
        define: {
            ...dbConfig.define
        },
        timezone: '+08:00'
    }
)


module.exports = sequelize
