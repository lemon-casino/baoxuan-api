const _ = require("lodash")
const FlowForm = require("../model/flowfrom")
const flowRepo = require("../repository/flowRepo")
const flowFormRepo = require("../repository/flowFormRepo")
const userRepo = require("../repository/userRepo")
const formService = require("../service/flowFormService")
const departmentService = require("../service/departmentService")
const dingDingService = require("../service/dingDingService")
const processService = require("../service/processService")
const redisRepo = require("../repository/redisRepo")
const globalGetter = require("../global/getter")
const globalSetter = require("../global/setter")
const dateUtil = require("../utils/dateUtil")
const flowUtil = require("../utils/flowUtil")
const NotFoundError = require("../error/http/notFoundError")
const ParameterError = require("../error/parameterError")
const departmentCoreActivityStat = require("../core/statistic/departmentCoreActivityStat")
const departmentsOverallFlowsStat = require("../core/statistic/departmentsOverallFlowsStat")
const userFlowStat = require("../core/statistic/userFlowsStat")
const {flowReviewTypeConst, flowStatusConst} = require("../const/flowConst")

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

/**
 * 根据按部门汇总的流程，按照部门进行统计返回
 * @param flowsOfDepartments
 * @returns {Promise<{ departments: {}}>}
 */
const sumFlowsByDepartment = async (flowsOfDepartments) => {
    const result = {ids: {}, departments: {}}
    for (const dep of Object.keys(flowsOfDepartments)) {
        const count = flowsOfDepartments[dep].length
        const ids = flowsOfDepartments[dep].map((flow) => flow.processInstanceId)
        for (const id of ids) {
            result.ids[id] = 1
        }
        result.departments[dep] = {sum: count, ids}
    }
    return result
}

/**
 * 将流程按照发起人所在的部门进行分类
 * @param flows
 * @returns {Promise<{}>}
 */
