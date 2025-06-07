const mysql = require('mysql2')
const { dbConfig } = require('../config/index')
const { logger } = require("@/utils/log")

const pool = mysql.createPool({
    connectionLimit: 100,
    acquireTimeout: 10000,
    waitForConnections: true, 
    queueLimit: 0,
    host: dbConfig.host,
    user: dbConfig.username,
    password: dbConfig.password,
    database: 'danpin',
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

const transaction = async function (sqls, list) {
    return new Promise(function(resolve, reject) {
        const executeTransaction = (sqls, list) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    logger.error(`mysql connect error ==> ${JSON.stringify(err)}`)
                    resolve(false)
                    return
                }         
                const executeNextCommand = (index = 0) => {
                    if (index >= sqls.length) {
                        connection.commit((commitErr) => {
                            if (commitErr) {
                                logger.error(`mysql commit error ==> ${JSON.stringify(commitErr)}`)
                                resolve(false)
                            }
                            connection.release()
                            resolve(true)
                        })
                        return                            
                    }
                    connection.execute(sqls[index], list[index], (executeErr, result, fields) => {
                        if (executeErr) {                            
                            connection.rollback(() => {
                                connection.release()
                            })
                            logger.error(`mysql execute error ==> ${JSON.stringify(executeErr)}, ${sqls[index]}, ${JSON.stringify(list[index])}`)
                            resolve(false)
                            return
                        }
                        executeNextCommand(index + 1)
                    })
                }         
                connection.beginTransaction((beginErr) => {
                    if (beginErr) {
                        logger.error(`mysql transaction error ==> ${JSON.stringify(beginErr)}`)
                        resolve(false)
                        return
                    }
                    executeNextCommand()
                })
            })
        }        
        executeTransaction(sqls, list)
    })
}

module.exports = {
    query,
    transaction
}