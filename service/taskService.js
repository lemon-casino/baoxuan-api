const userRepo = require("../repository/userRepo")
const redisRepo = require("../repository/redisRepo")
const globalSetter = require("../global/setter")
const dingDingService = require("../service/dingDingService")
const flowService = require("../service/flowService")
const flowFormService = require("../service/flowFormService")
const workingDayService = require("../service/workingDayService")
const userLogService = require("../service/userLogService")
const userService = require("../service/userService")
const redisUtil = require("../utils/redisUtil")
const dateUtil = require("../utils/dateUtil")
const {redisKeys} = require("../const/redisConst")
const onlineCheckConst = require("../const/onlineCheckConst")

const syncWorkingDay = async () => {
    const date = dateUtil.format2Str(new Date(), "YYYY-MM-DD")
    const isWorkingDay = await dingDingService.isWorkingDay(date)
    if (isWorkingDay) {
        await workingDayService.saveWorkingDay(date)
    }
}

const syncTodayRunningAndFinishedFlows = async () => {
    logger.info("开始同步今日流程数据...")
    const flows = await dingDingService.getTodayRunningAndFinishedFlows()
    await redisUtil.setValue(redisKeys.FlowsOfRunningAndFinishedOfToday, JSON.stringify(flows))
    globalSetter.setGlobalTodayRunningAndFinishedFlows(flows)
    logger.info(`同步完成，共:${flows.length}条数据`)
}

const syncMissingCompletedFlows = async () => {
    console.log("开始同步历史已完成流程...")
    await flowService.syncMissingCompletedFlows()
    console.log("同步历史已完成流程结束")
}

const syncDingDingToken = async () => {
    await dingDingService.getDingDingToken()
}

const syncDepartment = async () => {
    const depList = await dingDingService.getDepartmentFromDingDing()
    await redisUtil.setValue(redisKeys.Department, JSON.stringify(depList.result))
    globalSetter.setGlobalDepartments(depList.result)
}

const syncDepartmentWithUser = async () => {
    const allDepartmentsWithUsers = await dingDingService.getDepartmentsWithUsersFromDingDing()
    await redisUtil.setValue(redisKeys.UsersUnderDepartment, JSON.stringify(allDepartmentsWithUsers))
    globalSetter.setGlobalUsersOfDepartments(allDepartmentsWithUsers)
}

const syncUserWithDepartment = async () => {
    const usersWithDepartment = await dingDingService.getUsersWithDepartmentFromDingDing()
    await redisUtil.setValue(redisKeys.AllUsersWithDepartment, JSON.stringify(usersWithDepartment))
    globalSetter.setGlobalUsers(usersWithDepartment)
    await userService.syncUserToDB(usersWithDepartment)
}

const syncForm = async () => {
    await flowFormService.syncFormsFromDingDing()
}

const syncUserLogin = async () => {
    const userOnlineInRedis = await redisUtil.getKeys(
        `${onlineCheckConst.REDIS_LOGIN_KEY_PREFIX}:*`)

    if (userOnlineInRedis && userOnlineInRedis.length > 0) {
        const userIdsOnlineInRedis = userOnlineInRedis.map(item => item.split(":")[1])

        const pageData = await userLogService.getUserLogs(0, 999, "",
            [dateUtil.startOfDay(dateUtil.dateOfEarliest()), dateUtil.endOfToday()],
            true)
        const usersOnlineInDb = pageData.data
        for (const user of usersOnlineInDb) {
            if (!userIdsOnlineInRedis.includes(user.userId)) {
                await userLogService.setUserDown(user.userId)
            }
        }
    }
}

const syncResignEmployeeInfo = async () => {
    const accessToken = await redisRepo.getBiToken();
    const allResignEmployees = await userRepo.getResignEmployees(accessToken)
    // 更新人员离职信息
    for (const employee of allResignEmployees) {
        employee.lastWorkDay = new Date(employee.lastWorkDay)
        employee.resignStatus = employee.status
        employee.voluntaryReason = JSON.stringify(employee.voluntaryReason)
        employee.passiveReason = JSON.stringify(employee.passiveReason)
        await userRepo.updateUserResignInfo(employee)
    }
}

module.exports = {
    syncWorkingDay,
    syncTodayRunningAndFinishedFlows,
    syncMissingCompletedFlows,
    syncDepartment,
    syncDepartmentWithUser,
    syncUserWithDepartment,
    syncForm,
    syncDingDingToken,
    syncUserLogin,
    syncResignEmployeeInfo
}