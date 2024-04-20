const ExcelJS = require("exceljs");
const dingDingReq = require("../core/dingDingReq");
// 引入封装好的redis
const redisUtil = require("../utils/redisUtil.js");
// 引入流程表单模型
const FlowFormModel = require("../model/flowfrom");
// 引入流程数据模型
const ProcessModel = require("../model/process");
const FlowFormReview = require("../model/flowformreview")
// 引入时间格式化方法
const {formatDateTime} = require("../utils/tools");
const reviewUtil = require("../utils/reviewUtil")
const dateUtil = require("../utils/dateUtil")
const redisService = require("./redisService")
const {redisKeys} = require("../const/redisConst")
const {logger} = require("../utils/log")
const ForbiddenError = require("../error/http/forbiddenError")
const globalGetter = require("../global/getter")
const workingDayService = require("../service/workingDayService")
const flowFormDetailsService = require("../service/flowFormDetailsService")
const flowFormService = require("../service/flowFormService")

// ===============公共方法 start=====================
const com_userid = "073105202321093148"; // 涛哥id
const executionFlowFormId = "FORM-K5A66M718P8B40TK8PS1W45BHQK32TWJOGIILU"

const {
    getToken,
    getDepartments,
    getAllProcessFlow
} = redisService;

// 分页获取表单所有的流程详情
const getFlowsByStatusAndTimeRange = async (
    timesRange = ["2023-01-01 00:00:00", dateUtil.endOfToday()],
    timeAction,
    status,
    token,
    userId,
    formUuid,
    pageNumber = 1,
    pageSize = 99
) => {
    const fromTimeGMT = timeAction ? timesRange[0] : null;
    const toTimeGMT = timeAction ? timesRange[1] : null;
    // 2.分页去请求所有流程id
    const resLiuChengList = await dingDingReq.getFlowsOfStatusAndTimeRange(
        fromTimeGMT,
        toTimeGMT,
        timeAction,
        status,
        token,
        userId,
        formUuid,
        pageSize,
        pageNumber
    );
    if (!resLiuChengList) {
        return []
    }
    let allData = resLiuChengList.data;
    // 获取对应的流程的审核记录
    for (let i = 0; i < allData.length; i++) {
        allData[i]["overallprocessflow"] = await getAllProcessFlow(
            token,
            userId,
            allData[i].processInstanceId
        );
        console.log(`(page: ${pageNumber})get flowReviewItems process：${i + 1}/${allData.length}`);
    }
    // 如果总数大于当前页数*每页数量，继续请求
    if (resLiuChengList.totalCount > pageNumber * pageSize) {
        const nextPageData = await getFlowsByStatusAndTimeRange(
            timesRange,
            timeAction,
            status,
            token,
            userId,
            formUuid,
            pageNumber + 1,
            pageSize
        );
        allData = allData.concat(nextPageData);
    }
    return allData;
};

// 获取宜搭流程表单数据方法
const getFlowsThroughFormFromYiDa = async (ddAccessToken, userId, status, timesRange, timeAction) => {
    // 1.获取所有宜搭表单数据
    const allForms = await dingDingReq.getAllForms(ddAccessToken, userId);
    // const allForms = await flowFormService.getAllForms()
    // 循环请求宜搭实例详情和审核详情数据
    let flows = [];
    if (allForms) {
        for (let i = 0; i < allForms.length; i++) {
            const formUuid = allForms[i].formUuid;
            console.log(`loop form process: ${i + 1}:${allForms.length}(${allForms[i].title.zhCN}:${formUuid})`)
            const allData = await getFlowsByStatusAndTimeRange(
                timesRange,
                timeAction,
                status,
                ddAccessToken,
                userId,
                formUuid
            )
            flows = flows.concat(allData);
        }
    }
    return flows;
};


