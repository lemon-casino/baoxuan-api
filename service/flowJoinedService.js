const flowService = require("./flowService")
const redisService = require("./redisService")
const dateUtil = require("../utils/dateUtil")
const reviewUtil = require("../utils/reviewUtil")
const statisticStatusConst = require("../const/statisticStatusConst")
const FlowFormReview = require("../model/flowformreview")
const departmentService = require("../service/departmentService")

/**
 * 本人参与： 已逾期的流程数量（流程可重复）
 * @param userId
 * @param importance 重要性条件null | {isImportant: true, forms: [], items: []}
 * @returns {Promise<{}>}
 */
const getTodaySelfJoinedFlowsStatisticCountOfOverDue = async (userId, importance) => {
    const satisfiedFlowsObj = await getTodaySelfJoinedFlowsStatisticOfOverDue(userId, importance)
    let allSum = 0;
    for (const key of Object.keys(satisfiedFlowsObj)) {
        const flowsDividedByDepartment = await flowService.flowsDividedByDepartment(satisfiedFlowsObj[key])
        const sumFlowsByDepartment = await flowService.sumFlowsByDepartment(flowsDividedByDepartment)
        if (sumFlowsByDepartment.departments) {
            const convertedData = await flowService.convertJonsToArr(sumFlowsByDepartment.departments)
            sumFlowsByDepartment.departments = convertedData
        }
        satisfiedFlowsObj[key] = sumFlowsByDepartment
        allSum = allSum + (sumFlowsByDepartment["sum"] || 0)
    }
    satisfiedFlowsObj["sum"] = allSum
    return satisfiedFlowsObj
}

/**
 * 本人参与：已逾期的流程详情（流程可重复）
 * @param userId
 * @param importance 重要性条件null | {isImportant: true, forms: [], items: []}
 * @returns {Promise<{doing: *[], done: *[]}>}
 */
const getTodaySelfJoinedFlowsStatisticOfOverDue = async (userId, importance) => {
    let flowsOfRunningAndFinishedOfToday = global.todayRunningAndFinishedFlows
    if (!flowsOfRunningAndFinishedOfToday || flowsOfRunningAndFinishedOfToday.length === 0) {
        flowsOfRunningAndFinishedOfToday = await redisService.getFlowsOfRunningAndFinishedOfToday();
    }

    // 根据重要性和forms过滤流程
    const filteredFlows = await flowService.filterFlowsByImportance(flowsOfRunningAndFinishedOfToday, importance)

    const satisfiedFlows = {"done": [], "doing": []};
    let needFilterReviewItems = null
    if (importance) {
        needFilterReviewItems = importance.items
    }
    for (const flow of filteredFlows) {
        const reviewItems = flow.overallprocessflow
        if (!reviewItems) {
            continue;
        }
        for (let i = 0; i < reviewItems.length; i++) {
            // 如果需要过滤指定的items，那么不符合直接跳过
            if (needFilterReviewItems && needFilterReviewItems.length > 0) {
                if (!needFilterReviewItems.includes(reviewItems[i].activityId)) {
                    continue
                }
            }

            // 非本人直接跳过
            if (reviewItems[i].operatorUserId !== userId) {
                continue
            }

            // 已完成的工作逾期
            if (reviewItems[i].isOverDue) {
                if (reviewItems[i].type === statisticStatusConst.reviewType.history) {
                    satisfiedFlows.done.push(flow)
                    break;
                } else {
                    satisfiedFlows.doing.push(flow)
                    break;
                }
            }

            // 正在做还未完成的工作已逾期
            // if (reviewItems[i].type === statisticStatusConst.reviewType.todo && i > 0) {
            //     // 计算现在工作时长是否超时
            //     const costAlready = dateUtil.diff(new Date(), dateUtil.formatGMT(reviewItems[i - 1].operateTimeGMT))
            //     const reviewRequirements = await FlowFormReview.getFlowFormReviewList(flow.formUuid)
            //     const requiredCost = reviewUtil.extractTimeRequirement(reviewRequirements.form_review, reviewItems[i].activityId)
            //
            //     if (requiredCost > 0 && costAlready >= requiredCost) {
            //         satisfiedFlows.doing.push(flow)
            //         continue
            //     }
            // }
        }
    }
    return satisfiedFlows;
}

