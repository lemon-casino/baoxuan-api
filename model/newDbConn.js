const mysql = require('mysql2')
const { dbConfig } = require('../config/index')

const pool = mysql.createPool({
    connectionLimit: 100,
    waitForConnections: true, 
    queueLimit: 0,
    host: dbConfig.host,
    user: dbConfig.username,
    password: dbConfig.password,
    database: 'test',
    port: dbConfig.port,
    dateStrings: true,
})

const query = async function (sql, params) {
    return new Promise(function (resolve, reject) {
        // console.log('sql:', sql, ', params:', params)
        pool.query(sql, params, function (err, result) {
            if (err) {
                console.log("mysql connect error ==>", JSON.stringify(err))
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