const getFinishedFlowsByTimeRangeAndFormId = async (timeRange, formUuid) => {
    const {access_token} = await getToken();
    let completedFlows = [];
    const statusArr = ["COMPLETED", "TERMINATED", "ERROR"];
    for (let status of statusArr) {
        const flows = await getFlowsByStatusAndTimeRange(
            timeRange,
            "modified",
            status,
            access_token,
            com_userid,
            formUuid
        );
        completedFlows = completedFlows.concat(flows)
    }

    console.log('hi')

    // await ProcessModel.addProcess(completedFlows);
    // await redisUtil.setKey(
    //     redisKeys.AllFinishedFlowsBeforeToday,
    //     JSON.stringify(await ProcessModel.getProcessList())
    // );
}

// 获取今天的开始和结束时间
const getTodayStartAndEnd = () => {
    const start = formatDateTime(new Date(), "YYYY-mm-dd 00:00:00");
    const end = formatDateTime(new Date(), "YYYY-mm-dd 23:59:00");
    return {start, end};
};

// 获取昨天的开始和结束时间
const getzuotStartAndEnd = () => {
    const date = new Date();
    // 减去一天
    date.setDate(date.getDate() - 1);
    const year = date.getFullYear();
    // getMonth() 方法返回的月份是从0开始的，所以要加1
    const month = date.getMonth() + 1;
    const day = date.getDate();
    // 使用模板字符串来格式化日期，确保月份和日期为两位数
    const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")}`;
    const start = formattedDate + " 00:00:00";
    const end = formattedDate + " 23:59:00";
    return {start, end};
};

// ===============公共方法 end=====================

// 1.获取钉钉_token
const getDingDingToken = async () => {
    const ddToken = await dingDingReq.getDingDingCorpToken();
    await redisService.setToken(ddToken)
};
// 2.获取钉钉_指定状态和筛选时间的所有流程数据
const getFlowsFromDingDing = async (status, timesRange, timeAction) => {
    const {access_token} = await getToken();
    const flows = await getFlowsThroughFormFromYiDa(
        access_token,
        com_userid,
        status,
        timesRange,
        timeAction
    );
    return flows || [];
};

// 3.定时更新部门层级详情信息
const getDepartmentFromDingDing = async () => {
    const {access_token} = await getToken();
    const depList = await dingDingReq.getSubDeptAll(access_token);

    for (const item of depList.result) {
        const dep_chil = await dingDingReq.getSubDeptAll(access_token, item.dept_id);
        item.dep_chil = dep_chil.result;
    }
    return depList
};

// 4.获取钉钉_部门下的所有用户
const getDepartmentsWithUsersFromDingDing = async () => {
    const {access_token} = await getToken();
    const allDepartments = await getDepartments();
    const loopDept = async (depList) => {
        for (const item of depList) {
            // item.dep_user = [];
            const res = await dingDingReq.getDeptUser_def(access_token, item.dept_id, 0, 100);
            // for (let userid of res.result.list) {
            //     const info = (await getAllUsersDetail()).filter(
            //         (item) => item.userid === userid.userid
            //     );
            //     if (info.length > 0) {
            //         userid.canyu_liu = info[0].canyu_liu;
            //         userid.faqi_liu = info[0].faqi_liu;
            //     }
            // }
            item.dep_user = res.result.list;
            if (item.dep_chil && item.dep_chil.length > 0) {
                await loopDept(item.dep_chil);
            }
        }
    };
    await loopDept(allDepartments);
    return allDepartments
};

// 5.获取钉钉_所有用户详情
const getUsersWithDepartmentFromDingDing = async () => {
    // 获取token
    const {access_token} = await getToken();
    // const [allFlowsUntilNow, departmentList] = await Promise.all([
    //     getAllFlowsUntilNow(),
    //     getDepartments(),
    // ]);

    const departmentList = await getDepartments()
    const allUsersFromDepartments = [];
    // 获取部门下的所有用户信息
    for (const item of departmentList) {
        const res = await dingDingReq.getDeptUserList(access_token, item.dept_id);
        allUsersFromDepartments.push(res.result.userid_list);
    }
    // 用户去重
    const uniqueUsers = new Set(allUsersFromDepartments.flat());
    const userDetails = [];
    // 根据用户id获取用户详情
    for (let userId of uniqueUsers) {
        const userDetail = await dingDingReq.getUserInfoByUserIdAndToken(access_token, userId);
        // const depDetails = [];
        for (let dep of userDetail.result.leader_in_dept) {
            const dep_res = await dingDingReq.getDpInfo(access_token, dep.dept_id);
            dep.dep_detail = dep_res.result;
        }
        userDetails.push(userDetail.result);
    }
    return userDetails
};

