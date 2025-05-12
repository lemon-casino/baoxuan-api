const defaultConfig = require('./default')
const nConf = require("nconf")
nConf.env()

const configs = {
    ...defaultConfig,
    redisConfig: {
        port: 6379,
        url: '127.0.0.1',
        password: nConf.get("BI_PROD_REDIS_PWD"),
        ddSuiteKey: "",
    },
    dbConfig: {
        dbName: nConf.get("BI_PROD_DB_NAME"),
        username: nConf.get("BI_PROD_DB_USER_NAME"),
        password: nConf.get("BI_PROD_DB_PWD"),
        host: nConf.get("BI_PROD_DB_HOST"),
        port: nConf.get("BI_PROD_DB_PORT"),
        define: {
            timestamps: false
        },
        logging: false,
        timezone: '+08:00'
    },
    bpmDbConfig: {
        dbName: nConf.get("BPM_PROD_DB_NAME"),
        username: nConf.get("BPM_PROD_DB_USER_NAME"),
        password: nConf.get("BPM_PROD_DB_PWD"),
        host: nConf.get("BPM_PROD_DB_HOST"),
        port: nConf.get("BPM_PROD_DB_PORT"),
        define: {
            timestamps: false
        },
        logging: false,
        timezone: '+08:00'
    },
    serverConfig: {
        port: nConf.get("BI_PROD_SERVER_PORT")
    }
}

module.exports = configs