/**
 * 本人参与：TODO、FORCAST、HISTORY 的流程数量（流程可重复）
 * @param userId
 * @param reviewType 审核的节点类型
 * @param importance 重要性条件null | {isImportant: true, forms: [], items: []}
 * @returns {Promise<{sum: number, departments: {}}>}
 */
const getTodaySelfJoinedFlowsStatisticCountOfReviewType = async (userId, reviewType, importance) => {
    const satisfiedFlows = await getTodaySelfJoinedFlowsStatisticOfReviewType(userId, reviewType, importance)
    const flowsOfDepartment = await flowService.flowsDividedByDepartment(satisfiedFlows)
    const result = await flowService.sumFlowsByDepartment(flowsOfDepartment)
    if (result.departments) {
        const convertedData = await flowService.convertJonsToArr(result.departments)
        result.departments = convertedData
    }
    return result
}

/**
 * 本人参与的：TODO、FORCAST、HISTORY 的流程详情（流程可重复）
 * @param userId
 * @param reviewType 审核的节点类型
 * @param importance 重要性条件null | {isImportant: true, forms: [], items: []}
 * @returns {Promise<*[]>}
 */
const getTodaySelfJoinedFlowsStatisticOfReviewType = async (userId, reviewType, importance) => {
    let flowsOfRunningAndFinishedOfToday = global.todayRunningAndFinishedFlows
    if (!flowsOfRunningAndFinishedOfToday || flowsOfRunningAndFinishedOfToday.length === 0) {
        flowsOfRunningAndFinishedOfToday = await redisService.getFlowsOfRunningAndFinishedOfToday();
    }
    // 根据重要性和forms过滤流程
    const filteredFlows = await flowService.filterFlowsByImportance(flowsOfRunningAndFinishedOfToday, importance)
    let satisfiedFlows = [];
    let needFilterReviewItems = null
    if (importance) {
        needFilterReviewItems = importance.items
    }

    for (const flow of filteredFlows) {
        // 将该流程统计到审核节点的各个操作人
        const reviewItems = flow.overallprocessflow
        if (!reviewItems) {
            continue
        }
        let hasDoneReviewItemOfUser = false;
        for (let i = 0; i < reviewItems.length; i++) {
            const reviewItem = reviewItems[i]
            // 如果需要过滤指定的items，那么不符合直接跳过
            if (needFilterReviewItems && needFilterReviewItems.length > 0) {
                if (!needFilterReviewItems.includes(reviewItem.activityId)) {
                    continue
                }
            }

            // todo: 暂时加在这里，需要独立出去
            // 对于已完成的流程，需要整个流程中涉及本人的工作都已完成
            if (reviewType === statisticStatusConst.reviewType.history) {
                if (reviewItem.operatorUserId === userId) {
                    if (reviewItem.type === statisticStatusConst.reviewType.todo ||
                        reviewItem.type === statisticStatusConst.reviewType.forecast) {
                        break;
                    } else {
                        hasDoneReviewItemOfUser = true
                    }
                }
                if (hasDoneReviewItemOfUser && i === reviewItems.length - 1) {
                    satisfiedFlows.push(flow)
                }
            } else {
                // todo 和 forcast 存在一个即为有效，不用遍历全部
                //  非本人且类型不匹配的直接跳过
                if (reviewItem.operatorUserId !== userId || reviewItem.type !== reviewType) {
                    continue
                }
                satisfiedFlows.push(flow)
                break;
            }

            // //  非本人且类型不匹配的直接跳过
            // if (reviewItem.operatorUserId !== userId || reviewItem.type !== reviewType) {
            //     continue
            // }
            // satisfiedFlows.push(flow)
            // break;
        }
    }
    return satisfiedFlows
}


/**
 * 本人参与的 error terminated 的流程数量（流程可重复）
 * @param status 流程状态
 * @param userId
 * @param importance 重要性条件null | {isImportant: true, forms: [], items: []}
 * @returns {Promise<{sum: number, departments: {}}>}
 */
const getTodaySelfJoinedFlowsStatisticCountOfFlowStatus = async (userId, status, importance) => {
    const satisfiedFlows = await getTodaySelfJoinedFlowsStatisticOfFlowStatus(userId, status, importance)
    const flowsOfDepartment = await flowService.flowsDividedByDepartment(satisfiedFlows)
    const result = await flowService.sumFlowsByDepartment(flowsOfDepartment)
    if (result.departments) {
        const convertedData = await flowService.convertJonsToArr(result.departments)
        result.departments = convertedData
    }
    return result
}