const flowsDividedByDepartment = async (flows) => {
    const result = {}
    for (const flow of flows) {
        // 根据流程发起人所在的部门汇总数据
        // warning: 如果userId用户存在多部门的情况，会重复计算
        const departmentsOfUser = await departmentService.getDepartmentOfUser(flow.originator.userId)

        // 人员的leader_in_dept 是一种扁平的结构，有子部门的归算的子部门，没有的就归算到一级部门下
        // 获取一级部门信息
        const topDepartments = departmentsOfUser.filter((dep) => {
            if (dep && dep.dep_detail && dep.dep_detail.parent_id) {
                return dep.dep_detail.parent_id === 1
            }
            return false
        })

        for (const department of topDepartments) {
            const subDepartments = departmentsOfUser.filter((dep) => {
                if (dep && dep.dep_detail && dep.dep_detail.parent_id) {
                    return dep.dep_detail.parent_id === department.dep_detail.dept_id
                }
                return false
            })
            // 存在子部门统计到子部门下
            if (subDepartments.length > 0) {
                for (const subDepartment of subDepartments) {
                    if (Object.keys(result).includes(subDepartment.dep_detail.name)) {
                        result[subDepartment.dep_detail.name].push(flow)
                    } else {
                        result[subDepartment.dep_detail.name] = [flow]
                    }
                }
            }
            // 没有子部门统计到一级部门下
            else {
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
        }
        if (isImportant.toString() === "true" || isImportant.toString() === "false") {
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
    const formsOfImportance = await formService.getFormsByImportance(isImportant)
    const filteredFlows = flows.filter((flow) => {
        return formsOfImportance.some((form) => {
            return form.flowFormId === flow.formUuid
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
    const satisfiedFlows = []
    const matchedTodayFlowIds = []
    for (const flow of flowsOfRunningAndFinishedOfToday) {
        if (ids.includes(flow.processInstanceId)) {
            satisfiedFlows.push(flow)
            if (satisfiedFlows.length === ids.length) {
                break
            }
            matchedTodayFlowIds.push(flow.processInstanceId)
        }
    }
    // 需要从数据库中获取流程
    const stockedFlowIds = ids.filter(id => !matchedTodayFlowIds.includes(id))
    if (stockedFlowIds.length > 0) {
        const stockedFlows = await flowRepo.getProcessByIds(stockedFlowIds)
        for (const flow of stockedFlows) {
            satisfiedFlows.push({...flow, originator: {userId: flow.originatorId}})
        }
    }
    // const satisfiedFlows = await flowsOfRunningAndFinishedOfToday.filter((item) => ids.includes(item.processInstanceId))
    // 为流程添加发起人的部门信息
    for (const flow of satisfiedFlows) {
        let departmentNames = ""
        const departmentsOfUser = await departmentService.getDepartmentOfUser(flow.originator.userId)
        // 人员的leader_in_dept 是一种扁平的结构，有子部门的归算的子部门，没有的就归算到一级部门下
        // 获取一级部门信息
        const topDepartments = departmentsOfUser.filter((dep) => {
            if (dep && dep.dep_detail && dep.dep_detail.parent_id) {
                return dep.dep_detail.parent_id === 1
            }
            return false
        })

        for (const department of topDepartments) {
            const subDepartments = departmentsOfUser.filter((dep) => {
                if (dep && dep.dep_detail && dep.dep_detail.parent_id) {
                    return dep.dep_detail.parent_id === department.dep_detail.dept_id
                }
                return false
            })
            // 存在子部门统计到子部门下
            if (subDepartments.length > 0) {
                for (const subDepartment of subDepartments) {
                    departmentNames = `${departmentNames},${subDepartment.dep_detail.name}`
                }
            }
            // 没有子部门统计到一级部门下
            else {
                departmentNames = `${departmentNames},${department.dep_detail.name}`
            }
        }
        if (departmentNames.startsWith(",")) {
            flow.departmentName = departmentNames.substring(1)
        } else {
            flow.departmentName = departmentNames
        }

    }
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
 * @param resultTemplate
 * @returns {*}
 */
const convertSelfStatisticToDept = (statistic, userName, resultTemplate) => {
    if (statistic.sum == 0) {
        return resultTemplate
    }

    for (const notComputedDept of statistic.departments) {
        // 保存所有用户（不分部门）都不重复的id
        for (const id of notComputedDept.ids) {
            resultTemplate.ids[id] = 1
        }

        // 开始时为空数据，直接加进去
        if (resultTemplate.departments.length === 0) {
            const tmpDeptIds = {}
            for (const id of notComputedDept.ids) {
                tmpDeptIds[id] = 1
            }
            resultTemplate.departments.push({
                deptName: notComputedDept.deptName,
                ids: tmpDeptIds,
                users: [{userName: userName, sum: notComputedDept.sum, ids: notComputedDept.ids}]
            })
            continue
        }

        for (let i = 0; i < resultTemplate.departments.length; i++) {
            const deptOfTemplate = resultTemplate.departments[i]
            if (notComputedDept.deptName === deptOfTemplate.deptName) {
                // 部门的sum 需要汇总所有组员的不同的id
                for (const id of notComputedDept.ids) {
                    deptOfTemplate.ids[id] = 1
                }
                deptOfTemplate.users.push({
                    userName: userName,
                    sum: notComputedDept.sum,
                    ids: notComputedDept.ids
                })
                resultTemplate.departments[i] = deptOfTemplate
                break
            } else if (i === resultTemplate.departments.length - 1) {
                const tmpDeptIds = {}
                for (const id of notComputedDept.ids) {
                    tmpDeptIds[id] = 1
                }
                resultTemplate.departments.push({
                    deptName: notComputedDept.deptName,
                    ids: tmpDeptIds,
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
        throw new NotFoundError(`未找到部门：${deptId}的信息`)
    }

    let resultTemplate = {sum: 0, ids: {}, departments: []}
    const usersOfDepartment = departmentService.simplifiedUsersOfDepartment(requiredDepartment)
    const users = usersOfDepartment.deptUsers

    if (!users || users.length === 0) {
        return resultTemplate
    }

    for (const user of users) {
        // 获取本人参与的流程并按流程发起人所在的组进行分类
        const sumByOriginatorDepartment = await funOfTodaySelfStatistic(user.userid, status, importance)
        // 在部门分组统计的数据中，进一步汇总到参与的个人
        resultTemplate = convertSelfStatisticToDept(sumByOriginatorDepartment, user.name, resultTemplate)
    }

    // 根据departments 下的ids和resultTemplate的ids 分别算出对应的sum
    const idArr = Object.keys(resultTemplate.ids)
    return {
        ids: idArr,
        sum: idArr.length,
        departments: resultTemplate.departments.map(item => {
            return {
                deptName: item.deptName,
                sum: Object.keys(item.ids).length,
                users: item.users,
                ids: Object.keys(item.ids)
            }
        })
    }
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
 * 获取所有的流程数据
 * @returns {Promise<*>}
 */
const getAllFlows = async () => {
    const allFlows = await flowRepo.getAllProcesses()
    return allFlows
}

const updateFlow = async (flow) => {
    const result = await flowRepo.updateProcess(flow)
    return result
}

/**
 * 同步missing的历史已完成的流程
 * @returns {Promise<void>}
 */
const syncMissingCompletedFlows = async () => {
    const pullTimeRange = []
    // 获取拉取钉钉完成流程的起始时间（异常情况下，当天更新失败，可能下次会拉取多天的）
    const latestProcess = await processService.getLatestModifiedProcess()
    if (latestProcess) {
        // 钉钉返回的时间精确到分钟，同一分钟内可能会有入库失败的情况，
        // 需要把这一分钟内的流程也筛出来，过滤掉
        const {doneTime} = latestProcess
        pullTimeRange.push(dateUtil.format2Str(doneTime, "YYYY-MM-DD"))
    }
    // 还没有历史数据，需要拉取全部的已完成的流程
    else {
        pullTimeRange.push(dateUtil.dateOfEarliest())
    }
    // 截止的日期取不到数据，所以用 -1
    pullTimeRange.push(dateUtil.dateEndOffToday(0, "YYYY-MM-DD"))

    // 获取指定范围时间范围内的流程
    const finishedFlows = await dingDingService.getFinishedFlows(pullTimeRange)
    let syncCount = 0
    for (const flow of finishedFlows) {
        // 同一天的完工流程可以存在失败的情况 已经入库
        if (dateUtil.formatGMT2Str(flow.modifiedTimeGMT, "YYYY-MM-DD") === pullTimeRange[0].toString()) {
            const savedFlow = await processService.getProcessByProcessInstanceId(flow.processInstanceId)
            if (savedFlow) {
                continue
            }
        }
        syncCount = syncCount + 1
        // 同步到数据库
        try {
            await processService.saveProcess(flow)
        } catch (e) {
            // 重复的数据异常直接忽略
            if (e.original.code !== "ER_DUP_ENTRY") {
                throw e
            }
        }
    }
}

/**
 * 获取指定状态的表单流程filed的值
 * @param formId
 * @param linkIdKeyInFightingFlowForm
 * @returns {Promise<*[]>}
 */
const getFlowFormValues = async (formId, fieldKey, flowStatus) => {
    let fightingLinkIds = []
    const flows = await getTodayFlowsByFormIdAndFlowStatus(formId, flowStatus)
    for (const flow of flows) {
        if (!flow.data) {
            continue
        }
        const runningLinkId = flow.data[fieldKey]
        if (runningLinkId) {
            if (runningLinkId.trim().includes(" ")) {
                fightingLinkIds = fightingLinkIds.concat(runningLinkId.split(/\s+/))
            } else {
                fightingLinkIds.push(runningLinkId)
            }
        }
    }
    return fightingLinkIds
}

const updateRunningFlowEmergency = async (ids, emergency) => {
    const todayFlows = await globalGetter.getTodayFlows()
    const newTodayFlows = todayFlows.map(flow => {
        if (ids.includes(flow.processInstanceId)) {
            return {...flow, emergency}
        }
        return flow
    })

    await redisRepo.setTodayFlows(newTodayFlows)
    globalSetter.setGlobalTodayRunningAndFinishedFlows(newTodayFlows)
}

/**
 * 获取表单流程中核心动作汇总数据（人->逾期->动作）
 * @param deptId
 * @param userNames
 * @param startDoneDate
 * @param endDoneDate
 * @returns {Promise<*[]>}
 */
const getCoreActionData = async (deptId, userNames, startDoneDate, endDoneDate) => {
    const computedFlows = await getFlowsByDoneTimeRange(startDoneDate, endDoneDate, null)
    const coreActionConfig = await flowRepo.getCoreActionsConfig(deptId)
    const result = await departmentCoreActivityStat.get(userNames, computedFlows, coreActionConfig)
    return flowUtil.attachIdsAndSum(result)
}

/**
 * 统计部门的核心流程指定节点的数据
 * @param deptId
 * @param userId
 * @param startDoneDate
 * @param endDoneDate
 * @returns {Promise<*>}
 */
const getCoreFlowData = async (deptId, userNames, startDoneDate, endDoneDate) => {
    // 根据时间获取需要统计的流程数据（今天+历史）
    const deptCoreForms = await flowRepo.getCoreFormFlowConfig(deptId)
    const deptCoreFormIds = deptCoreForms.map(item => item.formId)
    let deptFormsStat = await getUserFlowsStat(userNames, startDoneDate, endDoneDate, deptCoreFormIds)
    return flowUtil.attachIdsAndSum(deptFormsStat)
    // const validDeptFormsStat = []
    // 部门的统计走表单全节点的统计：去掉多余的（数据为0）节点
    // for (const formStat of deptFormsStat) {
    //     const validFormStat = {formName: formStat.formName, formId: formStat.formId, children: []}
    //     for (const activityStat of formStat.children) {
    //         if (activityStat.sum && activityStat.sum > 0) {
    //             validFormStat.children.push(activityStat)
    //         }
    //     }
    //     validDeptFormsStat.push(validFormStat)
    // }
    // return deptFormsStat
}

/**
 * 根据完成时间获取流程数据
 *
 * 历史数据转成Redis中的格式统一处理
 * @param startDoneDate
 * @param endDoneDate
 * @param formIds
 * @returns {Promise<*[]>}
 */
const getFlowsByDoneTimeRange = async (startDoneDate, endDoneDate, formIds) => {

    if ((startDoneDate || endDoneDate) && !(startDoneDate && endDoneDate)) {
        throw new ParameterError("时间区间不完整")
    }

    let flows = []
    // 获取时间区间内的入库流程
    if (startDoneDate && endDoneDate) {
        if (dateUtil.duration(endDoneDate, startDoneDate) < 0) {
            throw new ParameterError("结束日期不能小于开始日期")
        }
        const processDataReviewItem = await Promise.all([
            flowRepo.getProcessDataByReviewItemDoneTime(
                dateUtil.startOfDay(startDoneDate),
                dateUtil.endOfDay(endDoneDate),
                formIds
            ),
            flowRepo.getProcessWithReviewByReviewItemDoneTime(
                dateUtil.startOfDay(startDoneDate),
                dateUtil.endOfDay(endDoneDate),
                formIds
            )
        ])

        flows = processDataReviewItem[1]
        // 合并流程的data和审核流信息
        for (let i = 0; i < flows.length; i++) {
            const currData = {}
            for (const item of processDataReviewItem[0][i].data) {
                const fieldValue = item.fieldValue
                if (fieldValue.startsWith("[") && fieldValue.endsWith("]")) {
                    currData[item.fieldId] = JSON.parse(fieldValue)
                } else {
                    currData[item.fieldId] = fieldValue
                }
            }
            flows[i].data = currData
        }
    }

    let todayFlows = await globalGetter.getTodayFlows()
    if (formIds && formIds.length > 0) {
        todayFlows = todayFlows.filter(flow => formIds.includes(flow.formUuid))
    }

    flows = flows.concat(todayFlows.map(flow => {
        // 返回新的Flow, 防止修改内存中的数据结构
        return {...flow}
    }))

    return flows
}

const removeUnmatchedDateActivities = (flows, startDoneDate, endDoneDate) => {
    // 根据时间区间过滤掉不在区间内的完成节点，todo和forcast的数据不用处理
    for (const flow of flows) {
        if (!flow.overallprocessflow) {
            continue
        }

        const newOverallProcessFlow = []
        for (const item of flow.overallprocessflow) {
            if (item.type === flowReviewTypeConst.TODO || item.type === flowReviewTypeConst.FORCAST) {
                newOverallProcessFlow.push(item)
                continue
            }
            if (startDoneDate && endDoneDate && item.type === flowReviewTypeConst.HISTORY) {
                let doneTime = item.doneTime
                if (!doneTime) {
                    doneTime = dateUtil.formatGMT2Str(item.operateTimeGMT)
                }
                if (dateUtil.duration(doneTime, dateUtil.startOfDay(startDoneDate)) >= 0 && dateUtil.duration(dateUtil.endOfDay(endDoneDate), doneTime) >= 0) {
                    newOverallProcessFlow.push(item)
                    continue
                }
            }
        }
        flow.overallprocessflow = newOverallProcessFlow
    }
    return flows
}

const getCoreActionsConfig = async (deptId) => {
    const coreActionsConfig = await flowRepo.getCoreActionsConfig(deptId)
    return coreActionsConfig
}
const getCoreFormFlowConfig = async (deptId) => {
    const coreFormFlowConfig = await flowRepo.getCoreFormFlowConfig(deptId)
    return coreFormFlowConfig
}

const getAllOverDueRunningFlows = async () => {
    const allFlows = await globalGetter.getTodayFlows()
    const doingFlows = allFlows.filter(flow => flow.instanceStatus === flowStatusConst.RUNNING)

    const overDueFlows = []
    for (const flow of doingFlows) {
        if (!flow.overallprocessflow) {
            continue
        }
        flow.overDueReviewItems = flow.overallprocessflow.filter(item => item.type === flowReviewTypeConst.TODO && item.isOverDue)
        // 添加当前操作人所在的部门
        for (const reviewItem of flow.overDueReviewItems) {
            const userDepartments = await departmentService.getDepartmentOfUser(reviewItem.operatorUserId)
            if (userDepartments.length > 0) {
                reviewItem.department = userDepartments[userDepartments.length - 1].dep_detail.name
            }
        }
        if (flow.overDueReviewItems.length > 0) {
            overDueFlows.push(flow)
        }
    }
    return overDueFlows
}

const getUserFlowsStat = async (userNames, startDoneDate, endDoneDate, formIds) => {
    let flows = await getFlowsByDoneTimeRange(startDoneDate, endDoneDate, formIds)
    flows = removeUnmatchedDateActivities(flows, startDoneDate, endDoneDate)
    const formsWithReview = await flowFormRepo.getAllFlowFormsWithReviews(formIds)
    const result = await userFlowStat.get(userNames, flows, formsWithReview)
    for (const formStat of result) {
        for (const activityStat of formStat.children) {
            const activityOverdue = {
                name: "逾期", type: "OVERDUE", excludeUpSum: true, children: [
                    {name: "进行中", type: "TODO", sum: 0, ids: [], children: []},
                    {name: "已完成", type: "HISTORY", sum: 0, ids: [], children: []}
                ]
            }
            for (const statusStat of activityStat.children) {
                if (statusStat.type === flowReviewTypeConst.FORCAST) {
                    continue
                }

                // 对进行中和已完成的状态进行处理
                // 对应状态的逾期
                const activityOverdueStat = activityOverdue.children.filter(item => item.type === statusStat.type)[0]
                // 将进行中或已完成中的逾期搬移到逾期
                activityOverdueStat.children = statusStat.children[1].children

                // 将进行中或已完成状态下的逾期和未逾期数据合并
                statusStat.children = statusStat.children[0].children.concat(statusStat.children[1].children)
                // 合并节点下逾期和未逾期数据：人名去重
                const uniqueStateStat = {}
                for (const item of statusStat.children) {
                    if (!Object.keys(uniqueStateStat).includes(item.userName)) {
                        uniqueStateStat[item.userName] = {}
                    }
                    uniqueStateStat[item.userName].ids = (uniqueStateStat[item.userName].ids || []).concat(item.ids)
                    uniqueStateStat[item.userName].sum = uniqueStateStat[item.userName].ids.length
                }
                statusStat.children = []
                for (const key of Object.keys(uniqueStateStat)) {
                    statusStat.children.push({
                        userName: key,
                        ids: uniqueStateStat[key].ids,
                        sum: uniqueStateStat[key].ids.length
                    })
                }
            }
            activityStat.children.push(activityOverdue)
        }
    }
    return result
}


const overdueAloneStatusStructure = [
    {name: "待转入", type: flowReviewTypeConst.FORCAST, excludeUpSum: true, children: []},
    {
        name: "进行中",
        type: flowReviewTypeConst.TODO,
        children: []
    },
    {
        name: "已完成", type: flowReviewTypeConst.HISTORY,
        children: []
    },
    {
        name: "已逾期", type: "OVERDUE", excludeUpSum: true, children: [
            {
                name: "进行中",
                type: flowReviewTypeConst.TODO,
                children: []
            },
            {
                name: "已完成", type: flowReviewTypeConst.HISTORY,
                children: []
            }]
    }
]

/**
 * 获取全流程数据
 *
 * @param startDoneDate
 * @param endDoneDate
 * @param formIds
 * @returns {Promise<{activityStat: *, deptStat: *, users: *}>}
 */
const getFormsFlowsActivitiesStat = async (startDoneDate, endDoneDate, formIds) => {
    const originResult = await getUserFlowsStat(null, startDoneDate, endDoneDate, formIds)
    // 获取用户的部门信息，用于前端将人汇总都部门下
    let allUsersWithDepartment = await redisRepo.getAllUsersDetail()
    // 过滤不必要的信息
    const pureUsersWithDepartment = allUsersWithDepartment.map(user => {
        const pureUser = {
            userId: user.userid,
            userName: user.name
        }
        if (user.multiDeptStat) {
            pureUser.departments = user.leader_in_dept.map(dept => {
                return {deptId: dept.dept_id, deptName: dept.dep_detail.name, statForms: dept.statForms}
            })
        } else {
            pureUser.departments = [
                {
                    deptId: user.leader_in_dept[0].dept_id,
                    deptName: user.leader_in_dept[0].dep_detail.name
                }
            ]
        }

        return pureUser
    })

    // 转化成按部门统计的结构数据
    const formsDepsStatResult = []
    for (const originFormResult of originResult) {
        const newFormResult = {formId: originFormResult.formId, formName: originFormResult.formName, children: []}
        for (const originActivityResult of originFormResult.children) {
            // 找到当前节点最底下的人所在的部门
            // - 将状态下对从人的角度的统计 => 拉出人的统计加上状态信息
            const originOperatorsResult = []
            for (const originStatusResult of originActivityResult.children) {
                const tmpTypes = [originStatusResult.type]

                // 为了通过人计算部门的统计便利和结合状态抓取在新结构中需要被统计到哪个节点的便利，
                // 将activity下状态-人的信息进行扁平处理，转成{userName: "", ids:[], sum:0, types:[]}
                //    - types:逾期被单独统计的，又分为进行中和已完成逾期，这种情况下types-["overdue", "running"]
                //    - 若是进行中， 则types-[running]
                for (const originMaybeOperatorResult of originStatusResult.children) {
                    if (originMaybeOperatorResult.children) {
                        for (const operatorResult of originMaybeOperatorResult.children) {
                            const newTypes = _.cloneDeep(tmpTypes)
                            newTypes.push(originMaybeOperatorResult.type)
                            originOperatorsResult.push({
                                types: newTypes,
                                ...operatorResult
                            })
                        }
                    } else {
                        originOperatorsResult.push({
                            types: tmpTypes,
                            ...originMaybeOperatorResult
                        })
                    }
                }
            }

            // 根据上面对人和状态的转换数据，转成人所在部门的统计
            for (const originOperatorResult of originOperatorsResult) {

                // 多部门的情况下： 按流程表单汇总不同的部门
                // 根据配置中汇总部门需要统计的流程，将结果拆分进行统计
                let userDepName = "未知"
                const tmpUser = pureUsersWithDepartment.filter(user => user.userName === originOperatorResult.userName)
                const currUser = tmpUser[0]
                if (currUser.multiDeptStat) {
                    // 找到当前表单需要被统计到的部门
                    const tmpDeps = currUser.departments.filter(dept => dept.statForms.includes(originFormResult.formId))
                    if (tmpDeps.length > 0) {
                        userDepName = tmpDeps[0].deptName
                    }
                } else {
                    userDepName = currUser.departments[0].deptName
                }

                // 1. 从最终的结果中找到该用户所在的部门节点，没有的话则添加
                let deptResult = null
                const tmpDepartmentsResult = newFormResult.children.filter(depResult => depResult.deptName === userDepName)
                if (tmpDepartmentsResult.length === 0) {
                    newFormResult.children.push({
                        deptName: userDepName,
                        children: _.cloneDeep(overdueAloneStatusStructure)
                    })
                    deptResult = newFormResult.children[newFormResult.children.length - 1]
                } else {
                    deptResult = tmpDepartmentsResult[0]
                }

                // 2. 找到新的部门结构中对应的 statusResult
                let deptStatusResult = deptResult.children.filter(item => item.type === originOperatorResult.types[0])[0]
                if (originOperatorResult.types.length > 1) {
                    deptStatusResult = deptStatusResult.children.filter(item => item.type === originOperatorResult.types[1])[0]
                }

                // 3. 从上一步的 statusResult 中找到进一步要被统计到的工作节点
                let activityResult = null
                const tmpActivityResults = deptStatusResult.children.filter(item => item.activityName === originActivityResult.activityName)
                if (tmpActivityResults.length === 0) {
                    deptStatusResult.children.push({activityName: originActivityResult.activityName, children: []})
                    activityResult = deptStatusResult.children[deptStatusResult.children.length - 1]
                } else {
                    activityResult = tmpActivityResults[0]
                }

                // 4. 将原来对人的共计数据，转移到新的节点上
                activityResult.children.push({
                    userName: originOperatorResult.userName,
                    ids: originOperatorResult.ids,
                    sum: originOperatorResult.sum
                })

            }
        }
        newFormResult.flowsStat = originFormResult.flowsStat
        formsDepsStatResult.push(newFormResult)
    }

    const activityStatResult = flowUtil.attachIdsAndSum(originResult)
    const deptStatResult = flowUtil.attachIdsAndSum(formsDepsStatResult)
    return {activityStat: activityStatResult, deptStat: deptStatResult, users: pureUsersWithDepartment}
}

// const getDepartmentsOverallFlowsStat = async (startDoneDate, endDoneDate, formIds, departmentIds) => {
//     const forms = await flowFormRepo.getAllFlowFormsWithReviews(formIds)
//     const flows = await getFlowsByDoneTimeRange(startDoneDate, endDoneDate, formIds)
//     const result = await departmentsOverallFlowsStat.get(departmentIds, flows, forms)
//     return flowUtil.attachIdsAndSum(result)
// }

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
    getAllFlows,
    updateFlow,
    getTodayFlowsByFormIdAndFlowStatus,
    syncMissingCompletedFlows,
    getFlowFormValues,
    updateRunningFlowEmergency,
    getCoreActionData,
    getCoreFlowData,
    getCoreActionsConfig,
    getCoreFormFlowConfig,
    getFormsFlowsActivitiesStat,
    getAllOverDueRunningFlows,
    // getDepartmentsOverallFlowsStat,
    removeUnmatchedDateActivities
}