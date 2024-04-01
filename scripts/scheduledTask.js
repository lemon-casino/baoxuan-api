const schedule = require("node-schedule");
const redisUtil = require("../utils/redisUtil")
const {redisKeys} = require("../const/redisConst")
const globalSetter = require("../global/setter")
const processService = require("../service/processService")
const dingDingService = require("../service/dingDingService");

// 合理调用钉钉，防止限流  当前使用版本 接口每秒调用上线为20， 涉及的宜搭接口暂时没有qps和总调用量的限制

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
schedule.scheduleJob("0 59 23 * * *", async function () {
    const pullTimeRange = []
    // 获取拉取钉钉完成流程的起始时间（异常情况下，当天更新失败，可能下次会拉取多天的）
    const latestProcess = await processService.getLatestModifiedProcess();
    if (latestProcess) {
        // 如果日期是昨天，则不用理会
        const {modifiedTimeGMT} = latestProcess
    }

    // 获取指定范围时间范围内的流程

    // 同步到数据库

});


//定时任务
// 每30分钟请求一次getDingdingToken 获取token
schedule.scheduleJob("*/6 * * * *", async function () {
    console.time("获取token=========>");
    await dingDingService.getDingDingToken();
    console.timeEnd("获取token=========>");
});

// 每40分钟请求一次DepartmentInformation  获取所有部门
schedule.scheduleJob("*/40 * * * *", async function () {
    // console.time("获取所有部门=========>");
    await dingDingService.getDepartmentFromDingDing();
    // 将最新的部门数据保存到global中
    const newDepartments = await redisUtil.getKey(redisKeys.Department)
    globalSetter.setGlobalDepartments(JSON.parse(newDepartments || "[]"))
    console.timeEnd("获取所有部门=========>");
});

// 每45分钟请求一次fetchUserList  获取所有部门下的人员
schedule.scheduleJob("*/45 * * * *", async function () {
    console.time("获取所有部门下的人员=========>");
    await dingDingService.getUsersFromDingDing();
    // 将最新的部门下的人员数据保存到global中
    const newUsersOfDepartments = await redisUtil.getKey(redisKeys.UsersWithJoinLaunchDataUnderDepartment)
    globalSetter.setGlobalUsersOfDepartments(JSON.parse(newUsersOfDepartments || "[]"))
    console.timeEnd("获取所有部门下的人员=========>");
});

// 每50分钟请求一次fetchUserDetail 获取所有用户详情数据
schedule.scheduleJob("*/50 * * * *", async function () {
    console.time("获取所有用户详情数据=========>");
    await dingDingService.getUsersDetailFromDingDing();
    // 将最新的人员数据保存到global中
    const newUsers = await redisUtil.getKey(redisKeys.AllUsersDetailWithJoinLaunchData)
    globalSetter.setGlobalUsers(JSON.parse(newUsers || "[]"))
    console.timeEnd("获取所有用户详情数据=========>");
});



// // 每天晚上0点开始执行：getAllCompletedLiu() 获取今天以前所有已完成,已终止，异常,流程数据
// schedule.scheduleJob("0 59 23 * * *", async function () {
//     console.time("获取今天以前所有已完成,已终止，异常,流程数据=========>");
//     await dingDingService.getAllFinishedFlowsBeforeToday();
//     console.timeEnd("获取今天以前所有已完成,已终止，异常,流程数据=========>");
// });
//
// // 每天晚上0点开始执行：getAllNoCompletedLiu_Old() 获
// schedule.scheduleJob("0 59 23 * * *", async function () {
//     console.time("获取今天以前所有运行中的流程数据=========>");
//     await dingDingService.getAllNotFinishedFlowsBeforeToday();
//     console.timeEnd("获取今天以前所有运行中的流程数据=========>");
// });
//
// // 每5分钟执行一次：getAllLiu_New()  获取今天所有的流程数据
// schedule.scheduleJob("*/10 * * * *", async function () {
//     console.time("获取今天所有的流程数据=========>");
//     await dingDingService.getAllFlowsOfToday();
//     console.timeEnd("获取今天所有的流程数据=========>");
// });

// 每5分钟 获取当前正在进行中的流程和今天完成的流程
// schedule.scheduleJob("0 0/5 * * * ?", async function () {
//     const doingFlows = await dingDingService.getDoingFlows();
//     await redisUtil.setKey(redisKeys.AllDoingFlowsOfToday, JSON.stringify(doingFlows))
// })