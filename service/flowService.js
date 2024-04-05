const dateUtil = require("../utils/dateUtil")
const FlowForm = require("../model/flowfrom")
const formService = require("../service/formService")
const departmentService = require("../service/departmentService")
const flowRepo = require("../repository/flowRepo")
const globalGetter = require("../global/getter")
const statisticResultUtil = require("../utils/statisticResultUtil")
const flowStatusConst = require("../const/flowStatusConst")

const filterFlowsByTimesRange = (flows, timesRange) => {
    const satisfiedFlows = []
    for (const flow of flows) {
        // 筛选符合条件 flow
        const createTime = dateUtil.formatGMT(flow.createTimeGMT)
        const startTime = new Date(timesRange[0])
        const endTime = new Date(timesRange[1])

        if (createTime >= startTime && createTime <= endTime) {
            satisfiedFlows.push(flow)
        }
    }
    return satisfiedFlows;
}

const filterFlowsByImportanceCondition = async (flows, importanceCondition) => {
    const allForms = await FlowForm.getFlowFormList()
    const satisfiedFlows = []
    for (const flow of flows) {
        const {type, forms} = importanceCondition
        if (forms && forms.includes(flow.formUuid)) {
            satisfiedFlows.push(flow)
            continue
        }
        const formDetails = allForms.filter((form) => {
            return form.formUuid === flow.formUuid
        })

        if ((type === "important" && formDetails[0].status === "1") || (type === "unImportant" && formDetails[0].status === "2")) {
            satisfiedFlows.push(flow)
        }
    }
    return satisfiedFlows;
}


const getFlowsOfDepartmentBy = async (departments, selfJoinOrLaunch, timesRange, formImportanceCondition) => {
    //  获取部门下所有人员的参与的符合条件的流程
    const satisfiedSelfFlows = [];
    for (const department of departments) {
        const depUsers = department.dep_user;
        for (const user of depUsers) {
            const satisfiedFlowOfTimesRange = await filterFlowsByTimesRange(user[selfJoinOrLaunch], timesRange)
            // 需要去重
            const uniqueFlowsKeys = {}
            const uniqueFlows = []
            for (const flow of satisfiedFlowOfTimesRange) {
                if (!Object.keys(uniqueFlowsKeys).includes(flow.processInstanceId)) {
                    uniqueFlows.push(flow)
                }
            }
            const satisfiedFlowOfImportance = await filterFlowsByImportanceCondition(uniqueFlows, formImportanceCondition)
            satisfiedSelfFlows.push(satisfiedFlowOfImportance)
        }
    }
    return satisfiedSelfFlows
}


const filterFlowByFlowStatus = (flows, flowStatus) => {
    const satisfiedFlows = flows.filter((flow) => {
        return flow.instanceStatus === flowStatus
    })
    return satisfiedFlows
}

const filterFlowByReviewType = (flows, type) => {
    const satisfiedFlows = flows.filter((flow) => {
        const reviewInfo = flow.overallprocessflow;
        if (reviewInfo) {
            return flow.overallprocessflow.filter((item) => {
                return item.type === type
            }).length > 0
        }
        return false;
    })
    return satisfiedFlows
}

const filterFlowByReviewTypeAndOperatorId = (flows, type, operatorId) => {
    const satisfiedFlows = flows.filter((flow) => {
        const reviewInfo = flow.overallprocessflow;
        if (reviewInfo) {
            return flow.overallprocessflow.filter((item) => {
                return item.type === type && item.operatorUserId === operatorId
            }).length > 0
        }
        return false;
    })
    return satisfiedFlows
}

const findReviewItemByType = (flow, reviewStatus) => {
    const reviewInfo = flow.overallprocessflow
    if (reviewInfo) {
        for (const item of reviewInfo) {
            if (item.type === reviewStatus) {
                return true
            }
        }
    }
    return null
}

