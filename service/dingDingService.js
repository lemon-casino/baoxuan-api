const ExcelJS = require("exceljs")
const yiDaReq = require("../core/yiDaReq")
const dingDingReq = require("../core/dingDingReq")
// 引入封装好的redis
const redisUtil = require("../utils/redisUtil.js");
// 引入流程表单模型
const FlowFormModel = require("../model/flowfrom");
// 引入流程数据模型
const ProcessModel = require("../model/process");
const FlowFormReview = require("../model/flowformreview")
// 引入时间格式化方法
const {logger} = require("../utils/log")
const dateUtil = require("../utils/dateUtil")
const redisRepo = require("../repository/redisRepo")
const userRepo = require("../repository/userRepo")
const {flowStatusConst} = require("../const/flowConst")
const ForbiddenError = require("../error/http/forbiddenError")
const globalGetter = require("../global/getter")
const workingDayService = require("../service/workingDayService")
const flowFormDetailsService = require("../service/flowFormDetailsService")
const departmentService = require("../service/departmentService")
const flowFormService = require("../service/flowFormService")
const formReviewRepo = require("../repository/formReviewRepo")

// ===============公共方法 start=====================
const com_userid = "073105202321093148"; // 涛哥id
const executionFlowFormId = "FORM-K5A66M718P8B40TK8PS1W45BHQK32TWJOGIILU"

const {
    getToken, getDepartments, getAllProcessFlow
} = redisRepo;

// 分页获取表单所有的流程详情
const getFlowsByStatusAndTimeRange = async (timesRange = ["2023-01-01 00:00:00", dateUtil.endOfToday()], timeAction, status, token, userId, formUuid, pageNumber = 1, pageSize = 99) => {
    const fromTimeGMT = timeAction ? timesRange[0] : null;
    const toTimeGMT = timeAction ? timesRange[1] : null;
    // 2.分页去请求所有流程id
    const resLiuChengList = await yiDaReq.getFlowsOfStatusAndTimeRange(fromTimeGMT, toTimeGMT, timeAction, status, token, userId, formUuid, pageSize, pageNumber);

    if (!resLiuChengList) {
        return []
    }
    let allData = resLiuChengList.data;
    // 获取对应的流程的审核记录
    for (let i = 0; i < allData.length; i++) {

        if (allData[i].processInstanceId === "0fd5f3dd-57c2-47bd-845d-6dbf6107f4a3") {
            console.log("------")
        }

        // await dateUtil.delay()
        allData[i]["overallprocessflow"] = await getAllProcessFlow(token, userId, allData[i].processInstanceId);
        console.log(`(page: ${pageNumber})get flowReviewItems process：${i + 1}/${allData.length}`);
    }
    // 如果总数大于当前页数*每页数量，继续请求
    if (resLiuChengList.totalCount > pageNumber * pageSize) {
        const nextPageData = await getFlowsByStatusAndTimeRange(timesRange, timeAction, status, token, userId, formUuid, pageNumber + 1, pageSize);
        allData = allData.concat(nextPageData);
    }
    return allData;
};

// 获取宜搭流程表单数据方法
const getFlowsThroughFormFromYiDa = async (ddAccessToken, userId, status, timesRange, timeAction) => {
    // 1.获取所有宜搭表单数据
    const allForms = await yiDaReq.getAllForms(ddAccessToken, userId);
    const allUsers = await userRepo.getAllUsers({})
    // 循环请求宜搭实例详情和审核详情数据
    let flows = [];
    if (allForms) {
        for (let i = 0; i < allForms.length; i++) {
            const formUuid = allForms[i].formUuid;
            console.log(`loop form process: ${i + 1}:${allForms.length}(${allForms[i].title.zhCN}:${formUuid})`)
            const result = await getFlowsByStatusAndTimeRange(timesRange, timeAction, status, ddAccessToken, userId, formUuid)

            const replaceOperator = (activity, allUsers) => {
                const hasResigned = activity.operatorName.includes("[已离职]")
                if (hasResigned) {
                    // operator：domainList中的用户ID
                    // operatorUserId：父节点中的用户ID
                    const operatorId = activity.operatorUserId || activity.operator
                    const dbUsers = allUsers.filter(user => user.dingdingUserId === operatorId)
                    if (dbUsers.length > 0) {
                        const user = dbUsers[0]
                        // 不存在代理人直接返回
                        if (!user.handoverUserId) {
                            return
                        }

                        // 离职之前做的工作不用动，其他的相关的节点信息改为代理人
                        const undoAfterResign = !activity.operateTimeGMT
                        const doAfterResign = activity.operateTimeGMT &&
                            dateUtil.duration(dateUtil.formatGMT2Str(activity.operateTimeGMT), dateUtil.format2Str(user.lastWorkDay)) > 0
                        if (undoAfterResign || doAfterResign) {
                            activity.operatorName = user.handoverUserName
                            activity.operatorDisplayName = user.handoverUserName
                            // domainList和父节点中的显示的用户字段不一样
                            if (Object.keys(activity).includes("operatorUserId")) {
                                activity.operatorUserId = user.handoverUserId
                            }
                            if (Object.keys(activity).includes("operator")) {
                                activity.operator = user.handoverUserId
                            }
                        }
                    }
                }
            }

            // 对离职的人员，将在离职之后地时间节点的operator更改为代理人
            for (const flow of result) {
                for (const userActivity of flow.overallprocessflow) {
                    if (userActivity.domainList.length > 0) {
                        for (const domain of userActivity.domainList) {
                            replaceOperator(domain, allUsers)
                        }
                    }
                    replaceOperator(userActivity, allUsers)
                }
            }
            flows = flows.concat(result);
        }
    }
    return flows;
};

