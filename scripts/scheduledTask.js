const schedule = require("node-schedule")
const redisUtil = require("../utils/redisUtil")
const {redisKeys} = require("../const/redisConst")
const globalSetter = require("../global/setter")
const dingDingService = require("../service/dingDingService")
const flowService = require("../service/flowService")
const flowFormService = require("../service/flowFormService")
const workingDayService = require("../service/workingDayService")
const {logger} = require("../utils/log")
const dateUtil = require("../utils/dateUtil")

// 合理调用钉钉，防止限流  当前使用版本 接口每秒调用上线为20， 涉及的宜搭接口暂时没有qps和总调用量的限制

// 每天9:05确认当天是否是工作日并将日期入库
schedule.scheduleJob("0 5 9 * * ?", async function () {
    try {
        const date = dateUtil.format2Str(new Date(), "YYYY-MM-DD")
        const isWorkingDay = await dingDingService.isWorkingDay(date)
        if (isWorkingDay) {
            await workingDayService.saveWorkingDay(date)
        }
    } catch (e) {
        logger.error(`同步今天工作日信息失败：${e.message}`)
        logger.error(e.stack)
    }
})

/**
 *  每15分钟更新正在进行中的流程和今天完成的流程（包含节点的工作情况）
 */
schedule.scheduleJob("0 0/15 * * * ?", async function () {
    const flows = await dingDingService.getTodayRunningAndFinishedFlows()
    await redisUtil.setKey(redisKeys.FlowsOfRunningAndFinishedOfToday, JSON.stringify(flows))
    globalSetter.setGlobalTodayRunningAndFinishedFlows(flows)
})

/**
 * 需要有手动补偿机制
 * 每天晚上0点获取今天完成的流程数据并入库，状态包含：completed、 terminated、error
 */
schedule.scheduleJob("0 59 23 * * ?", async function () {
    logger.error("--- 已完成流程入库 开始 ---")
    await flowService.syncMissingCompletedFlows()
    logger.error("--- 已完成流程入库 结束---")
});

/**
 * 更新Form和Form的详细信息
 */
schedule.scheduleJob("0 59 23 * * *", async function () {
    await flowFormService.syncFormsFromDingDing()
    logger.info(`${new Date()}：流程表单信息更新完成`)
})

//定时任务
// 每30分钟请求一次getDingdingToken 获取token
schedule.scheduleJob("*/6 * * * *", async function () {
    await dingDingService.getDingDingToken();
});

// // 每40分钟请求一次DepartmentInformation 获取所有部门
// schedule.scheduleJob("*/40 * * * *", async function () {
//     await dingDingService.getDepartmentFromDingDing();
//     const newDepartments = await redisUtil.getKey(redisKeys.Department)
//     globalSetter.setGlobalDepartments(JSON.parse(newDepartments || "[]"))
// });
//
// // 每45分钟请求一次fetchUserList  获取所有部门下的人员
// schedule.scheduleJob("*/45 * * * *", async function () {
//     await dingDingService.getUsersFromDingDing();
//     const newUsersOfDepartments = await redisUtil.getKey(redisKeys.UsersWithJoinLaunchDataUnderDepartment)
//     globalSetter.setGlobalUsersOfDepartments(JSON.parse(newUsersOfDepartments || "[]"))
// });
//
// // 每50分钟请求一次fetchUserDetail 获取所有用户详情数据
// schedule.scheduleJob("*/50 * * * *", async function () {
//     console.time("获取所有用户详情数据=========>");
//     await dingDingService.getUsersDetailFromDingDing();
//     // 将最新的人员数据保存到global中
//     const newUsers = await redisUtil.getKey(redisKeys.AllUsersDetailWithJoinLaunchData)
//     globalSetter.setGlobalUsers(JSON.parse(newUsers || "[]"))
//     console.timeEnd("获取所有用户详情数据=========>");
// });