// // 筛选出指定状态的流程
// const filterFlowsByFlowStatus = async (flows, status) => {
//     let statisticOfUsers = []
//     for (const flow of flows) {
//         if (status === statusTypes.reviewStatus) {
//             const reviewItem = await flowService.findReviewItemByType(flow, status.name)
//             if (reviewItem) {
//                 const user = {userId: reviewItem.operatorUserId, userName: reviewItem.operatorName}
//                 statisticOfUsers = await sumOfStatisticOfUsers(user, statisticOfUsers);
//             }
//         } else {
//             // 将该流程统计到审核节点的各个操作人
//             const reviewItems = flow.overallprocessflow
//             if (reviewItems) {
//                 for (const reviewItem of reviewItems) {
//                     const user = {userId: reviewItem.operatorUserId, userName: reviewItem.operatorName}
//                     statisticOfUsers = await sumOfStatisticOfUsers(user, statisticOfUsers);
//                 }
//             }
//         }
//     }
// }


/**
 * 根据按部门汇总的流程，按照部门进行统计返回
 * @param flowsOfDepartments
 * @returns {Promise<{sum: number, departments: {}}>}
 */
const sumFlowsByDepartment = async (flowsOfDepartments) => {
    const result = {sum: 0, departments: {}}
    for (const dep of Object.keys(flowsOfDepartments)) {
        const count = flowsOfDepartments[dep].length
        const ids = flowsOfDepartments[dep].map((flow) => flow.processInstanceId)
        result.departments[dep] = {sum: count, ids};
        result.sum = result.sum + count
    }
    return result
}

/**
 * 将流程按照发起人所在的部门进行分类
 * @param flows
 * @returns {Promise<{sum: number, departments: {}}>}
 */
const flowsDividedByDepartment = async (flows) => {
    const result = {}
    for (const flow of flows) {
        // todo: 这种方式的遍历太耗时了
        // 根据流程发起人所在的部门汇总数据
        // warning: 如果userId用户存在多部门的情况，会重复计算
        const departmentsOfUser = await departmentService.getDepartmentOfUser(flow.originator.userId);
        const topDepartments = departmentsOfUser.filter((dep) => {
            return dep.dep_detail.parent_id === 1
        })

        for (const department of topDepartments) {
            const subDepartments = departmentsOfUser.filter((dep) => dep.dep_detail.parent_id === department.dep_detail.dept_id)
            if (subDepartments.length > 0) {
                for (const subDepartment of subDepartments) {
                    if (Object.keys(result).includes(subDepartment.dep_detail.name)) {
                        result[subDepartment.dep_detail.name].push(flow)
                    } else {
                        result[subDepartment.dep_detail.name] = [flow]
                    }
                }
            } else {
                if (Object.keys(result).includes(department.dep_detail.name)) {
                    result[department.dep_detail.name].push(flow)
                } else {
                    result[department.dep_detail.name] = [flow]
                }
            }
        }
    }
    return result
}

/**
 * 根据流程状态和重要性(是否重要、forms 条件)过滤流程
 * @param status
 * @param importance
 * @returns {Promise<*>}
 */
const filterTodayFlowsByFlowStatusAndImportanceEndOfForms = async (status, importance) => {
    const flowsOfRunningAndFinishedOfToday = await globalGetter.getTodayFlows()
    if (!flowsOfRunningAndFinishedOfToday) {
        return []
    }
    const flowOfStatus = flowsOfRunningAndFinishedOfToday.filter((flow) => flow.instanceStatus === status)
    // 根据重要性和forms过滤流程
    const filteredFlows = await filterFlowsByImportance(flowOfStatus, importance)
    return filteredFlows;
}

/**
 * 根据重要性条件中的 isImportant forms
 * @param flows
 * @param importance
 * @returns {Promise<*>}
 */
