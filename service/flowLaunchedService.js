const flowService = require("./flowService")
const statisticStatusConst = require("../const/statisticStatusConst")
const departmentService = require("../service/departmentService")
const globalGetter = require("../global/getter")
const statisticResultUtil = require("../utils/statisticResultUtil")

/**
 * doing error completed terminated
 * @param userId
 * @param status
 * @param importance
 * @returns {Promise<{departments: {}}>}
 */
const getTodaySelfLaunchedFlowsStatisticCountOfFlowStatus = async (userId, status, importance) => {
    let filteredFlows = await flowService.filterTodayFlowsByFlowStatusAndImportanceEndOfForms(status, importance)
    filteredFlows = filteredFlows.filter((flow) => {
        return flow.originator.userId === userId;
    })
    const flowsOfDepartment = await flowService.flowsDividedByDepartment(filteredFlows)
    const result = await flowService.sumFlowsByDepartment(flowsOfDepartment)
    if (result.departments) {
        const convertedData = await flowService.convertJonsToArr(result.departments)
        result.departments = convertedData
    }
    result.ids = Object.keys(result.ids)
    result.sum = result.ids.length
    return result;
}

/**
 * 待转入
 * @param userId
 * @param type
 * @param importance
 * @returns {Promise<{departments: {}}>}
 */
const getTodaySelfLaunchedFlowsStatisticCountOfReviewType = async (userId, type, importance) => {
    let filteredFlows = await flowService.filterTodayFlowsByFlowStatusAndImportanceEndOfForms(
        statisticStatusConst.flowStatus.running,
        importance)

    filteredFlows = filteredFlows.filter((flow) => {
        return flow.originator.userId === userId;
    })

    filteredFlows = flowService.filterFlowByReviewTypeAndOperatorId(filteredFlows, type, userId);
    const flowsOfDepartment = await flowService.flowsDividedByDepartment(filteredFlows)
    const result = await flowService.sumFlowsByDepartment(flowsOfDepartment)

    if (result.departments) {
        const convertedData = await flowService.convertJonsToArr(result.departments)
        result.departments = convertedData
    }

    result.ids = Object.keys(result.ids)
    result.sum = result.ids.length
    return result;
}

const getTodaySelfLaunchedFlowsStatisticCountOfOverDue = async (userId, importance) => {
    const satisfiedFlowsObj = await getTodaySelfLaunchedFlowsStatisticOfOverDue(userId, importance)
    let allSum = 0;
    const uniqueIds = {}
    for (const status of Object.keys(satisfiedFlowsObj)) {
        const flowsDividedByDepartment = await flowService.flowsDividedByDepartment(satisfiedFlowsObj[status])
        const sumFlowsByDepartment = await flowService.sumFlowsByDepartment(flowsDividedByDepartment)
        for (const id of Object.keys(sumFlowsByDepartment.ids)) {
            uniqueIds[id] = 1
        }
        if (sumFlowsByDepartment.departments) {
            const convertedData = await flowService.convertJonsToArr(sumFlowsByDepartment.departments)
            sumFlowsByDepartment.departments = convertedData
        }
        satisfiedFlowsObj[status] = sumFlowsByDepartment
        allSum = allSum + (sumFlowsByDepartment["sum"] || 0)
    }
    satisfiedFlowsObj.ids = Object.keys(uniqueIds)
    satisfiedFlowsObj.sum = satisfiedFlowsObj.ids.length
    return satisfiedFlowsObj
}

const getTodaySelfLaunchedFlowsStatisticOfOverDue = async (userId, importance) => {
    const flowsOfRunningAndFinishedOfToday = await globalGetter.getTodayFlows()
    let filteredFlows = flowsOfRunningAndFinishedOfToday.filter((flow) => {
        if (flow && !flow.originator) {
            console.info(`异常流程：${flow.processInstanceId}, 没有originator信息， ${JSON.stringify(flow)}`)
            return false
        }
        return flow.originator.userId === userId;
    })
    filteredFlows = await flowService.filterFlowsByImportance(filteredFlows, importance)

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

const getTodayDeptLaunchedFlowsStatisticCountOfFlowStatus = async (deptId, status, importance) => {
    const result = await flowService.getDeptStatistic(getTodaySelfLaunchedFlowsStatisticCountOfFlowStatus,
        deptId, status, importance)
    return result
}
const getTodayDeptLaunchedFlowsStatisticCountOfReviewType = async (deptId, status, importance) => {
    const result = await flowService.getDeptStatistic(getTodaySelfLaunchedFlowsStatisticCountOfReviewType,
        deptId, status, importance)
    return result
}

const getTodayDeptLaunchedFlowsStatisticCountOfOverDue = async (deptId, importance) => {
    const requiredDepartment = await departmentService.getDepartmentWithUsers(deptId);
    if (!requiredDepartment) {
        console.error(`未找到部门：${deptId}的信息`)
        return null
    }

    let convertedDoingResult = {sum: 0, ids: {}, departments: []}
    let convertedDoneResult = {sum: 0, ids: {}, departments: []}
    //todo：此步可以省略，直接去requiredDepartment的下的dept_user
    const usersOfDepartment = departmentService.simplifiedUsersOfDepartment(requiredDepartment)
    const users = usersOfDepartment.deptUsers
    if (!users) {
        return {
            ids: [],
            sum: 0,
            doing: {ids: [], sum: 0},
            done: {ids: [], sum: 0}
        }
    }
    for (const user of users) {
        const result = await getTodaySelfLaunchedFlowsStatisticCountOfOverDue(user.userid, importance)
        if (result.doing.sum > 0) {
            convertedDoingResult = flowService.convertSelfStatisticToDept(result.doing, user.name, convertedDoingResult)
        }
        if (result.done.sum > 0) {
            convertedDoneResult = flowService.convertSelfStatisticToDept(result.done, user.name, convertedDoneResult)
        }
    }

    // 去掉不符的部门统计数据（用户会有跨部门的情况）
    convertedDoingResult = await statisticResultUtil.removeUnsatisfiedDeptStatistic(convertedDoingResult, deptId)
    convertedDoneResult = await statisticResultUtil.removeUnsatisfiedDeptStatistic(convertedDoneResult, deptId)

    return {
        ids: convertedDoingResult.ids.concat(convertedDoneResult.ids),
        sum: convertedDoneResult.sum + convertedDoingResult.sum,
        doing: convertedDoingResult,
        done: convertedDoneResult
    }
}

module.exports = {
    getTodaySelfLaunchedFlowsStatisticCountOfFlowStatus,
    getTodaySelfLaunchedFlowsStatisticCountOfReviewType,
    getTodaySelfLaunchedFlowsStatisticCountOfOverDue,
    // 按部门发起统计
    getTodayDeptLaunchedFlowsStatisticCountOfFlowStatus,
    getTodayDeptLaunchedFlowsStatisticCountOfReviewType,
    getTodayDeptLaunchedFlowsStatisticCountOfOverDue,
}