// 6.获取钉钉_流程表单列表
const getAllFormsFromDingDing = async () => {
    console.log("开始获取钉钉_流程表单列表=========>");
    // 钉钉token
    const {access_token} = await getToken();
    // 1.获取所有宜搭表单数据
    const yd_form = await dingDingReq.getAllForms(access_token, com_userid);
    //循环插入/更新表单
    yd_form.result.data.forEach(async (item) => {
        await FlowFormModel.upsert({
            flow_form_id: item.formUuid,
            flow_form_name: item.title.zhCN,
        });
    });
    return yd_form;
};
// 7. 获取今天以前所有已完成,已终止，异常,流程数据  -----------每天晚上23：59开始执行
const getAllFinishedFlowsBeforeToday = async () => {
    // 开始时间：昨天00:00:00
    // 结束时间：昨天23:59:00
    const {start: startTime, end: endTime} = getTodayStartAndEnd();

    const completedFlows = [];
    const statusArr = ["COMPLETED", "TERMINATED", "ERROR"];
    for (let status of statusArr) {
        const currentFlowsOfStatus = await getFlowsFromDingDing(status, [startTime, endTime], "create");
        completedFlows.push(...currentFlowsOfStatus);
    }
    console.log(startTime, endTime + "新增流程数据=========>", completedFlows.length);
    await ProcessModel.addProcess(completedFlows);
    await redisUtil.setKey(
        redisKeys.AllFinishedFlowsBeforeToday,
        JSON.stringify(await ProcessModel.getProcessList())
    );
};

/**
 * 手动弥补
 * @param startTime
 * @param endTime
 * @returns {Promise<void>}
 */
const handleAsyncAllFinishedFlowsByTimeRange = async (startTime, endTime) => {
    const completedFlows = [];
    const statusArr = ["COMPLETED", "TERMINATED", "ERROR"];
    for (let status of statusArr) {
        const currentFlowsOfStatus = await getFlowsFromDingDing(status, [startTime, endTime], "modified");
        completedFlows.push(...currentFlowsOfStatus);
    }
    console.log(startTime, endTime + "新增流程数据=========>", completedFlows.length);
    await ProcessModel.addProcess(completedFlows);
    await redisUtil.setKey(
        redisKeys.AllFinishedFlowsBeforeToday,
        JSON.stringify(await ProcessModel.getProcessList())
    );
};

// 8. 获取今天以前所有运行中的流程数据            -----------每天晚上23：59开始执行
const getAllNotFinishedFlowsBeforeToday = async (starttime) => {
    const {start, end} = getTodayStartAndEnd();
    let startTime = "2001-01-01 00:00:00";
    let endTime = end;
    const list = [];
    const type = ["RUNNING"];
    for (let i of type) {
        const liuchengdata = await getFlowsFromDingDing(i, [startTime, endTime], "create");
        list.push(...liuchengdata);
    }

    await redisUtil.setKey(redisKeys.AllNotFinishedFlowsBeforeToday, JSON.stringify(list));
};
// 9.获取今天所有的流程数据
const getAllFlowsOfToday = async () => {
    const {start: startTime, end: endTime} = getTodayStartAndEnd();
    const allFlowsOfToday = [];
    const statusArr = ["RUNNING", "TERMINATED", "COMPLETED", "ERROR"];
    for (let status of statusArr) {
        const flows = await getFlowsFromDingDing(status, [startTime, endTime], "create");
        // 为flow的overallProcessFlow附加信息：{cost: "耗时", limitedTime:"限定时长", isOverDue: "是否逾期"}
        // 对运行中的流程，为审核节点添加耗时信息
        // 结构不符合直接返回
        const newFlows = await computeFlowsCost(flows);
        allFlowsOfToday.push(newFlows);
    }
    // 存入redis
    await redisUtil.setKey(redisKeys.AllFlowsOfToday, JSON.stringify(allFlowsOfToday));
    await combineAllFlows();
};

