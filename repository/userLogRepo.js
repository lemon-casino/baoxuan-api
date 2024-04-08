const sequelize = require('../model/init');
const getUserLogModel = require("../model/userLogModel")
const userLogModel = getUserLogModel(sequelize)
const SQLError = require("../error/sqlError")
const sequelizeUtil = require("../utils/sequelizeUtil")
const pagingUtil = require("../utils/pagingUtil")

const saveUserLog = async (userLog) => {
    try {
        const result = await userLogModel.create(userLog)
        return sequelizeUtil.extractDataValues(result)
    } catch (e) {
        throw new SQLError(e.message, e.sql)
    }
}

const getUserLogs = async (pageIndex, pageSize, userId, timeRange) => {
    try {
        const where = {loginTime: {$between: timeRange}}
        if (userId) {
            where.userId = userId
        }
        const count = await userLogModel.count({where})
        let data = await userLogModel.findAll({
            offset: pageIndex * pageSize,
            limit: pageSize,
            where,
            order: [["loginTime", "desc"]]
        })
        data = data.map(function (item) {
            return item.get({ plain: true })
        })
        const result = pagingUtil.paging(Math.ceil(count / pageSize), count, data)
        return result
    } catch (e) {
        throw new SQLError(e.message, e.sql)
    }
}

module.exports = {
    saveUserLog,
    getUserLogs
}