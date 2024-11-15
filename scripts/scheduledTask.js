const schedule = require("node-schedule")
const taskService = require("@/service/taskService")
const dateUtil = require("@/utils/dateUtil");

// 合理调用钉钉，防止限流  当前使用版本 接口每秒调用上线为20(貌似不准确)，涉及的宜搭接口暂时没有qps和总调用量的限制
// 注意：避免测试和正式同时请求钉钉接口导致调用失败的情况

let syncWorkingDayCron = "0 5 9 * * ?"
let syncTodayRunningAndFinishedFlowsCron = "0 0/20 7-21 * * ?"
let syncMissingCompletedFlowsCron = "0 30 23 * * ?"

let syncDepartmentCron = "0 0 5 * * ?"
// 如果有新人入职一般也是上午
let syncDepartmentWithUserCron = "0 30 8 * * ?"
let syncUserWithDepartmentCron = "0 0 8 * * ?"

let syncFormCron = "0 30 6 * * ?"
let syncUserLoginCron = "0 0/5 * * * ?"

// 当天下班
let syncResignEmployeeCron = "0 0 18 * * ?"
let syncRunningFlowsCron = "0 0 8 * * ?"
let tmallLinkData = "52 14 * * 1-6"
let jdLinkData  = "30 14 * * 1-6"
let caigouLinkData  = "*/5 * * * 1-6"
//转正通知 周一到周六  每天9点半触发流程
let confirmationNotice = "0 30 9 * * 1-6"
if (process.env.NODE_ENV === "dev") {
    syncWorkingDayCron = "0 5 10 * * ?"
    syncTodayRunningAndFinishedFlowsCron = "0 10 12 * * ?"
    syncMissingCompletedFlowsCron = "0 0 22 * * ?"
    syncDepartmentCron = "0 10 5 * * ?"
    syncDepartmentWithUserCron = "0 0 7 * * ?"
    syncUserWithDepartmentCron = "0 30 8 * * ?"
    syncFormCron = "0 18 11 * * ?"
    syncUserLoginCron = "40 20 23 * * ?"
    syncResignEmployeeCron = "35 5 17 * * ?"
}

/**
 * 钉钉限制次数调用的接口每天凌晨置0
 */
schedule.scheduleJob("0 0 0 * * ?", async function () {
    if (process.env.NODE_ENV === "prod") {
        await taskService.resetDingDingApiInvokeCount()
    }
})

/**
 * 每天9:05确认当天是否是工作日并将日期入库
 */
schedule.scheduleJob(syncWorkingDayCron, async function () {
    if (process.env.NODE_ENV === "prod") {
        await taskService.syncWorkingDay()
    }
})

/** 0 0/15 * * * ?
 *  每15分钟更新正在进行中的流程和今天完成的流程（包含节点的工作情况）
 */
schedule.scheduleJob(syncTodayRunningAndFinishedFlowsCron, async function () {
    if (process.env.NODE_ENV === "prod") {
        await taskService.syncTodayRunningAndFinishedFlows()
    }
})

/** 0 50 23 * * ?
 * 每天23：50 获取今天完成的流程并入库，状态包含：completed、 terminated、error
 */
schedule.scheduleJob(syncMissingCompletedFlowsCron, async function () {
    if (process.env.NODE_ENV === "prod") {
        await taskService.syncMissingCompletedFlows()
    }
})

/**
 * 更新钉钉token（频率：1h）
 *
 * 注意：访问钉钉的接口都需要使用token，要保证token不能过期，默认2小时
 */
schedule.scheduleJob("0 0 0/1 * * ?", async function () {
    if (process.env.NODE_ENV === "prod") {
        await taskService.syncDingDingToken()
    }
})

/**
 * 从钉钉更新部门信息（按天更新）
 */
schedule.scheduleJob(syncDepartmentCron, async function () {
    if (process.env.NODE_ENV === "prod") {
        await taskService.syncDepartment()
    }
})

/**
 * 获取部门下的员工信息（按天更新）
 *
 * 注意：该数据依赖于Redis中的department数据：要保证更新department的定时任务优先执行完成
 */
schedule.scheduleJob(syncDepartmentWithUserCron, async function () {
    if (process.env.NODE_ENV === "prod") {
        await taskService.syncDepartmentWithUser()
    }
});

/**
 * 获取员工信息（附带所属的部门信息）（按天更新）
 *
 * 注意：该数据依赖于Redis中的department数据：要保证更新department的定时任务优先执行完成
 */
schedule.scheduleJob(syncUserWithDepartmentCron, async function () {
    if (process.env.NODE_ENV === "prod") {
        await taskService.syncUserWithDepartment()
    }
})

/**
 * 更新Form和Form的详细信息（按天更新）
 */
schedule.scheduleJob(syncFormCron, async function () {
    if (process.env.NODE_ENV === "prod") {
        await taskService.syncForm()
    }
})

/**
 * 同步用户的登录信息
 */
schedule.scheduleJob(syncUserLoginCron, async function () {
    if (process.env.NODE_ENV === "prod") {
        await taskService.syncUserLogin()
    }
})

/**
 * 同步离职人员的离职信息
 *
 */
schedule.scheduleJob(syncResignEmployeeCron, async function () {
    if (process.env.NODE_ENV === "prod") {
        await taskService.syncResignEmployeeInfo()
    }
})

/**
 * 同步进行中的流程到数据库
 */
schedule.scheduleJob(syncRunningFlowsCron, async function () {
    if (process.env.NODE_ENV === "prod") {
        await taskService.syncRunningProcess()
    }
})

/*
* 每天处理异常链接是否存在tmallLinkAnomalyDetection*/

schedule.scheduleJob(tmallLinkData, async function () {
    if (process.env.NODE_ENV === "prod") {
        //增加延迟时间，防止数据未及时更新
        //随机延迟 1分钟 2分钟 3分钟
        let random = Math.floor(Math.random() * 3 + 1)
        console.log("天猫延迟时间:", random)
        await dateUtil.delay(1000 * 60 * random)
        await taskService.executeTask("tianmao")
    }
})

schedule.scheduleJob(jdLinkData, async function () {
    try {
        if (process.env.NODE_ENV === "prod") {
            let random = Math.floor(Math.random() * 3 + 1)
            console.log("京东延迟时间:", random)
            await dateUtil.delay(1000 * 60 * random)
            await taskService.executeTask("jingdong");
        }
    } catch (error) {
        console.error("执行任务时出错:", error);
    } finally {

    }
});
//
schedule.scheduleJob(caigouLinkData, async function () {
    if (process.env.NODE_ENV === "prod") {
        await taskService.purchaseSelectionMeetingInitiated()
    }
})
// 转正通知 触发流程
schedule.scheduleJob(confirmationNotice, async function () {
    if (process.env.NODE_ENV === "prod") {
        await taskService.confirmationNotice()
    }
})

