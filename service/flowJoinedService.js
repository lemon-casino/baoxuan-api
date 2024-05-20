const flowService = require("./flowService")
const departmentService = require("../service/departmentService")
const globalGetter = require("../global/getter")
const flowUtil = require("../utils/flowUtil")
const dateUtil = require("../utils/dateUtil")
const {flowStatusConst,flowReviewTypeConst} = require("../const/flowConst")
const NotFoundError = require("../error/http/notFoundError")

/**
 * 本人参与： 已逾期的流程数量（流程可重复）
 * @param userId
 * @param importance 重要性条件null | {isImportant: true, forms: [], items: []}
 * @returns {Promise<{}>}
 */
const getTodaySelfJoinedFlowsStatisticCountOfOverDue = async (userId, importance) => {
    const overDueFlows = await getTodaySelfJoinedFlowsStatisticOfOverDue(userId, importance)

    const allIds = {}
    for (const status of Object.keys(overDueFlows)) {
        const flowsDividedByDepartment = await flowService.flowsDividedByDepartment(overDueFlows[status])
        const sumFlowsByDepartment = await flowService.sumFlowsByDepartment(flowsDividedByDepartment)
        sumFlowsByDepartment.ids = Object.keys(sumFlowsByDepartment.ids)
        for (const id of sumFlowsByDepartment.ids) {
            allIds[id] = 1
        }
        sumFlowsByDepartment.sum = sumFlowsByDepartment.ids.length
        if (sumFlowsByDepartment.departments) {
            const convertedData = await flowService.convertJonsToArr(sumFlowsByDepartment.departments)
            sumFlowsByDepartment.departments = convertedData
        }
        overDueFlows[status] = sumFlowsByDepartment
    }
    overDueFlows.ids = Object.keys(allIds)
    overDueFlows.sum = overDueFlows.ids.length
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
    if (importance && importance.items) {
        needFilterReviewItems = importance.items
    }
    for (const flow of filteredFlows) {
        const userDoingOverDue = flowUtil.isUserDoingOverDueFlow(userId, flow, needFilterReviewItems)
        const userDoneOverDue = flowUtil.isUserDoneOverDueFlow(userId, flow, needFilterReviewItems)
        if (userDoingOverDue) {
            satisfiedFlows.doing.push(flow)
        }
        if (userDoneOverDue) {
            satisfiedFlows.done.push(flow)
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
    result.ids = Object.keys(result.ids)
    result.sum = result.ids.length
    return result
}

/**
 * 本人参与的：TODO、FORCAST、HISTORY 的流程详情
 * @param userId
 * @param reviewType 审核的节点类型
 * @param importance 重要性条件null | {isImportant: true, forms: [], items: []}
 * @returns {Promise<*[]>}
 */
const getTodaySelfJoinedFlowsStatisticOfReviewType = async (userId, reviewType, importance) => {
    const flowsOfRunningAndFinishedOfToday = await globalGetter.getTodayFlows()
    // 根据重要性和forms过滤流程
    const filteredFlows = await flowService.filterFlowsByImportance(flowsOfRunningAndFinishedOfToday, importance)

    let needFilterReviewItems = null
    if (importance && importance.items) {
        needFilterReviewItems = importance.items
    }

    let satisfiedFlows = [];
    for (const flow of filteredFlows) {
        let flowIsSatisfied = false
        if (reviewType === flowReviewTypeConst.HISTORY && flowUtil.isUserHasFinishedTodayFlow(userId, flow, needFilterReviewItems)) {
            flowIsSatisfied = true
        }
        if (reviewType === flowReviewTypeConst.TODO && flowUtil.isUserDoingFlow(userId, flow, needFilterReviewItems)) {
            flowIsSatisfied = true
        }
        if (reviewType === flowReviewTypeConst.FORCAST && flowUtil.isUserTodoFlow(userId, flow, needFilterReviewItems)) {
            flowIsSatisfied = true
        }

        if (flowIsSatisfied) {
            satisfiedFlows.push(flow)
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
    result.ids = Object.keys(result.ids)
    result.sum = result.ids.length
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
        if (flowUtil.isUserErrorFlow(userId, flow, needFilterReviewItems)) {
            satisfiedFlows.push(flow)
        }

        if (flowUtil.isUserTerminatedFlow(userId, flow, needFilterReviewItems)) {
            satisfiedFlows.push(flow)
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

    // 对于部门参与已完成的流程，需要流程中所有关于部门成员的节点都完成才行
    if (status === flowReviewTypeConst.HISTORY) {
        const todayFlows = await globalGetter.getTodayFlows()
        const departmentsWithUsers = await globalGetter.getUsersOfDepartments()

        const allUniqueIds = {}
        for (const deptStatistic of result.departments) {
            // 获取部门下的用户
            let usersOfDept = []
            for (const department of departmentsWithUsers) {
                const deptDetails = await departmentService.getDepartmentByDeptName(deptStatistic.deptName, department)
                if (deptDetails) {
                    usersOfDept = deptDetails.dep_user
                    break
                }
            }

            const currDeptFinishedIds = []
            for (const id of deptStatistic.ids) {
                const flows = todayFlows.filter(flow => flow.processInstanceId === id)
                const ignoreTypes = [flowStatusConst.ERROR, flowStatusConst.TERMINATED]
                const doingTypes = [flowReviewTypeConst.TODO, flowReviewTypeConst.FORCAST]

                // 异常跳过
                if (ignoreTypes.includes(flows[0].instanceStatus)) {
                    continue
                }

                const newFlow = flowUtil.flatReviewItems(flows[0])

                // 流程要部门下所有参与的人都完成(没参与的忽略)
                let doneDateTimes = []
                let someUserDoing = false
                for (const item of newFlow.overallprocessflow) {
                    for (const user of usersOfDept) {
                        if (user.userid === item.operatorUserId) {
                            if (item.type === flowReviewTypeConst.HISTORY) {
                                const doneDate = dateUtil.formatGMT2Str(item.operateTimeGMT, "YYYY-MM-DD")
                                doneDateTimes.push(doneDate)
                            }
                            if (doingTypes.includes(item.type)) {
                                someUserDoing = true
                                break
                            }
                        }
                    }
                    if (someUserDoing) {
                        break
                    }
                }
                if (someUserDoing) {
                    continue
                }

                if (doneDateTimes.includes(dateUtil.format2Str(new Date(), "YYYY-MM-DD"))) {
                    allUniqueIds[id] = 1
                    currDeptFinishedIds.push(id)
                }
            }
            deptStatistic.ids = currDeptFinishedIds
            deptStatistic.sum = currDeptFinishedIds.length
        }
        result.ids = Object.keys(allUniqueIds)
        result.sum = result.ids.length
    }

    return result
}

const getTodayDeptJoinedFlowsStatisticCountOfOverDue = async (deptId, importance) => {
    const result = await getDeptJoinedOverDueStatistic(deptId, importance)
    return result;
}

const getDeptJoinedOverDueStatistic = async (deptId, importance) => {
    const requiredDepartment = await departmentService.getDepartmentWithUsers(deptId);
    if (!requiredDepartment) {
        throw new NotFoundError(`未找到部门：${deptId}的信息`)
    }

    let convertedDoingResult = {sum: 0, ids: {}, departments: []}
    let convertedDoneResult = {sum: 0, ids: {}, departments: []}

    const usersOfDepartment = departmentService.simplifiedUsersOfDepartment(requiredDepartment)
    const users = usersOfDepartment.deptUsers
    if (!users || users.length === 0) {
        return {
            ids: [],
            sum: 0,
            doing: {...convertedDoingResult, ids: []},
            done: {...convertedDoneResult, ids: []}
        }
    }
    for (const user of users) {
        const result = await getTodaySelfJoinedFlowsStatisticCountOfOverDue(user.userid, importance)
        if (result.doing.sum > 0) {
            convertedDoingResult = flowService.convertSelfStatisticToDept(result.doing, user.name, convertedDoingResult)
        }
        if (result.done.sum > 0) {
            convertedDoneResult = flowService.convertSelfStatisticToDept(result.done, user.name, convertedDoneResult)
        }
    }

    // 根据ids 添加sum数据
    convertedDoingResult.ids = Object.keys(convertedDoingResult.ids)
    convertedDoingResult.sum = convertedDoingResult.ids.length
    for (const department of convertedDoingResult.departments) {
        department.ids = Object.keys(department.ids)
        department.sum = department.ids.length
    }
    convertedDoneResult.ids = Object.keys(convertedDoneResult.ids)
    convertedDoneResult.sum = convertedDoneResult.ids.length

    for (const department of convertedDoneResult.departments) {
        department.ids = Object.keys(department.ids)
        department.sum = department.ids.length
    }

    const allUniqueIds = {}
    for (const id of convertedDoneResult.ids) {
        allUniqueIds[id] = 1
    }
    for (const id of convertedDoingResult.ids) {
        allUniqueIds[id] = 1
    }

    const idArr = Object.keys(allUniqueIds)
    return {
        ids: idArr,
        sum: idArr.length,
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