// 9. 组装昨天入库数据和 当天,历史缓存数据
const combineAllFlows = async () => {
    const allFinishedFlowsBeforeToday = JSON.parse(await redisUtil.getKey(redisKeys.AllFinishedFlowsBeforeToday));
    const allNotFinishedFlowsBeforeToday = JSON.parse(
        await redisUtil.getKey(redisKeys.AllNotFinishedFlowsBeforeToday)
    );
    const allFlowsOfToday = JSON.parse(
        await redisUtil.getKey(redisKeys.AllFlowsOfToday)
    );
    const allFlowUntilNow = [...allFinishedFlowsBeforeToday, ...allNotFinishedFlowsBeforeToday, ...allFlowsOfToday];
    await redisUtil.setKey(redisKeys.AllFlowsUntilNow, JSON.stringify(allFlowUntilNow));
};

// 10. 获取流程评论数据
const getremarksAll = async () => {
    // 获取所有流程数据
    const allFlowsUntilNow = JSON.parse(await redisUtil.getKey(redisKeys.AllFlowsUntilNow));
    const {access_token} = await getToken();
    let processInstanceIds = [];
    // 需要导出的表单数组id
    const arrayFromId = ["FORM-0A966I819O8BZMVBE16JLAK96KK42KD1QEIILC"];
    // 已完成,已终止状态
    const instanceStatuss = ["TERMINATED", "COMPLETED"];
    for (let f_item of arrayFromId) {
        const resdata = allFlowsUntilNow.filter((item) => item.formUuid === f_item);
        for (let item of resdata) {
            if (instanceStatuss.includes(item.instanceStatus)) {
                let date = new Date(item.createTimeGMT);
                let month = date.getUTCMonth() + 1;
                if (month === 11 || month === 12 || month === 1) {
                    let s_jindu = [];
                    for (let s_item of item.overallprocessflow) {
                        const jt = s_item.action === "拒绝" ? `---------(${s_item.remark})` : "";
                        s_jindu.push(`${s_item.operatorName}(${s_item.showName || s_item.action})${jt}`);
                    }
                    console.log('s_jindu ================>', s_jindu);
                    item.s_jindu = s_jindu;
                    // 获取流程评论
                    const rees = await dingDingReq.getremarksAll(
                        access_token,
                        f_item,
                        com_userid,
                        [item.processInstanceId]
                    );
                    item.pinlun = rees.formRemarkVoMap[item.processInstanceId] || [];
                    let parts = item.title.split("采购任务运营发布");
                    item.c_title = parts[1];
                    processInstanceIds.push(item);
                }
            }
        }
    }
    // console.log('processInstanceIds ================>', processInstanceIds);
    // 导出excel
    let workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet("My Sheet");

    // 设定表头
    worksheet.columns = [
        {header: "名称", key: "title"},
        {header: "创建时间", key: "createTimeGMT"},
        {header: "产品名称", key: "c_title"},
        {header: "审批结果", key: "approvedResult"},
        {header: "评论", key: "pinlun"},
        // { header: "审核评论", key: "s_pinlun" },
        {header: "审核进度信息", key: "s_jindu"},
    ];
    // 插入数据
    processInstanceIds.forEach((item) => {
        console.log('item.s_jindu ================>', item.s_jindu);
        worksheet.addRow({
            title: item.title,
            createTimeGMT: item.createTimeGMT,
            c_title: item.c_title,
            approvedResult: item.approvedResult === "disagree" ? "拒绝" : "同意",
            s_jindu: JSON.stringify(item.s_jindu),
            pinlun: item.pinlun.map((i) => i.content).join("; "), // 假设每个评论对象有 'content' 属性, 并且我们将所有评论合并到一个字符串中
        });
    });

    // 导出为 Excel 文件
    workbook.xlsx.writeFile("采购任务运营发布.xlsx");
};

