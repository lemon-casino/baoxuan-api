const flowService = require("./flowService")
const statisticStatusConst = require("../const/statisticStatusConst")
const departmentService = require("../service/departmentService")
const globalGetter = require("../global/getter")

/**
 * 本人参与： 已逾期的流程数量（流程可重复）
 * @param userId
 * @param importance 重要性条件null | {isImportant: true, forms: [], items: []}
 * @returns {Promise<{}>}
 */
const getTodaySelfJoinedFlowsStatisticCountOfOverDue = async (userId, importance) => {
    const overDueFlows = await getTodaySelfJoinedFlowsStatisticOfOverDue(userId, importance)

    let sum = 0
    for (const key of Object.keys(overDueFlows)) {
        const flowsDividedByDepartment = await flowService.flowsDividedByDepartment(overDueFlows[key])
        const sumFlowsByDepartment = await flowService.sumFlowsByDepartment(flowsDividedByDepartment)
        sumFlowsByDepartment.sum = Object.keys(sumFlowsByDepartment.ids).length
        sum = sum + sumFlowsByDepartment.sum
        if (sumFlowsByDepartment.departments) {
            const convertedData = await flowService.convertJonsToArr(sumFlowsByDepartment.departments)
            sumFlowsByDepartment.departments = convertedData
        }
        overDueFlows[key] = sumFlowsByDepartment
    }
    overDueFlows["sum"] = sum
    return overDueFlows
}

/**
 * 本人参与：已逾期的流程详情（流程可重复）
 * @param userId
 * @param importance 重要性条件null | {isImportant: true, forms: [], items: []}
 * @returns {Promise<{doing: *[], done: *[]}>}
 */
const getTodaySelfJoinedFlowsStatisticOfOverDue = async (userId, importance) => {
    const flowsOfRunningAndFinishedOfToday = await globalGetter.getTodayFlows()

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
        }
    }
    return satisfiedFlows;
}

/**
 * 本人参与：TODO、FORCAST、HISTORY 的流程数量
 * @param userId
 * @param reviewType
 * @param importance
 * @returns {Promise<{departments: {}}>}
 */
const getTodaySelfJoinedFlowsStatisticCountOfReviewType = async (userId, reviewType, importance) => {
    const satisfiedFlows = await getTodaySelfJoinedFlowsStatisticOfReviewType(userId, reviewType, importance)
    const flowsOfDepartment = await flowService.flowsDividedByDepartment(satisfiedFlows)
    const result = await flowService.sumFlowsByDepartment(flowsOfDepartment)
    if (result.departments) {
        const convertedData = await flowService.convertJonsToArr(result.departments)
        result.departments = convertedData
    }
    result.sum = Object.keys(result.ids).length
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
    const flowsOfRunningAndFinishedOfToday = await globalGetter.getTodayFlows()
    // 根据重要性和forms过滤流程
    const filteredFlows = await flowService.filterFlowsByImportance(flowsOfRunningAndFinishedOfToday, importance)
    let satisfiedFlows = [];
    let needFilterReviewItems = null
    if (importance) {
        needFilterReviewItems = importance.items
    }

    if(userId === "2103600332651419" &&  reviewType === "TODO"  && importance.forms[0]=== "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3"){
        console.log("--------")
    }

    for (const flow of filteredFlows) {

        if (flow.processInstanceId === "a0d1b354-dadb-4f1b-937b-816554a65128") {
            console.log("--------")
        }
        // 将该流程统计到审核节点的各个操作人
        const reviewItems = flow.overallprocessflow
        if (!reviewItems) {
            continue
        }
        let hasDoneReviewItemOfUser = false
        let canStopFinding = false
        for (let i = 0; i < reviewItems.length; i++) {
            const reviewItem = reviewItems[i]

            // 如果需要过滤指定的items，那么不符合直接跳过
            if (needFilterReviewItems && needFilterReviewItems.length > 0) {
                if (!needFilterReviewItems.includes(reviewItem.activityId)) {
                    continue
                }
            }

            let currentReviewItems = [reviewItem]
            // 如果是多人协同的工作，需要到domainList中遍历
            if (reviewItem.domainList && reviewItem.domainList.length > 0) {
                currentReviewItems = reviewItem.domainList
            }

            for (const item of currentReviewItems) {
                // 对于已完成的流程，需要整个流程中涉及本人的工作都已完成
                if (reviewType === statisticStatusConst.reviewType.history) {
                    if (item.operatorUserId === userId) {
                        if (item.type === statisticStatusConst.reviewType.todo ||
                            item.type === statisticStatusConst.reviewType.forecast) {
                            canStopFinding = true
                            break;
                        } else {
                            hasDoneReviewItemOfUser = true
                        }
                    }
                    if (hasDoneReviewItemOfUser && i === reviewItems.length - 1) {
                        satisfiedFlows.push(flow)
                        canStopFinding = true
                    }
                } else {
                    // todo类型和 forcast类型 存在一个即为有效，不用遍历全部
                    //  非本人且类型不匹配的直接跳过
                    if (item.operatorUserId !== userId || item.type !== reviewType) {
                        continue
                    }
                    satisfiedFlows.push(flow)
                    canStopFinding = true
                    break;
                }
            }
            if (canStopFinding) {
                break;
            }
        }
    }
    return satisfiedFlows
}


/**
 * 本人参与的 error terminated 的流程数量（流程可重复）
 * @param userId
 * @param status
 * @param importance
 * @returns {Promise<{departments: {}}>}
 */
const getTodaySelfJoinedFlowsStatisticCountOfFlowStatus = async (userId, status, importance) => {
    const satisfiedFlows = await getTodaySelfJoinedFlowsStatisticOfFlowStatus(userId, status, importance)
    const flowsOfDepartment = await flowService.flowsDividedByDepartment(satisfiedFlows)
    const result = await flowService.sumFlowsByDepartment(flowsOfDepartment)
    if (result.departments) {
        const convertedData = await flowService.convertJonsToArr(result.departments)
        result.departments = convertedData
    }
    result.sum = Object.keys(result.ids).length
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
    let needFilterReviewItems = []
    if (importance && importance.items) {
        needFilterReviewItems = importance.items
    }

    for (const flow of filteredFlows) {
        // 将该流程统计到审核节点的各个操作人
        const reviewItems = flow.overallprocessflow
        if (!reviewItems) {
            continue
        }
        for (const reviewItem of reviewItems) {
            if (reviewItem.operatorUserId === userId) {
                // 如果需要过滤指定的items，那么不符合直接跳过
                if (needFilterReviewItems.length > 0) {
                    if (needFilterReviewItems.includes(reviewItem.activityId)) {
                        satisfiedFlows.push(flow)
                        break
                    }
                } else {
                    satisfiedFlows.push(flow)
                    break
                }
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

    let convertedDoingResult = {sum: 0, ids: {}, departments: []}
    let convertedDoneResult = {sum: 0, ids: {}, departments: []}

    const usersOfDepartment = departmentService.simplifiedUsersOfDepartment(requiredDepartment)
    const users = usersOfDepartment.deptUsers
    if (!users || users.length === 0) {
        return {
            sum: 0,
            doing: convertedDoingResult,
            done: convertedDoneResult
        }
    }
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

    // 根据ids 添加sum数据
    convertedDoingResult.sum = Object.keys(convertedDoingResult.ids).length
    for (const department of convertedDoingResult.departments) {
        department.sum = Object.keys(department.ids).length
    }
    convertedDoneResult.sum = Object.keys(convertedDoneResult.ids).length
    for (const department of convertedDoneResult.departments) {
        department.sum = Object.keys(department.ids).length
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