const schedule = require("node-schedule")
const taskService = require("@/service/taskService")
const dateUtil = require("@/utils/dateUtil");
const redisUtil = require("@/utils/redisUtil");
const {redisKeys} = require("@/const/redisConst");
const orderService = require("../service/jst/orderService")
const purchaseService = require("../service/jst/purchaseService")
const operationService = require("../service/operationService")
const moment = require('moment')

// 合理调用钉钉，防止限流  当前使用版本 接口每秒调用上线为20(貌似不准确)，涉及的宜搭接口暂时没有qps和总调用量的限制
// 注意：避免测试和正式同时请求钉钉接口导致调用失败的情况

let syncWorkingDayCron = "0 5 9 * * ?"
let syncTodayRunningAndFinishedFlowsCron = "0 0/20 7-21 * * ?"
let syncMissingCompletedFlowsCron = "0 30 23 * * ?"

let syncDepartmentCron = "0 20 8 * * ?"
// 如果有新人入职一般也是上午
let syncDepartmentWithUserCron = "0 30 8 * * ?"
let syncUserWithDepartmentCron = "0 0 8 * * ?"

let syncFormCron = "0 30 6 * * ?"
let syncUserLoginCron = "0 0/5 * * * ?"

// 当天下班
let syncResignEmployeeCron = "0 0 18 * * ?"
let syncRunningFlowsCron = "0 0 8 * * ?"
let tmallLinkData = "45 13 * * 1-6"
let jdLinkData  = "00 10 * * 1-6"
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
let jstOrderCron = "0 0 7 * * ?"
let jstPurchaseCron = "0 36 */1 * * ?"
let saleCron = "0 30 9/12 * * ?"
schedule.scheduleJob(saleCron, async function () {
    if (process.env.NODE_ENV === "prod") {
        await operationService.updateInventory()
    }
})
//9点半/12点半刷新_stats里的sale_month
schedule.scheduleJob(saleCron, async function () {
    if (process.env.NODE_ENV === "prod") {
        let date = moment().format("YYYY-MM-DD")
        await operationService.SalesupdateSalemonth(date)
        await operationService.PaysUpdateSaleMonth(date)
        await operationService.VerifiedsupdateSalemonth(date)
    }
})

//拉取聚水潭订单数据
schedule.scheduleJob(jstOrderCron, async function () {
    if (process.env.NODE_ENV === "prod") {
        let start = moment().subtract(1, 'day').format("YYYY-MM-DD")
        let end = moment().format("YYYY-MM-DD")
        await orderService.syncOrder(start, end)
    }
})
//拉取聚水潭采购单数据
schedule.scheduleJob(jstPurchaseCron, async function () {
    if (process.env.NODE_ENV === "prod") {
        await purchaseService.syncPurchase()
    }
})

//检查运营链接优化
schedule.scheduleJob(tmallLinkData, async function () {
    if (process.env.NODE_ENV === "prod") {
        // await operationService.checkOperationOptimize()
    }
})

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
     if (process.env.NODE_ENV !== "prod") return;

    let taskStatus;
    try {
        taskStatus = JSON.parse(await redisUtil.get(redisKeys.synchronizedState));
        if (taskStatus.syncTodayRunning) {
            console.log(`同步任务正在执行跳过本次调用`);
            return;
        }
        taskStatus.syncTodayRunning = true;
        await redisUtil.set(redisKeys.synchronizedState, JSON.stringify(taskStatus));
        await taskService.syncTodayRunningAndFinishedFlows();
        taskStatus.syncTodayRunning = false;
    } catch (error) {
        if (taskStatus) {
            taskStatus.syncTodayRunning = false;
            await redisUtil.set(redisKeys.synchronizedState, JSON.stringify(taskStatus));
        }
        logger.error(`同步任务执行时出错:`, error);
    } finally {
        if (taskStatus) {
            await redisUtil.set(redisKeys.synchronizedState, JSON.stringify(taskStatus));
        }
    }
});


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
        // await taskService.executeTask("tianmao")
    }
})

schedule.scheduleJob(jdLinkData, async function () {
    try {
        if (process.env.NODE_ENV === "prod") {
            await taskService.executeTask("jingdong");
        }
    } catch (error) {
        console.error("执行任务时出错:", error);
    } finally {

    }
});

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
// 每天晚上 12点 重置redis中的synchronizedState 中的 syncTodayRunning 为false 防止同步任务出错 第二天不同步
schedule.scheduleJob("0 0 0 * * ?", async function () {
    if (process.env.NODE_ENV === "prod") {
        let taskStatus = JSON.parse(await redisUtil.get(redisKeys.synchronizedState));
        taskStatus.syncTodayRunning = false;
        taskStatus.isRunningTianMao = false;
        taskStatus.isRunningJD = false;
        await redisUtil.set(redisKeys.synchronizedState, JSON.stringify(taskStatus));
    }
})