const filterFlowsByImportance = async (flows, importance) => {
    let filteredFlows = flows
    if (importance) {
        const {isImportant, forms} = importance
        if (forms && forms.length > 0) {
            filteredFlows = filterFlowsByForms(filteredFlows, forms)
        } else if (isImportant.toString() === "true" || isImportant.toString() === "false") {
            filteredFlows = await filterFlowsByImportant(filteredFlows, isImportant)
        }
    }
    return filteredFlows
}


/**
 * 根据重要性过滤流程
 * @param flows 需要筛选的流程
 * @param isImportant 是否重要 true | false
 * @returns {Promise<*>}
 */
const filterFlowsByImportant = async (flows, isImportant) => {
    if (!isImportant) {
        return flows
    }
    const formsOfImportance = await formService.getFormsByImportance(isImportant)
    const filteredFlows = flows.filter((flow) => {
        return formsOfImportance.some((form) => {
            return form.formUuid === flow.formUuid
        })
    })
    return filteredFlows;
}

/**
 * 根据forms条件过滤匹配的flows
 * @param flows 需要筛选的流程
 * @param forms 需要匹配的表单
 * @returns {Promise<*>}
 */
const filterFlowsByForms = (flows, forms) => {
    if (!forms || forms.length === 0) {
        return flows
    }
    const filteredFlows = flows.filter((flow) => {
        return forms.includes(flow.formUuid)
    })
    return filteredFlows;
}


const sumFlowsByDepartmentOfMultiType = async (flowsOfMultiType) => {
    const result = {}
    for (const type of Object.keys(flowsOfMultiType)) {
        const curFlows = flowsOfMultiType[type];
        if (curFlows && curFlows.length > 0) {
            const tmpResult = await sumFlowsByDepartment(curFlows)
            result[type] = tmpResult
            if (result.sum) {
                result.sum = result.sum + tmpResult.sum
            } else {
                result.sum = tmpResult.sum
            }
        } else {
            if (!result.sum) {
                result.sum = 0
            }
            result[type] = {sum: 0}
        }
    }
    return result
}

const getFlowsByIds = async (ids) => {
    return await flowRepo.getProcessByIds(ids);
}

const getTodayFlowsByIds = async (ids) => {
    const flowsOfRunningAndFinishedOfToday = await globalGetter.getTodayFlows()
    const satisfiedFlows = await flowsOfRunningAndFinishedOfToday.filter((item) => ids.includes(item.processInstanceId))
    return satisfiedFlows;
}

/**
 * 将departments的json格式转成arr
 * @param departments
 * @returns {Promise<*[]>}
 */
const convertJonsToArr = async (departments) => {
    const tmpDepartments = []
    for (const key of Object.keys(departments)) {
        tmpDepartments.push({deptName: key, sum: departments[key].sum, ids: departments[key].ids})
    }
    return tmpDepartments
}

/**
 * 将本人统计的数据格式转成按部门统计的格式
 * @param statistic
 * @param userName
 * @param isFirstLevelDept
 * @param subDepartmentName
 * @param resultTemplate
 * @returns {*}
 */
const convertSelfStatisticToDept = (statistic, userName, isFirstLevelDept, subDepartmentName, resultTemplate) => {
    if (statistic.sum == 0) {
        return resultTemplate
    }

    const departments = statistic.departments
    for (const notComputedDept of departments) {
        // 按子部门筛选，需要精确匹配
        if (!isFirstLevelDept && notComputedDept.deptName !== subDepartmentName) {
            continue
        }
        resultTemplate.sum = resultTemplate.sum + notComputedDept.sum

        // 开始时为空数据，直接加进去
        if (resultTemplate.departments.length === 0) {
            resultTemplate.departments.push({
                deptName: notComputedDept.deptName,
                sum: notComputedDept.sum,
                users: [{userName: userName, sum: notComputedDept.sum, ids: notComputedDept.ids}]
            })
            continue
        }

        for (let i = 0; i < resultTemplate.departments.length; i++) {
            const deptOfTemplate = resultTemplate.departments[i]
            if (notComputedDept.deptName === deptOfTemplate.deptName) {
                deptOfTemplate.sum = deptOfTemplate.sum + notComputedDept.sum
                // todo: 如果出现人名重复，需要再此进行合并
                deptOfTemplate.users.push({
                    userName: userName,
                    sum: notComputedDept.sum,
                    ids: notComputedDept.ids
                })
                resultTemplate.departments[i] = deptOfTemplate
                break;
            } else if (i === resultTemplate.departments.length - 1) {
                resultTemplate.departments.push({
                    deptName: notComputedDept.deptName,
                    sum: notComputedDept.sum,
                    users: [{userName: userName, sum: notComputedDept.sum, ids: notComputedDept.ids}]
                })
                break
            }
        }
    }
    return resultTemplate;
}


