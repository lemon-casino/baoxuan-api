const schedule = require("node-schedule")
const taskService = require("../service/taskService")

// 合理调用钉钉，防止限流  当前使用版本 接口每秒调用上线为20(貌似不准确)，涉及的宜搭接口暂时没有qps和总调用量的限制
// 注意：避免测试和正式同时请求钉钉接口导致调用失败的情况

let syncWorkingDayCron = "0 5 9 * * ?"
let syncTodayRunningAndFinishedFlowsCron = "0 0/5 9-22 * * ?"
let syncMissingCompletedFlowsCron = "0 0 23 * * ?"
let syncDepartmentCron = "0 0 5 * * ?"
let syncDepartmentWithUserCron = "0 30 5 * * ?"
let syncUserWithDepartmentCron = "0 0 6 * * ?"
let syncFormCron = "0 30 6 * * ?"
let syncUserLogin = "0 0/5 * * * ?"
if (process.env.NODE_ENV === "dev") {
    syncWorkingDayCron = "0 5 10 * * ?"
    syncTodayRunningAndFinishedFlowsCron = "0 10 12 * * ?"
    syncMissingCompletedFlowsCron = "0 0 22 * * ?"
    syncDepartmentCron = "0 10 5 * * ?"
    syncDepartmentWithUserCron = "0 0 7 * * ?"
    syncUserWithDepartmentCron = "0 30 7 * * ?"
    syncFormCron = "0 18 11 * * ?"
    syncUserLogin = "40 20 23 * * ?"
}

/**
 * 每天9:05确认当天是否是工作日并将日期入库
 */
schedule.scheduleJob(syncWorkingDayCron, async function () {
    await taskService.syncWorkingDay()
})

/** 0 0/15 * * * ?
 *  每15分钟更新正在进行中的流程和今天完成的流程（包含节点的工作情况）
 */
schedule.scheduleJob(syncTodayRunningAndFinishedFlowsCron, async function () {
    await taskService.syncTodayRunningAndFinishedFlows()
})

/** 0 50 23 * * ?
 * 每天23：50 获取今天完成的流程并入库，状态包含：completed、 terminated、error
 */
schedule.scheduleJob(syncMissingCompletedFlowsCron, async function () {
    // await taskService.syncMissingCompletedFlows()
})

/**
 * 更新钉钉token（频率：1h）
 *
 * 注意：访问钉钉的接口都需要使用token，要保证token不能过期，默认2小时
 */
schedule.scheduleJob("0 0 0/1 * * ?", async function () {
    await taskService.syncDingDingToken()
})

/**
 * 从钉钉更新部门信息（按天更新）
 */
schedule.scheduleJob(syncDepartmentCron, async function () {
    await taskService.syncDepartment()
})

/**
 * 获取部门下的员工信息（按天更新）
 *
 * 注意：该数据依赖于Redis中的department数据：要保证更新department的定时任务优先执行完成
 */
schedule.scheduleJob(syncDepartmentWithUserCron, async function () {
    await taskService.syncDepartmentWithUser()
});

/**
 * 获取员工信息（附带所属的部门信息）（按天更新）
 *
 * 注意：该数据依赖于Redis中的department数据：要保证更新department的定时任务优先执行完成
 */
schedule.scheduleJob(syncUserWithDepartmentCron, async function () {
    await taskService.syncUserWithDepartment()
})

/**
 * 更新Form和Form的详细信息（按天更新）
 */
schedule.scheduleJob(syncFormCron, async function () {
    await taskService.syncForm()
})


schedule.scheduleJob(syncUserLogin, async function () {
    await taskService.syncUserLogin()
})

