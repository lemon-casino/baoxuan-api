const sequelize = require('../model/init');
const getUserLogModel = require("../model/userLogModel")
const userLogModel = getUserLogModel(sequelize)
const SQLError = require("../error/sqlError")
const sequelizeUtil = require("../utils/sequelizeUtil")
const pagingUtil = require("../utils/pagingUtil")
const dateUtil = require("../utils/dateUtil")

const saveUserLog = async (userLog) => {
    try {
        const result = await userLogModel.create(userLog)
        return sequelizeUtil.extractDataValues(result)
    } catch (e) {
        throw new SQLError(e.message, e.sql)
    }
}

const getUserLogs = async (pageIndex, pageSize, userId, timeRange, isOnline) => {
    try {
        const where = {loginTime: {$between: timeRange}}
        if (userId) {
            where.userId = userId
        }
        if (isOnline) {
            where.isOnline = isOnline
        }
        const count = await userLogModel.count({where})
        let data = await userLogModel.findAll({
            offset: pageIndex * pageSize,
            limit: pageSize,
            where,
            order: [["loginTime", "desc"]]
        })
        data = sequelizeUtil.extractDataValues(data)
        data = data.map((item) => {
            return {
                ...item,
                loginTime: dateUtil.format2Str(item.loginTime),
                lastOnlineTime: item.lastOnlineTime && dateUtil.format2Str(item.lastOnlineTime),
            }
        })
        const result = pagingUtil.paging(Math.ceil(count / pageSize), count, data)
        return result
    } catch (e) {
        throw new SQLError(e.message, e.sql)
    }
}

const updateFields = (id, fields) => {
    userLogModel.update({...fields}, {
        where: {id}
    })
}

const getLatestUserLog = async (userId) => {
    const userLatestLog = await userLogModel.findOne({
        where: {
            userId
        },
        order: [["loginTime", "desc"]]
    })
    return sequelizeUtil.extractDataValues(userLatestLog)
}

module.exports = {
    saveUserLog,
    getUserLogs,
    updateFields,
    getLatestUserLog
}