const userLogRepo = require("../repository/userLogRepo")
const uuidUtil = require("../utils/uuidUtil")

const saveUserLog = async (userLog) => {
    userLog.id = uuidUtil.getId()
    userLog.loginTime = new Date()
    const result = await userLogRepo.saveUserLog(userLog)
    return result
}

const getUserLogs = async (pageIndex, pageSize, userId, timeRange) => {
    const userLogs = await userLogRepo.getUserLogs(parseInt(pageIndex), parseInt(pageSize), userId, timeRange)
    return userLogs
}

module.exports = {
    saveUserLog,
    getUserLogs
}