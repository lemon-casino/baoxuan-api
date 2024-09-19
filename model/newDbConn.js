const mysql = require('mysql2')
const { dbConfig } = require('../config/index')
const { logger } = require("@/utils/log")

// const pool = mysql.createPool({
//     connectionLimit: 100,
//     acquireTimeout: 10000,
//     waitForConnections: true, 
//     queueLimit: 0,
//     host: dbConfig.host,
//     user: dbConfig.username,
//     password: dbConfig.password,
//     database: 'test',
//     port: dbConfig.port,
//     dateStrings: true,
// })

const pool = mysql.createPool({
    connectionLimit: 100,
    waitForConnections: true, 
    queueLimit: 0,
    host: 'rm-2zeomo30f6062u9r37o.mysql.rds.aliyuncs.com',
    user: 'bqh',
    password: 'bqh2024^',
    database: 'test',
    port: dbConfig.port,
    dateStrings: true,
})

const query = async function (sql, params) {
    return new Promise(function (resolve, reject) {
        // console.log('sql:', sql, ', params:', params)
        pool.query(sql, params, function (err, result) {
            if (err) {
                logger.error(`mysql connect error ==> ${JSON.stringify(err)}`)
                resolve(null)
            } else {
                resolve(result)
            }
        })
    })
}

module.exports = {
    query
}