const computeFlowsCost = async (flows) => {
    // 为flow的overallProcessFlow附加信息：{cost: "耗时", limitedTime:"限定时长", isOverDue: "是否逾期"}
    // 对运行中的流程，为审核节点添加耗时信息
    // 结构不符合直接返回
    let newFlows = []
    for (const flow of flows) {
        // 获取流程对应的审核模板配置信息
        let newFlow = flow;
        // 获取指定form的最新的审核要求
        const reviewRequirements = await FlowFormReview.getFlowFormReviewList(flow.formUuid)
        if (reviewRequirements && reviewRequirements.form_review) {
            newFlow = await reviewUtil.addCostToReviewOfFlow(flow, reviewRequirements.form_review)
        } else {
            console.warn(`form：${flow.formUuid} 当前库中没有可用的审核模板`)
        }
        newFlows.push(newFlow)
    }
    return newFlows
}

/**
 * 获取今天进行中的流程
 * @returns {Promise<*>}
 */
const getTodayRunningFlows = async () => {
    const statusObj = {"name": "RUNNING"}
    const runningFlows = await getFlowsOfStatusAndTimeRange(statusObj.name)
    const todayFlows = await globalGetter.getTodayFlows()
    // 需要将流程data中的信息标识出来
    // 进行中的流程需要保存之前录入的紧急信息
    for (const flow of runningFlows) {
        flow.dataKeyDetails = await flowFormDetailsService.getDataKeyDetails(flow)
        flow.emergencyKeys =  await flowFormService.getFormEmergencyItems(flow.formUuid)
        const currentFlow = todayFlows.filter(tmp => tmp.processInstanceId === flow.processInstanceId)
        if (currentFlow.length > 0 && currentFlow[0].emergency) {
            flow.emergency = currentFlow[0].emergency
        }
    }

    return runningFlows
}

/**
 * 获取今天完成的流程
 * @returns {Promise<*>}
 */
const getTodayFinishedFlows = async () => {
    const timeRangeOfToday = [dateUtil.startOfToday(), dateUtil.endOfToday()]
    const todayFinishedFlows = await getFinishedFlows(timeRangeOfToday)
    for (const flow of todayFinishedFlows) {
        flow.dataKeyDetails = flowFormDetailsService.getDataKeyDetails(flow)
    }
    return todayFinishedFlows
}

/**
 * 根据时间范围获取该区间内的已完成的流程
 * @param timeRange
 * @returns {Promise<*[]>}
 */
const getFinishedFlows = async (timeRange) => {
    const statusArr = [
        {"name": "ERROR", "timeAction": "modified", "timeRange": timeRange},
        {"name": "COMPLETED", "timeAction": "modified", "timeRange": timeRange},
        {"name": "TERMINATED", "timeAction": "modified", "timeRange": timeRange}
    ]
    let flows = [];
    for (const statusObj of statusArr) {
        const tmpFlows = await getFlowsOfStatusAndTimeRange(statusObj.name, statusObj.timeRange, statusObj.timeAction)
        flows = flows.concat(tmpFlows);
    }
    // 对flows按照modifiedTimeGMT进行升序
    flows = flows.sort((curr, next) => dateUtil.formatGMT(curr.modifiedTimeGMT) - dateUtil.formatGMT(next.modifiedTimeGMT))
    return flows
}

/**
 * 根据状态和不同的时间(创建、修改)范围查询流程
 * @param statusObj
 * @returns {Promise<*>}
 */
