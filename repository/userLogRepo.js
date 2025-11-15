const models = require('@/model')
const SQLError = require("@/error/sqlError")
const sequelizeUtil = require("@/utils/sequelizeUtil")
const pagingUtil = require("@/utils/pagingUtil")

const saveUserLog = async (userLog) => {
    try {
        const result = await models.userLogModel.create(userLog)
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
            where.isOnline = (isOnline.toString().toLowerCase() === "true")
        }
        const count = await models.userLogModel.count({where})
        let data = await models.userLogModel.findAll({
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
    const result = await models.userLogModel.update({...fields}, {
        where: {id}
    })
    return result
}

const getLatestUserLog = async (userId) => {
    const userLatestLog = await models.userLogModel.findOne({
        where: {
            userId
        },
        order: [["loginTime", "desc"]]
    })
    return sequelizeUtil.extractDataValues(userLatestLog)
}

const durationStatistic = async (userId, timeRange, isOnline) => {
    const where = {loginTime: {$between: timeRange}}
    if (userId) {
        where.userId = userId
    }
    if (isOnline) {
        where.isOnline = isOnline
    }

    const result = await models.userLogModel.findAll({
        attributes: [
            ["user_name", "userName"],
            ["user_id", "userId"],
            [models.Sequelize.fn('SUM', models.Sequelize.literal('TIME_TO_SEC(TIMEDIFF(last_online_time, login_time))')), 'duration']
        ],
        where,
        group: ["user_id", "user_name"]
    })
    return sequelizeUtil.extractDataValues(result)
}

const setUserDown = async (userId) => {
    await models.userLogModel.update({
        isOnline: false
    }, {
        where: {
            userId,
            isOnline:true
        }
    })
}

/**
 * 获取有过登录的用户
 *
 * @returns {Promise<void>}
 */
const getHasLoggedUsers = async () => {
    const loggedUsers = await models.userLogModel.findAll({
        attributes: [
            ["user_name", "userName"],
            ["user_id", "userId"]
        ],
        group: ["user_id", "user_name"]
    })

    return loggedUsers.map(user => user.get({plain: true}))
}

module.exports = {
    saveUserLog,
    getUserLogs,
    updateFields,
    getLatestUserLog,
    durationStatistic,
    setUserDown,
    getHasLoggedUsers
}