const getDingDingToken = async () => {
    const ddToken = await yiDaReq.getDingDingAccessToken()
    await redisRepo.setToken(ddToken)
}


const getFlowsFromDingDing = async (status, timesRange, timeAction) => {
    const {access_token} = await getToken();
    const flows = await getFlowsThroughFormFromYiDa(access_token, com_userid, status, timesRange, timeAction);
    return flows || [];
};


const getDepartmentFromDingDing = async () => {
    const {access_token} = await getToken();
    const depList = await yiDaReq.getSubDeptAll(access_token);

    for (const item of depList.result) {
        const dep_chil = await yiDaReq.getSubDeptAll(access_token, item.dept_id);
        item.dep_chil = dep_chil.result;
    }
    return depList
};


const getDepartmentsWithUsersFromDingDing = async () => {
    const {access_token} = await getToken();
    const allDepartments = await getDepartments();
    const loopDept = async (depList) => {
        for (const item of depList) {
            const res = await yiDaReq.getDeptUser_def(access_token, item.dept_id, 0, 100);
            item.dep_user = res.result.list;
            if (item.dep_chil && item.dep_chil.length > 0) {
                await loopDept(item.dep_chil);
            }
        }
    };
    await loopDept(allDepartments);
    return allDepartments
};

const getUsersWithDepartmentFromDingDing = async () => {
    // 获取token
    const {access_token} = await getToken();
    const departmentList = await getDepartments()
    const allUsersFromDepartments = [];
    // 获取部门下的所有用户信息
    for (const item of departmentList) {
        if (item.dep_chil && item.dep_chil.length > 0) {
            for (const subItem of item.dep_chil) {
                const res = await yiDaReq.getDeptUserList(access_token, subItem.dept_id);
                allUsersFromDepartments.push(res.result.userid_list)
            }
        }
        const res = await yiDaReq.getDeptUserList(access_token, item.dept_id);
        allUsersFromDepartments.push(res.result.userid_list);
    }
    // 用户去重
    const uniqueUsers = new Set(allUsersFromDepartments.flat());
    const userDetails = [];
    // 根据用户id获取用户详情
    for (let userId of uniqueUsers) {
        const userDetail = await yiDaReq.getUserInfoByUserIdAndToken(access_token, userId)
        for (let dep of userDetail.result.leader_in_dept) {
            const dep_res = await yiDaReq.getDpInfo(access_token, dep.dept_id);
            dep.dep_detail = dep_res.result;
        }
        userDetails.push(userDetail.result);
    }
    return userDetails
};

const getAllFormsFromDingDing = async () => {
    console.log("开始获取钉钉_流程表单列表=========>");
    // 钉钉token
    const {access_token} = await getToken();
    // 1.获取所有宜搭表单数据
    const yd_form = await yiDaReq.getAllForms(access_token, com_userid);
    //循环插入/更新表单
    yd_form.result.data.forEach(async (item) => {
        await FlowFormModel.upsert({
            flow_form_id: item.formUuid, flow_form_name: item.title.zhCN,
        });
    });
    return yd_form;
};

/**
 * 手动弥补
 * @param startTime
 * @param endTime
 * @returns {Promise<void>}
 */
const handleAsyncAllFinishedFlowsByTimeRange = async (startTime, endTime) => {
    const completedFlows = []
    const statusArr = ["COMPLETED", "TERMINATED", "ERROR"]
    for (let status of statusArr) {
        const currentFlowsOfStatus = await getFlowsFromDingDing(status, [startTime, endTime], "modified")
        completedFlows.push(...currentFlowsOfStatus)
    }
    await ProcessModel.addProcess(completedFlows)
}

