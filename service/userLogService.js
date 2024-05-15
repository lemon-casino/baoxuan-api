const userLogRepo = require("../repository/userLogRepo")
const uuidUtil = require("../utils/uuidUtil")
const redisUtil = require("../utils/redisUtil")
const userService = require("../service/userService")
const onlineCheckConst = require("../const/onlineCheckConst")


const getUserLogs = async (pageIndex, pageSize, userId, timeRange, isOnline) => {
    const userLogs = await userLogRepo.getUserLogs(parseInt(pageIndex),
        parseInt(pageSize), userId, timeRange, isOnline)
    return userLogs
}

const iAmOnline = async (userId) => {
    const userLoginKey = `${onlineCheckConst.REDIS_LOGIN_KEY_PREFIX}:${userId}`
    let logId = await redisUtil.getValue(userLoginKey)
    let createNewLog = false
    // 用户首次登录
    if (!logId) {
        // 防止Redis异常时，数据库显示在线，Redis中没有数据
        await setUserDown(userId)
        logId = uuidUtil.getId()
        createNewLog = true
    }
    // 已经登录
    else {
        const result = await userLogRepo.updateFields(logId, {
            lastOnlineTime: new Date(),
            isOnline: true
        })
        if (result[0] === 0) {
            // 人为的，且很小的概率会存在id存在修改没有结果的情况，创建时异常处理
            createNewLog = true
        }
    }

    if (createNewLog) {
        const user = await userService.getUserDetails(userId)
        const userLog = {
            userId,
            userName: user.nickname || "",
            id: logId,
            loginTime: new Date(),
            lastOnlineTime: new Date(),
            isOnline: true
        }
        try {
            await userLogRepo.saveUserLog(userLog)
        } catch (e) {
            if (e.original && e.original.code !== "ER_DUP_ENTRY") {
                throw e
            }
        }
    }

    // 比前端接口回调的频率多1倍的时间作为用户下线的判断
    await redisUtil.setValue(userLoginKey, logId, 3 * onlineCheckConst.intervalConfig.interval)
}

const iAmDown = async (userId) => {
    const userLog = await userLogRepo.getLatestUserLog(userId)
    if (userLog && userLog.id) {
        await userLogRepo.updateFields(userLog.id, {isOnline: false})
    }
}

const durationStatistic = async () => {
    const allUsers = await userService.getAllUsers()
    let userStatistic = await userLogRepo.durationStatistic()
    const loginUserIds = {}
    for (const user of userStatistic) {
        loginUserIds[user.user_id] = 1
    }
    for (const user of allUsers) {
        if (!Object.keys(loginUserIds).includes(user.user_id)) {
            userStatistic.push({
                userId: user.userId,
                userName: user.nickname,
                duration: "0"
            })
        }
    }
    userStatistic = userStatistic.sort((curr, next) => {
        return parseInt(next.duration || "0") - parseInt(curr.duration || "0")
    })
    return userStatistic
}

const setUserDown = async (userId) => {
    return await userLogRepo.setUserDown(userId)
}

module.exports = {
    getUserLogs,
    iAmOnline,
    iAmDown,
    durationStatistic,
    setUserDown
}