/**
 * 中转调用 funOfTodaySelfStatistic 获取统计数据并进行格式转化
 * @param funOfTodaySelfStatistic
 * @param deptId
 * @param status
 * @param importance
 * @returns {Promise<null|{sum: number, departments: *[]}>}
 */
const getDeptStatistic = async (funOfTodaySelfStatistic, deptId, status, importance) => {
    const requiredDepartment = await departmentService.getDepartmentWithUsers(deptId);
    if (!requiredDepartment) {
        console.error(`未找到部门：${deptId}的信息`)
        return null
    }

    let convertedResult = {sum: 0, departments: []}
    const usersOfDepartment = departmentService.simplifiedUsersOfDepartment(requiredDepartment)
    const users = usersOfDepartment.deptUsers

    if (!users || users.length === 0) {
        return convertedResult
    }
    for (const user of users) {
        const result = await funOfTodaySelfStatistic(user.userid, status, importance)
        convertedResult = convertSelfStatisticToDept(result, user.name,
            requiredDepartment.parent_id == 1,
            requiredDepartment.name, convertedResult)
    }

    return await statisticResultUtil.removeUnsatisfiedDeptStatistic(convertedResult, deptId)
}

/**
 * 根据表单和流程状态获取今天的流程
 * @param formId
 * @param flowStatus
 * @returns {Promise<T[]>}
 */
const getTodayFlowsByFormIdAndFlowStatus = async (formId, flowStatus) => {
    const todayFlows = await globalGetter.getTodayFlows();
    return todayFlows.filter((flow) => {
        return flow.formUuid === formId && flow.instanceStatus === flowStatus
    })
}

/**
 * 获取指定状态的表单流程filed的值
 * @param formId
 * @param linkIdKeyInFightingFlowForm
 * @returns {Promise<*[]>}
 */
const getFlowFormValues = async (formId, fieldKey, flowStatus) => {
    const fightingLinkIds = []
    const flows = await getTodayFlowsByFormIdAndFlowStatus(formId, flowStatus)
    for (const flow of flows) {
        if (!flow.data) {
            continue
        }
        const runningLinkId = flow.data[fieldKey]
        if (runningLinkId) {
            fightingLinkIds.push(runningLinkId)
        }
    }
    return fightingLinkIds
}

module.exports = {
    filterFlowsByTimesRange,
    filterFlowsByImportanceCondition,
    getFlowsOfDepartmentBy,
    filterFlowByFlowStatus,
    filterFlowByReviewType,
    filterFlowByReviewTypeAndOperatorId,
    findReviewItemByType,
    filterFlowsByForms,
    filterFlowsByImportant,
    filterFlowsByImportance,
    filterTodayFlowsByFlowStatusAndImportanceEndOfForms,
    flowsDividedByDepartment,
    sumFlowsByDepartment,
    sumFlowsByDepartmentOfMultiType,
    getFlowsByIds,
    getTodayFlowsByIds,
    convertJonsToArr,
    convertSelfStatisticToDept,
    getDeptStatistic,
    getTodayFlowsByFormIdAndFlowStatus,
    getFlowFormValues
}