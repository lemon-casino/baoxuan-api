// 需要把旧的引用init获取model的方式清理后才能删除该模块

const Sequelize = require('sequelize')
const dbConfig = require("../config/index").dbConfig
const Op = Sequelize.Op;
const operatorsAliases = {
    $eq: Op.eq,
    $ne: Op.ne,
    $gte: Op.gte,
    $gt: Op.gt,
    $lte: Op.lte,
    $lt: Op.lt,
    $not: Op.not,
    $in: Op.in,
    $notIn: Op.notIn,
    $is: Op.is,
    $like: Op.like,
    $notLike: Op.notLike,
    $iLike: Op.iLike,
    $notILike: Op.notILike,
    $regexp: Op.regexp,
    $notRegexp: Op.notRegexp,
    $iRegexp: Op.iRegexp,
    $notIRegexp: Op.notIRegexp,
    $between: Op.between,
    $notBetween: Op.notBetween,
    $overlap: Op.overlap,
    $contains: Op.contains,
    $contained: Op.contained,
    $adjacent: Op.adjacent,
    $strictLeft: Op.strictLeft,
    $strictRight: Op.strictRight,
    $noExtendRight: Op.noExtendRight,
    $noExtendLeft: Op.noExtendLeft,
    $and: Op.and,
    $or: Op.or,
    $any: Op.any,
    $all: Op.all,
    $values: Op.values,
    $col: Op.col
};

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
        timezone: '+08:00',
        operatorsAliases,
        logging: dbConfig.logging,
        pool: {
            max: 20,      // 连接池中最大连接数量
            min: 5,       // 连接池中最小连接数量
            acquire: 120000, // 获取连接的最长等待时间 (毫秒)
            idle: 10000   // 连接在断开前的最大空闲时间 (毫秒)
        }
    },
)


module.exports = sequelize