/**
 * 本人参与： error terminated 的流程详情（流程可重复）
 * @param status 流程状态
 * @param userId
 * @param importance 重要性条件null | {isImportant: true, forms: [], items: []}
 * @returns {Promise<*[]>}
 */
const getTodaySelfJoinedFlowsStatisticOfFlowStatus = async (userId, status, importance) => {
    const filteredFlows = await flowService.filterTodayFlowsByFlowStatusAndImportanceEndOfForms(status, importance)

    let satisfiedFlows = [];
    let needFilterReviewItems = null
    if (importance) {
        needFilterReviewItems = importance.items
    }

    for (const flow of filteredFlows) {
        // 将该流程统计到审核节点的各个操作人
        const reviewItems = flow.overallprocessflow
        if (!reviewItems) {
            continue
        }
        for (const reviewItem of reviewItems) {
            // 如果需要过滤指定的items，那么不符合直接跳过
            if (needFilterReviewItems && needFilterReviewItems.length > 0) {
                if (!needFilterReviewItems.includes(reviewItem.activityId)) {
                    continue
                }
            }

            if (reviewItem.operatorUserId === userId) {
                satisfiedFlows.push(flow);
                break;
            }
        }
    }
    return satisfiedFlows
}

const getTodayDeptJoinedFlowsStatisticCountOfFlowStatus = async (deptId, status, importance) => {
    const result = await flowService.getDeptStatistic(getTodaySelfJoinedFlowsStatisticCountOfFlowStatus,
        deptId, status, importance)
    return result
}

const getTodayDeptJoinedFlowsStatisticCountOfReviewType = async (deptId, status, importance) => {
    const result = await flowService.getDeptStatistic(getTodaySelfJoinedFlowsStatisticCountOfReviewType,
        deptId, status, importance)
    return result
}

const getTodayDeptJoinedFlowsStatisticCountOfOverDue = async (deptId, importance) => {
    const result = await getDeptJoinedOverDueStatistic(deptId, importance)
    return result;
}

const getDeptJoinedOverDueStatistic = async (deptId, status, importance) => {
    const requiredDepartment = await departmentService.getDepartmentWithUsers(deptId);
    if (!requiredDepartment) {
        console.error(`未找到部门：${deptId}的信息`)
        return null
    }

    let convertedDoingResult = {sum: 0, departments: []}
    let convertedDoneResult = {sum: 0, departments: []}
    //todo：此步可以省略，直接去requiredDepartment的下的dept_user
    const usersOfDepartment = departmentService.simplifiedUsersOfDepartment(requiredDepartment)
    const users = usersOfDepartment.deptUsers
    for (const user of users) {
        const result = await getTodaySelfJoinedFlowsStatisticCountOfOverDue(user.userid, importance)
        if (result.doing.sum > 0) {
            convertedDoingResult = flowService.convertSelfStatisticToDept(result.doing, user.name,
                requiredDepartment.parent_id == 1,
                requiredDepartment.name, convertedDoingResult
            )
        }
        if (result.done.sum > 0) {
            convertedDoneResult = flowService.convertSelfStatisticToDept(result.done, user.name,
                requiredDepartment.parent_id == 1,
                requiredDepartment.name, convertedDoneResult
            )
        }
    }
    return {
        sum: convertedDoingResult.sum + convertedDoneResult.sum,
        doing: convertedDoingResult,
        done: convertedDoneResult
    }
}

module.exports = {
    getTodaySelfJoinedFlowsStatisticOfFlowStatus,
    getTodaySelfJoinedFlowsStatisticCountOfFlowStatus,
    getTodaySelfJoinedFlowsStatisticOfReviewType,
    getTodaySelfJoinedFlowsStatisticCountOfReviewType,
    getTodaySelfJoinedFlowsStatisticOfOverDue,
    getTodaySelfJoinedFlowsStatisticCountOfOverDue,
    // 按部门参与统计
    getTodayDeptJoinedFlowsStatisticCountOfFlowStatus,
    getTodayDeptJoinedFlowsStatisticCountOfReviewType,
    getTodayDeptJoinedFlowsStatisticCountOfOverDue
}