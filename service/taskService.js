const redisUtil = require("../utils/redisUtil")
const {redisKeys} = require("../const/redisConst")
const globalSetter = require("../global/setter")
const dingDingService = require("../service/dingDingService")
const flowService = require("../service/flowService")
const flowFormService = require("../service/flowFormService")
const workingDayService = require("../service/workingDayService")
const dateUtil = require("../utils/dateUtil")

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
    await redisUtil.setKey(redisKeys.FlowsOfRunningAndFinishedOfToday, JSON.stringify(flows))
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
    await redisUtil.setKey(redisKeys.Department, JSON.stringify(depList.result))
    globalSetter.setGlobalDepartments(depList.result)
}

const syncDepartmentWithUser = async () => {
    const allDepartmentsWithUsers = await dingDingService.getDepartmentsWithUsersFromDingDing()
    await redisUtil.setKey(redisKeys.UsersUnderDepartment, JSON.stringify(allDepartmentsWithUsers))
    globalSetter.setGlobalUsersOfDepartments(allDepartmentsWithUsers)
}

const syncUserWithDepartment = async () => {
    const usersWithDepartment = await dingDingService.getUsersWithDepartmentFromDingDing()
    await redisUtil.setKey(redisKeys.AllUsersWithDepartment, JSON.stringify(usersWithDepartment))
    globalSetter.setGlobalUsers(usersWithDepartment)
}

const syncForm = async () => {
    await flowFormService.syncFormsFromDingDing()
}

module.exports = {
    syncWorkingDay,
    syncTodayRunningAndFinishedFlows,
    syncMissingCompletedFlows,
    syncDepartment,
    syncDepartmentWithUser,
    syncUserWithDepartment,
    syncForm,
    syncDingDingToken
}