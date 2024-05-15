const userLogRepo = require("../repository/userLogRepo")
const uuidUtil = require("../utils/uuidUtil")
const redisUtil = require("../utils/redisUtil")
const userService = require("../service/userService")
const onlineCheckConst = require("../const/onlineCheckConst")

const REDIS_LOGIN_KEY_PREFIX = "login"

const getUserLogs = async (pageIndex, pageSize, userId, timeRange, isOnline) => {
    const userLogs = await userLogRepo.getUserLogs(parseInt(pageIndex),
        parseInt(pageSize), userId, timeRange, isOnline)
    return userLogs
}

const iAmOnline = async (userId) => {
    const userLoginKey = `${REDIS_LOGIN_KEY_PREFIX}:${userId}`
    let logId = await redisUtil.getKey(userLoginKey)
    // 用户首次登录
    if (!logId) {
        logId = uuidUtil.getId()
        const user = await userService.getUserDetails(userId)
        const userLog = {
            userId,
            userName: user.username || "",
            id: logId,
            loginTime: new Date(),
            lastOnlineTime: new Date(),
            isOnline: true
        }
        await userLogRepo.saveUserLog(userLog)
    }
    // 已经登录
    else {
        await userLogRepo.updateFields(logId, {
            lastOnlineTime: new Date(),
            isOnline: true
        })
    }

    // 比前端接口回调的频率多1倍的时间作为用户下线的判断
    await redisUtil.setKey(userLoginKey, logId, 2.5 * onlineCheckConst.interval)
}

const iAmDown = async (userId) => {
    const userLog = await userLogRepo.getLatestUserLog(userId)
    if (userLog && userLog.id) {
        await userLogRepo.updateFields(userLog.id, {isOnline: false})
    }
}

const durationStatistic = async () => {
    return await userLogRepo.durationStatistic()
}

module.exports = {
    getUserLogs,
    iAmOnline,
    iAmDown,
    durationStatistic
}