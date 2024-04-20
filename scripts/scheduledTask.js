const schedule = require("node-schedule")
const redisUtil = require("../utils/redisUtil")
const {redisKeys} = require("../const/redisConst")
const globalSetter = require("../global/setter")
const dingDingService = require("../service/dingDingService")
const flowService = require("../service/flowService")
const flowFormService = require("../service/flowFormService")
const workingDayService = require("../service/workingDayService")
const dateUtil = require("../utils/dateUtil")

// 合理调用钉钉，防止限流  当前使用版本 接口每秒调用上线为20(貌似不准确)，涉及的宜搭接口暂时没有qps和总调用量的限制
// 注意：避免测试和正式同时请求钉钉接口导致调用失败的情况

let syncWorkingDayCron = "0 5 9 * * ?"
let syncTodayRunningAndFinishedFlowsCron = "0 0/30 8-21 * * ?"
let syncMissingCompletedFlowsCron = "0 0 23 * * ?"
let syncDepartmentCron = "0 0 5 * * ?"
let syncDepartmentWithUserCron = "0 30 5 * * ?"
let syncUserWithDepartmentCron = "0 0 6 * * ?"
let syncFormCron = "0 30 6 * * ?"
if (process.env.NODE_ENV === "dev") {
    syncWorkingDayCron = "0 5 10 * * ?"
    syncTodayRunningAndFinishedFlowsCron = "0 18 10 * * ?"
    syncMissingCompletedFlowsCron = "0 13 18 * * ?"
    syncDepartmentCron = "0 10 5 * * ?"
    syncDepartmentWithUserCron =  "0 0 7 * * ?"
    syncUserWithDepartmentCron = "0 30 7 * * ?"
    syncFormCron = "0 32 9 * * ?"
}

/**
 * 每天9:05确认当天是否是工作日并将日期入库
 */
schedule.scheduleJob(syncWorkingDayCron, async function () {
    const date = dateUtil.format2Str(new Date(), "YYYY-MM-DD")
    const isWorkingDay = await dingDingService.isWorkingDay(date)
    if (isWorkingDay) {
        await workingDayService.saveWorkingDay(date)
    }
})

/** 0 0/15 * * * ?
 *  每15分钟更新正在进行中的流程和今天完成的流程（包含节点的工作情况）
 */
schedule.scheduleJob(syncTodayRunningAndFinishedFlowsCron, async function () {
    const flows = await dingDingService.getTodayRunningAndFinishedFlows()
    await redisUtil.setKey(redisKeys.FlowsOfRunningAndFinishedOfToday, JSON.stringify(flows))
    globalSetter.setGlobalTodayRunningAndFinishedFlows(flows)
})

/** 0 50 23 * * ?
 * 每天23：50 获取今天完成的流程并入库，状态包含：completed、 terminated、error
 */
schedule.scheduleJob(syncMissingCompletedFlowsCron, async function () {
    await flowService.syncMissingCompletedFlows()
})

/**
 * 更新钉钉token（频率：1h）
 *
 * 注意：访问钉钉的接口都需要使用token，要保证token不能过期，默认2小时
 */
schedule.scheduleJob("0 0 0/1 * * ?", async function () {
    await dingDingService.getDingDingToken()
})

/**
 * 从钉钉更新部门信息（按天更新）
 */
schedule.scheduleJob(syncDepartmentCron, async function () {
    const depList = await dingDingService.getDepartmentFromDingDing()
    await redisUtil.setKey(redisKeys.Department, JSON.stringify(depList.result))
    globalSetter.setGlobalDepartments(depList.result)
});

/**
 * 获取部门下的员工信息（按天更新）
 *
 * 注意：该数据依赖于Redis中的department数据：要保证更新department的定时任务优先执行完成
 */
schedule.scheduleJob(syncDepartmentWithUserCron, async function () {
    const allDepartmentsWithUsers = await dingDingService.getDepartmentsWithUsersFromDingDing()
    await redisUtil.setKey(redisKeys.UsersWithJoinLaunchDataUnderDepartment, JSON.stringify(allDepartmentsWithUsers))
    globalSetter.setGlobalUsersOfDepartments(allDepartmentsWithUsers)
});

/**
 * 获取员工信息（附带所属的部门信息）（按天更新）
 *
 * 注意：该数据依赖于Redis中的department数据：要保证更新department的定时任务优先执行完成
 */
schedule.scheduleJob(syncUserWithDepartmentCron, async function () {
    const usersWithDepartment = await dingDingService.getUsersWithDepartmentFromDingDing()
    await redisUtil.setKey(redisKeys.AllUsersDetailWithJoinLaunchData, JSON.stringify(usersWithDepartment))
    globalSetter.setGlobalUsers(usersWithDepartment)
})

/**
 * 更新Form和Form的详细信息（按天更新）
 */
schedule.scheduleJob(syncFormCron, async function () {
    await flowFormService.syncFormsFromDingDing()
})