const getFlowsOfStatusAndTimeRange = async (status, timeRange, timeAction) => {
    const flows = await getFlowsFromDingDing(status, timeRange, timeAction);
    // 同步流程的操作节点耗时信息
    for (const flow of flows) {
        const reviewItems = flow.overallprocessflow
        if (reviewItems) {
            for (let i = 0; i < reviewItems.length; i++) {
                if (i == 0) {
                    continue
                }
                const {operateTimeGMT, activeTimeGMT} = reviewItems[i]
                if (operateTimeGMT || activeTimeGMT) {
                    let computeEndDate = dateUtil.format2Str(new Date())
                    if (operateTimeGMT) {
                        computeEndDate = dateUtil.formatGMT2Str(operateTimeGMT)
                    }

                    let costAlready = 0
                    // todo: 对于多分支的情况开始时间不准确
                    const startDateTime = dateUtil.formatGMT2Str(reviewItems[i - 1].operateTimeGMT || reviewItems[i - 1].activeTimeGMT)
                    // 运营执行流程的用时要特别计算
                    if (flow.formUuid === executionFlowFormId) {
                        costAlready = await workingDayService.computeValidWorkingDurationOfExecutionFlow(startDateTime, computeEndDate)
                    } else {
                        costAlready = await workingDayService.computeValidWorkingDuration(startDateTime, computeEndDate)
                    }
                    const reviewRequirements = await FlowFormReview.getFlowFormReviewList(flow.formUuid)
                    if (reviewRequirements && reviewRequirements.form_review) {
                        flow.reviewId = reviewRequirements.id
                        const requiredCost = reviewUtil.extractTimeRequirement(reviewRequirements.form_review, reviewItems[i].activityId)
                        reviewItems[i]["cost"] = costAlready
                        reviewItems[i]["requiredCost"] = requiredCost === reviewUtil.unlimitedTime ? "无要求" : requiredCost
                        reviewItems[i]["isOverDue"] = requiredCost > 0 && costAlready >= requiredCost
                        reviewItems[i].reviewId = reviewRequirements.id
                    }
                }
            }
        }
        flow["overallprocessflow"] = reviewItems
    }
    return flows
}

/**
 * 获取今天进行中和今天完成的流程
 * @returns {Promise<T[]>}
 */
const getTodayRunningAndFinishedFlows = async () => {
    const todayRunningFlows = await getTodayRunningFlows();
    let flows = todayRunningFlows
    const todayFinishedFlows = await getTodayFinishedFlows();
    flows = flows.concat(todayFinishedFlows)
    return flows;
}

/**
 * 获取打卡记录
 * @param pageIndex
 * @param pageSize
 * @param workDateFrom
 * @param workDateTo
 * @param userIds
 * @returns {Promise<*>}
 */
const getAttendances = async (pageIndex, pageSize, workDateFrom, workDateTo, userIds) => {
    const attendances = await dingDingReq.getAttendances(pageIndex, pageSize, workDateFrom, workDateTo, userIds)
    return attendances
}

/**
 * 通过钉钉打卡记录判断今天是否是工作日
 * @param date
 * @returns {Promise<boolean>}
 */
const isWorkingDay = async (date) => {
    // 如果date是今天，需要9点后调用
    if (date === dateUtil.format2Str(new Date(), "YYYY-MM-DD")) {
        const hours = new Date().getHours()
        if (hours < 9) {
            throw new ForbiddenError("为保证对今天是否为工作日判断的准确性，9点前不允许调用")
        }
    }

    const startDateTime = dateUtil.startOfDay(date)
    const endDateTime = dateUtil.endOfToday(date)
    // 设置50个小伙伴的userId（钉钉接口限制）
    const users = await globalGetter.getUsers()
    const limit = 40
    const userIds = []
    for (let i = 0; i < users.length - 1; i++) {
        if (i < limit - 1) {
            userIds.push(users[i].userid)
        }
    }

    // 按天统计，没人最多会有4条记录, 测试钉钉接口 pageSize最大为50， 否则会保存
    const result = await getAttendances(0, 50, startDateTime, endDateTime, userIds)
    const uniqueAttendances = {}
    for (const attendance of result.recordresult) {
        uniqueAttendances[attendance.userId] = 1
    }
    // 正常上班9点后打卡的人数会超过10（取50记录每人4条几率可以包含最多的打卡人数），不上班可能也会有人打卡，很少
    return Object.keys(uniqueAttendances).length > 10
}

module.exports = {
    getDingDingToken,
    getDepartmentsWithUsersFromDingDing,
    getUsersWithDepartmentFromDingDing,
    getAllFormsFromDingDing,
    getDepartmentFromDingDing,
    getAllFinishedFlowsBeforeToday,
    getAllNotFinishedFlowsBeforeToday,
    getAllFlowsOfToday,
    combineAllFlows,
    getTodayRunningAndFinishedFlows,
    getFinishedFlows,
    handleAsyncAllFinishedFlowsByTimeRange,
    getFinishedFlowsByTimeRangeAndFormId,
    getAttendances,
    isWorkingDay
};