/**
 * 获取今天进行中的流程
 * @returns {Promise<*>}
 */
const getTodayRunningFlows = async () => {
    const runningFlows = await getFlowsOfStatusAndTimeRange(flowStatusConst.RUNNING)
    const todayFlows = await globalGetter.getTodayFlows()
    // 需要将流程data中的信息标识出来
    // 进行中的流程需要保存之前录入的紧急信息
    for (let flow of runningFlows) {
        flow.dataKeyDetails = await flowFormDetailsService.getDataKeyDetails(flow)
        flow.emergencyKeys = await flowFormService.getFormEmergencyItems(flow.formUuid)
        if (todayFlows && todayFlows.length > 0) {
            const currentFlow = todayFlows.filter(tmp => tmp.processInstanceId === flow.processInstanceId)
            if (currentFlow.length > 0 && currentFlow[0].emergency) {
                flow.emergency = currentFlow[0].emergency
            }
        }
        flow.overallprocessflow = flow.overallprocessflow || []
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
    for (let flow of todayFinishedFlows) {
        flow.dataKeyDetails = await flowFormDetailsService.getDataKeyDetails(flow)
        flow.overallprocessflow = flow.overallprocessflow || []
    }
    return todayFinishedFlows
}

/**
 * 根据时间范围获取该区间内的已完成的流程
 * @param timeRange
 * @returns {Promise<*[]>}
 */
const getFinishedFlows = async (timeRange) => {
    const statusArr = [{"name": "ERROR", "timeAction": "modified", "timeRange": timeRange}, {
        "name": "COMPLETED",
        "timeAction": "modified",
        "timeRange": timeRange
    }, {"name": "TERMINATED", "timeAction": "modified", "timeRange": timeRange}]
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

    const getLatestFormReview = async (formId) => {
        const flowFormReviews = await formReviewRepo.getFormReviewByFormId(formId)
        if (flowFormReviews.length === 0) {
            logger.warn(`数据库中还没有表单${formId}的表单设计信息`)
            return null
        }
        return flowFormReviews[0]
    }

    const getReviewItemConfig = (id, dbReviewItems) => {
        for (const item of dbReviewItems) {
            if (item.id === id) {
                return item
            }
            if (item.children && item.children.length > 0) {
                const tmpNode = getReviewItemConfig(id, item.children)
                if (tmpNode) {
                    return tmpNode
                }
            }
        }
        return null
    }

    const fillReviewItemCost = async (reviewItem, reviewItems, reviewItemsConfig, formUuid) => {
        const {activityId} = reviewItem
        // 2. 获取其中的节点限时配置信息
        const itemConfig = getReviewItemConfig(activityId, reviewItemsConfig)
        if (!itemConfig) {
            logger.warn(`未在数据库中找到节点${activityId}的限时配置信息`)
            return reviewItem
        }
        if (!itemConfig.time || itemConfig.time === 0) {
            logger.warn(`节点 ${activityId}:${itemConfig.title} 没有配置时限`)
        }
        if (!itemConfig.lastTimingNodes) {
            logger.warn(`节点 ${activityId}的 lastTimingNodes 信息在数据库的配置中未找到`)
            return reviewItem
        }

        // 3. 获取流程节点中的 lastTimingNodes
        const lastTimingNodes = itemConfig.lastTimingNodes
        // 宜搭流程首节点统一都把发起叫做申请，activityId=sid-restartevent
        // 如果node.lastTimingNodes中的节点包含了发起(第一个节点)，把sid-restartevent放进去
        if (lastTimingNodes.includes(reviewItemsConfig[0].id)) {
            lastTimingNodes.push(reviewItemRootId)
        }

        // // 4. 根据lastTimingNodes找到完成时间
        const orderedSatisfiedReviewItems = reviewItems.filter(item => {
            return item.operateTimeGMT && lastTimingNodes.includes(item.activityId)
        }).sort((a, b) => parseInt(b.operateTimeGMT) - parseInt(a.operateTimeGMT))

        if (orderedSatisfiedReviewItems.length === 0) {
            logger.warn(`节点${activityId}的上一完成节点未找到`)
            return reviewItem
        }

        const lastTimingReviewItem = orderedSatisfiedReviewItems[0]
        if (!lastTimingReviewItem.operateTimeGMT) {
            logger.warn(`节点${activityId}的上一完成节点${lastTimingReviewItem.id}未找到完成时间`)
            return reviewItem
        }

        // 5. 计算时间
        const startDateTime = dateUtil.formatGMT2Str(lastTimingReviewItem.operateTimeGMT)
        let computeEndDate = dateUtil.format2Str(new Date())
        if (reviewItem.operateTimeGMT) {
            computeEndDate = dateUtil.formatGMT2Str(reviewItem.operateTimeGMT)
        }

        let costAlready = 0
        // 获取该节点在流程中的完成时间
        // 运营执行流程的用时要特别计算
        if (formUuid === executionFlowFormId) {
            costAlready = await workingDayService.computeValidWorkingDurationOfExecutionFlow(startDateTime, computeEndDate)
        } else {
            costAlready = await workingDayService.computeValidWorkingDuration(startDateTime, computeEndDate)
        }
        reviewItem["cost"] = costAlready
        reviewItem["requiredCost"] = itemConfig.time
        reviewItem["isOverDue"] = itemConfig.time > 0 && costAlready > itemConfig.time
        return reviewItem
    }

    const reviewItemRootId = "sid-restartevent"

    const flows = await getFlowsFromDingDing(status, timeRange, timeAction)

    // 同步流程的操作节点耗时信息
    // 注意📢：如果已经保存到Redis中的流程中的reviewId需要继承，要不流程表单更新后节点id会变动
    const todayFlows = await globalGetter.getTodayFlows()
    for (const flow of flows) {
        const reviewItems = flow.overallprocessflow
        if (!reviewItems || reviewItems.length === 0) {
            logger.warn(`流程：${flow.processInstanceId}没有审核节点信息`)
            continue
        }

        // 获取流程的表单流程的限时配置信息
        //     -- 如果在是新流程不在库中，需要获取最新的表单流程的限时配置信息
        //     -- 如果已经在库中了，需要根据保存的reviewId获取表单流程的限时配置信息
        let reviewItemsConfig = null
        const oldFlow = todayFlows.filter(item => item.processInstanceId === flow.processInstanceId)
        if (oldFlow.length === 0 || !oldFlow[0].reviewId) {
            const latestFormReview = await getLatestFormReview(flow.formUuid)
            if (!latestFormReview) {
                continue
            }
            reviewItemsConfig = latestFormReview.formReview
            flow.reviewId = latestFormReview.id
        } else {
            flow.reviewId = oldFlow[0].reviewId
            const tmpFormReview = await formReviewRepo.getDetailsById(oldFlow[0].reviewId)
            reviewItemsConfig = tmpFormReview.formReview
        }

        if (!reviewItemsConfig) {
            logger.warn("没有在数据库中找到表单设计流程的信息")
            continue
        }

        for (let reviewItem of reviewItems) {
            if (reviewItem.activityId === reviewItemRootId) {
                continue
            }
            const domainList = reviewItem.domainList
            if (domainList && domainList.length > 0) {
                for (let domain of domainList) {
                    domain = await fillReviewItemCost(domain, reviewItems, reviewItemsConfig, flow.formUuid)
                }
            }
            // 当前主节点也要更新时限信息
            reviewItem = await fillReviewItemCost(reviewItem, reviewItems, reviewItemsConfig, flow.formUuid)
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
 *
 * @param pageIndex
 * @param pageSize
 * @param workDateFrom
 * @param workDateTo
 * @param userIds
 * @returns {Promise<*>}
 */
const getAttendances = async (pageIndex, pageSize, workDateFrom, workDateTo, userIds) => {
    const {access_token: accessToken} = await redisRepo.getToken()
    const attendances = await dingDingReq.getAttendances(pageIndex, pageSize, workDateFrom, workDateTo, userIds, accessToken)
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

/**
 *
 * @param formId
 * @param userId
 * @param processCode
 * @param formDataJsonStr
 * @returns {Promise<void>}
 */
const createProcess = async (formId, userId, processCode, formDataJsonStr) => {
    // 获取用户的部门id
    const departments = await departmentService.getDepartmentOfUser(userId)
    const departmentId = departments[departments.length - 1].dept_id
    const {access_token: token} = await getToken();
    return await yiDaReq.createProcess(token, formId, userId, processCode, departmentId, formDataJsonStr)
}

module.exports = {
    getDingDingToken,
    getDepartmentsWithUsersFromDingDing,
    getUsersWithDepartmentFromDingDing,
    getAllFormsFromDingDing,
    getDepartmentFromDingDing,
    getTodayRunningAndFinishedFlows,
    getFinishedFlows,
    handleAsyncAllFinishedFlowsByTimeRange,
    getAttendances,
    isWorkingDay,
    getFlowsOfStatusAndTimeRange,
    createProcess
}