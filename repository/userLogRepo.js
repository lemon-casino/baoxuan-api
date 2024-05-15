const Sequelize = require("sequelize")
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
            where.isOnline = isOnline.toLowerCase() === "true"
        }
        const count = await userLogModel.count({where})
        let data = await userLogModel.findAll({
            offset: pageIndex * pageSize,
            limit: pageSize,
            where,
            order: [["loginTime", "desc"]]
        })
        data = data.map((item) => {
            return item.get({plain: true})
        })
        const result = pagingUtil.paging(Math.ceil(count / pageSize), count, data)
        return result
    } catch (e) {
        throw new SQLError(e.message, e.sql)
    }
}

const updateFields = async (id, fields) => {
    const result = await userLogModel.update({...fields}, {
        where: {id}
    })
    return result
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

const durationStatistic = async () => {
    const result = await userLogModel.findAll({
        attributes: [
            ["user_name", "userName"],
            ["user_id", "userId"],
            [Sequelize.fn('SUM', Sequelize.literal('TIME_TO_SEC(TIMEDIFF(last_online_time, login_time))')), 'duration']
        ],
        group: ["user_id", "user_name"]
    })
    return sequelizeUtil.extractDataValues(result)
}

const setUserDown = async (userId) => {
    await userLogModel.update({
        isOnline: false
    }, {
        where: {userId}
    })
}

module.exports = {
    saveUserLog,
    getUserLogs,
    updateFields,
    getLatestUserLog,
    durationStatistic,
    setUserDown
}