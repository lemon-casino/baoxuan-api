const defaultConfig = require('./default')

const configs = {
    ...defaultConfig,
    redisConfig:{
        port: 6379,
        url: '127.0.0.1',
        password: 'myredis123456',
        ddSuiteKey: "",
    },
    dbConfig: {
        dbName: 'Bi_serve',
        username: 'bqh',
        password: 'bqh2024^',
        host: 'rm-2zeomo30f6062u9r37o.mysql.rds.aliyuncs.com',
        port: 3306,
        define: {
            timestamps: false
        },
        logging: false,
        timezone: '+08:00'
    },
    serverConfig:{
        port: 9999
    }
}

module.exports = configs