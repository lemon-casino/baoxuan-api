const dd_data = require("./dd_yd_data");
const schedule = require("node-schedule");

//定时任务
// 每30分钟请求一次getDingdingToken 获取token
schedule.scheduleJob("*/6 * * * *", function () {
  console.time("获取token=========>");
  dd_data.getDingdingToken();
  console.timeEnd("获取token=========>");
});

// 每40分钟请求一次DepartmentInformation  获取所有部门
schedule.scheduleJob("*/40 * * * *", function () {
  console.time("获取所有部门=========>");
  dd_data.DepartmentInformation();
  console.timeEnd("获取所有部门=========>");
});

// 每45分钟请求一次fetchUserList  获取所有部门下的人员
schedule.scheduleJob("*/45 * * * *", function () {
  console.time("获取所有部门下的人员=========>");
  dd_data.fetchUserList();
  console.timeEnd("获取所有部门下的人员=========>");
});

// 每50分钟请求一次fetchUserDetail 获取所有用户详情数据
schedule.scheduleJob("*/50 * * * *", function () {
  console.time("获取所有用户详情数据=========>");
  dd_data.fetchUserDetail();
  console.timeEnd("获取所有用户详情数据=========>");
});

// 每天晚上0点开始执行：getAllCompletedLiu() 获取今天以前所有已完成,已终止，异常,流程数据
schedule.scheduleJob("0 59 23 * * *", function () {
  console.time("获取今天以前所有已完成,已终止，异常,流程数据=========>");
  dd_data.getAllCompletedLiu();
  console.timeEnd("获取今天以前所有已完成,已终止，异常,流程数据=========>");
});

// 每天晚上0点开始执行：getAllNoCompletedLiu_Old() 获
schedule.scheduleJob("0 59 23 * * *", function () {
  console.time("获取今天以前所有运行中的流程数据=========>");
  dd_data.getAllNoCompletedLiu_Old();
  console.timeEnd("获取今天以前所有运行中的流程数据=========>");
});

// 每5分钟执行一次：getAllLiu_New()  获取今天所有的流程数据
schedule.scheduleJob("*/10 * * * *", function () {
  console.time("获取今天所有的流程数据=========>");
  dd_data.getAllLiu_New();
  console.timeEnd("获取今天所有的流程数据=========>");
});
