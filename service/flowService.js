const _ = require("lodash")
const FlowForm = require("../model/flowfrom")
const flowRepo = require("../repository/flowRepo")
const flowFormRepo = require("../repository/flowFormRepo")
const userRepo = require("../repository/userRepo")
const departmentRepo = require("../repository/departmentRepo")
const departmentFlowFormRepo = require("../repository/departmentFlowFormRepo")
const formService = require("../service/flowFormService")
const departmentService = require("../service/departmentService")
const dingDingService = require("../service/dingDingService")
const processService = require("../service/processService")
const redisRepo = require("../repository/redisRepo")
const globalGetter = require("../global/getter")
const globalSetter = require("../global/setter")
const dateUtil = require("../utils/dateUtil")
const flowUtil = require("../utils/flowUtil")
const flowFormReviewUtil = require("../utils/flowFormReviewUtil")
const NotFoundError = require("../error/http/notFoundError")
const ParameterError = require("../error/parameterError")
const departmentCoreActivityStat = require("../core/statistic/departmentCoreActivityStat")
const userFlowStat = require("../core/statistic/userFlowsStat")
const {flowReviewTypeConst, flowStatusConst} = require("../const/flowConst")
const noRequiredStatActivityConst = require("../const/tmp/noRequiredStatActivityConst")
const whiteList = require("../config/whiteList")
const extensionsConst = require("../const/tmp/extensionsConst")
const deptHiddenFormsConst = require("../const/tmp/deptHiddenFormsConst")
const deptFlowFormConst = require("../const/deptFlowFormConst")
const {opFunctions} = require("../const/operatorConst");

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

        if (topDepartments.length > 0) {
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
        } else {
            departmentNames = departmentsOfUser.map(dept => dept.dep_detail.name).join(",")
        }
        if (departmentNames.startsWith(",")) {
            flow.deptName = departmentNames.substring(1)
        } else {
            flow.deptName = departmentNames
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
                    userName: userName, sum: notComputedDept.sum, ids: notComputedDept.ids
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
        ids: idArr, sum: idArr.length, departments: resultTemplate.departments.map(item => {
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
    pullTimeRange.push(dateUtil.dateEndOffToday(-1, "YYYY-MM-DD"))

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
const getCoreActionData = async (userId, deptId, userNames, startDoneDate, endDoneDate) => {
    const getFormIds = (actionConfig) => {
        const ids = {}
        for (const configItem of actionConfig) {
            const actionStatuses = configItem.actionStatus
            for (const actionItem of actionStatuses) {
                for (const formRule of actionItem.rules) {
                    ids[formRule.formId] = 1
                }
            }
        }
        return Object.keys(ids)
    }
    const coreActionConfig = await flowRepo.getCoreActionsConfig(deptId)
    // 筛选出参与统计的表单流程
    const formIds = getFormIds(coreActionConfig)
    const computedFlows = await getFlowsByDoneTimeRange(startDoneDate, endDoneDate, formIds)
    // todo: 视觉(482162119)和全流程的统计userNames要加上外包的信息
    //   先单独处理，要不就得把外包的人全部返回视觉的前端，可能还得改http method，
    //   等数据ok稳定后需要整理
    const user = await userRepo.getUserDetails({userId})
    const userDDId = user.dingdingUserId
    // 有条件地为userNames添加外包人信息、离职人员信息
    let canGetDeptOutSourcingUsers = false
    let canGetResignUsers = false
    if (whiteList.pepArr().includes(userDDId)) {
        canGetDeptOutSourcingUsers = true
        canGetResignUsers = true
    } else {
        const redisUsers = await redisRepo.getAllUsersDetail()
        const userTargetDeps = redisUsers.find(u => u.userid === userDDId).leader_in_dept
        const userCurrDept = userTargetDeps.find(item => item.dept_id.toString() === deptId)
        if (userCurrDept && userCurrDept.leader) {
            canGetDeptOutSourcingUsers = true
            canGetResignUsers = true
        }
    }
    if (canGetResignUsers) {
        const deptResignUsers = await userRepo.getDeptResignUsers(deptId)
        const strDeptResignUsers = deptResignUsers.map(item => `${item.nickname}[已离职]`).join(",")
        userNames = `${userNames},${strDeptResignUsers}`
    }
    if (canGetDeptOutSourcingUsers) {
        const deptOutSourcingUsers = await redisRepo.getOutSourcingUsers(deptId)
        const strDeptOutSourcingUsers = deptOutSourcingUsers.join(",")
        userNames = `${userNames},${strDeptOutSourcingUsers}`
    }

    const result = await departmentCoreActivityStat.get(userNames, computedFlows, coreActionConfig)
    // 节点汇总
    // 生成结果模板
    const getActivitySumStructure = (result) => {
        const structure = []
        // todo：good idea： 没时间实现了
        // 保留2层深度的结构信息, 将底层基于人的统计信息忽略
        for (const actStat of result) {
            for (const subActStat of actStat.children) {
                const isExist = structure.filter(item => item.nameCN === subActStat.nameCN).length > 0
                if (!isExist) {
                    for (const overDueStat of subActStat.children) {
                        overDueStat.children = []
                    }
                    structure.push(subActStat)
                }
            }
        }
        return structure
    }
    const statActivityResult = getActivitySumStructure(_.cloneDeep(result))

    // 转换统计以动作统计
    for (const actionStatResult of result) {
        const coreActionName = actionStatResult.actionName
        const subStatusActionsResult = actionStatResult.children
        for (const subActionResult of subStatusActionsResult) {
            const subOverdueActionsResult = subActionResult.children
            for (const overdueResult of subOverdueActionsResult) {
                // 获取逾期节点下所有人的汇总
                const getOverdueIds = (overdueResult) => {
                    let overdueIds = []
                    for (const userStatResult of overdueResult.children) {
                        overdueIds = overdueIds.concat(userStatResult.ids)
                    }
                    return overdueIds
                }
                const ids = getOverdueIds(overdueResult)
                const findTargetActResult = (subActStatName, overDueName) => {
                    const subActStatResult = statActivityResult.filter(item => item.nameCN === subActStatName)[0]
                    if (subActStatResult) {
                        const subActOverdueStatResult = subActStatResult.children.filter(item => item.nameCN === overDueName)[0]
                        return subActOverdueStatResult
                    }
                    return null
                }

                const targetActResult = findTargetActResult(subActionResult.nameCN, overdueResult.nameCN)
                if (targetActResult) {
                    targetActResult.children.push({actionName: coreActionName, ids: ids})
                }
            }
        }
    }

    const overdueConfig = [{nameCN: "逾期", nameEN: "overdue", children: []}, {
        nameCN: "未逾期",
        nameEN: "notOverdue",
        children: []
    }]
    const flowStatConfig = [
        {
            nameCN: "待转入", nameEN: "TODO", children: _.cloneDeep(overdueConfig)
        },
        {

            nameCN: "进行中", nameEN: "DOING", children: _.cloneDeep(overdueConfig)
        },
        {

            nameCN: "已完成", nameEN: "DONE"// , children: _.cloneDeep(overdueConfig)
        }
        // {
        //     nameCN: "逾期",
        //     nameEN: "OVERDUE",
        //     children: _.cloneDeep(overdueConfig)
        // }
    ]
    const getFlowSumStructure = (result) => {
        // 根据流程进行汇总
        const sumFlowStat = []
        for (const coreActionResult of result) {
            sumFlowStat.push({
                nameCN: coreActionResult.actionName,
                nameEN: coreActionResult.actionCode,
                children: _.cloneDeep(flowStatConfig)
            })
        }
        return sumFlowStat
    }

    // const statusShortTextMap = {"待": "TODO", "中": "DOING", "完": "DONE"}
    const statusKeyText = ["待", "中", "完"]
    const visionDoneMap = [
        //
        {
            formName: "运营新品流程",
            formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
            doneActivityIds: ["node_ockpz6phx73"]
        },
        //
        {
            formName: "运营拍摄流程",
            formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
            doneActivityIds: ["node_oclvkpzz4g1", "node_oclvkqswtb4", "node_oclvkpzz4g3", "node_oclvkqswtbc", "node_oclvkpzz4g4"]
        },
        {
            formName: "天猫链接上架流程",
            formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
            doneActivityIds: ["node_oclm91ca7l9"]
        },
        {
            formName: "运营视觉流程（拍摄+美编）",
            formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
            doneActivityIds: ["node_oclx03jr074d"]
        },
        {
            formName: "美编修图任务",
            formId: "FORM-009E1B0856894539A60F355C5CE859EDTQYC",
            doneActivityIds: ["node_oclx422jq8o"]
        },
        {
            formName: "美编任务运营发布",
            formId: "FORM-WV866IC1JU8B99PU77CDKBMZ4N5K251FLKIILS",
            doneActivityIds: [
                "node_oclvghx5li1",
                "node_oclvt49cil4",
                "node_oclw7dfsbp4",
                "node_oclvghx5li7",
                "node_oclvghx5li8",
                "node_oclw7dfsbp7",
                "node_oclvghx5li9",
                "node_oclvghx5lia",
                "node_oclwhrd6j63"
            ]
        }
    ]
    const statFlowResult = getFlowSumStructure(_.cloneDeep(result))
    for (const actionResult of statFlowResult) {
        // 找到同名的配置
        const sameNameActionConfig = coreActionConfig.filter(item => item.actionName === actionResult.nameCN)[0]
        // 从配置 coreActionConfig 中找到类似‘全套-待xxx’中的rules
        for (const statusResult of actionResult.children) {
            const keyText = statusKeyText.filter(key => statusResult.nameCN.includes(key))[0]
            // 找到具有想匹配关键词的状态节点(s)
            const sameKeyTextStatusesConfig = sameNameActionConfig.actionStatus.filter(item => item.nameCN.includes(keyText))
            // 分别根据其中的配置，统计流程并放到逾期下对应的摄影或美编节点下
            for (const statusConfig of sameKeyTextStatusesConfig) {
                // 获取需要统计到的节点名称
                const getPureActionName = (text) => {
                    const uselessKeyText = ["待", "拍", "入", "进", "行", "中", "已", "完", "成"]
                    for (const key of uselessKeyText) {
                        text = text.replace(key, "")
                    }
                    return text
                }

                const {nameCN, rules} = statusConfig
                const actionName = getPureActionName(nameCN)

                // 根据表单的统计规则，将流程统计到对应的节点下
                for (const formRule of rules) {
                    let formFlows = computedFlows.filter(flow => flow.formUuid === formRule.formId)

                    if (formRule.flowDetailsRules) {
                        for (const detailsRule of formRule.flowDetailsRules) {
                            formFlows = formFlows.filter(flow => {
                                return opFunctions[detailsRule.opCode](flow.data[detailsRule.fieldId], detailsRule.value)
                            })
                        }
                    }

                    // 将流程统计到对应结果状态中，包含逾期
                    for (const flow of formFlows) {
                        const activities = flow.overallprocessflow

                        if (keyText === "完") {
                            const visionDoneAct = visionDoneMap.find(item => item.formId === flow.formUuid)
                            const tmpVisionDoneActs = activities.filter(item => visionDoneAct.doneActivityIds.includes(item.activityId) &&
                                item.type === flowReviewTypeConst.HISTORY)
                            if (tmpVisionDoneActs.length > 0) {
                                if (!statusResult.ids) {
                                    statusResult.ids = []
                                }
                                statusResult.ids.push(flow.processInstanceId)
                                statusResult.sum = statusResult.ids.length
                            }
                            continue
                        }

                        for (let i = 0; i < formRule.flowNodeRules.length; i++) {
                            const flowNodeRule = formRule.flowNodeRules[i]
                            const {from: fromNode, to: toNode, overdue: overdueNode} = flowNodeRule
                            const fromNodeMatched = activities.filter(
                                item => item.activityId === fromNode.id &&
                                    fromNode.status.includes(item.type)).length > 0
                            const toNodeMatched = activities.filter(
                                item => item.activityId === toNode.id &&
                                    toNode.status.includes(item.type)).length > 0
                            // 对于没有逾期的结果统计直接统计到状态下
                            let needToStatResult = statusResult
                            if (overdueNode) {
                                const overdueActivity = activities.filter(
                                    item => item.activityId === overdueNode.id &&
                                        overdueNode.status.includes(item.type))
                                if (overdueActivity.length === 0) {
                                    continue
                                }
                                // 找到结果中的逾期统计节点
                                needToStatResult = statusResult.children.find(item => item.nameCN === (overdueActivity[0].isOverDue ? "逾期" : "未逾期"))
                            }

                            if (fromNodeMatched && toNodeMatched) {
                                const tmpSubActionResult = needToStatResult.children.find(item => item.nameCN === actionName)
                                if (tmpSubActionResult) {
                                    tmpSubActionResult.ids.push(flow.processInstanceId)
                                } else {
                                    needToStatResult.children.push({nameCN: actionName, ids: [flow.processInstanceId]})
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    result.unshift({actionName: "工作量汇总", actionCode: "sumActStat", children: statActivityResult})
    result.unshift({actionName: "流程汇总", actionCode: "sumFlowStat", children: statFlowResult})
    return flowUtil.statIdsAndSumFromBottom(result)
}

/**
 * 统计部门的核心流程指定节点的数据
 *
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
    let deptFormsStat = await getUserFlowsStat(userNames, startDoneDate, endDoneDate, deptCoreFormIds, deptId, null, null)
    return flowUtil.removeSumEqualZeroFormStat(flowUtil.statIdsAndSumFromBottom(deptFormsStat))
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

        // let processReviews = await processReviewRepo.getProcessReviewByDoneTimeRange(dateUtil.startOfDay(startDoneDate), dateUtil.endOfDay(endDoneDate))
        // const processInstanceIds = processReviews.map(item => item.processInstanceId)
        // let processes = await flowRepo.getAloneProcessByIds(processInstanceIds)
        // let processesDetails = await processDetailsRepo.getProcessDetailsByProcessInstanceIds(processInstanceIds)
        // for (const process of processes) {
        //     const details = processesDetails.slice(item => item.processInstanceId === process.processInstanceId)
        //     const reviews = processReviews.slice(item => item.processInstanceId === process.processInstanceId)
        //     process.data = details
        //     process.overallprocessflow = reviews
        // }

        const processDataReviewItem = await Promise.all([// 5.8s
            flowRepo.getProcessDataByReviewItemDoneTime(dateUtil.startOfDay(startDoneDate), dateUtil.endOfDay(endDoneDate), formIds), // 2.8s
            flowRepo.getProcessWithReviewByReviewItemDoneTime(dateUtil.startOfDay(startDoneDate), dateUtil.endOfDay(endDoneDate), formIds)])

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

const removeNoRequiredActivities = (flows) => {
    const activitiesName = noRequiredStatActivityConst.names
    for (const flow of flows) {
        if (!flow.overallprocessflow) {
            continue
        }

        const newOverallProcessFlow = []
        for (const item of flow.overallprocessflow) {
            if (!activitiesName.includes(item.showName)) {
                newOverallProcessFlow.push(item)
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

// 将审核节点中domainList的数据提出来
const levelUpDomainList = (flows) => {
    for (const flow of flows) {
        let newOverallProcessFlow = []
        for (const activity of flow.overallprocessflow) {
            if (activity.domainList && activity.domainList.length > 0) {
                newOverallProcessFlow = newOverallProcessFlow.concat(activity.domainList)
            } else {
                newOverallProcessFlow.push(activity)
            }
        }
        flow.overallprocessflow = newOverallProcessFlow
    }
    return flows
}

/**
 * 统计用户完成的工作量
 *
 * @param userNames 为空时，统计所有用户的工作量
 * @param userNames
 * @param startDoneDate
 * @param endDoneDate
 * @param formIds
 * @param deptId 针对部门的统计
 * @param setActivitiesIgnoreStatFunc 设置对流程中的节点不进行统计
 * @returns {Promise<*[]>}
 */
const getUserFlowsStat = async (userNames, startDoneDate, endDoneDate, formIds, deptId, handleOutSourcingActivityFunc, setActivitiesIgnoreStatFunc) => {
    const originFlows = await getFlowsByDoneTimeRange(startDoneDate, endDoneDate, formIds)

    let modifiedFlows = _.cloneDeep(originFlows)
    // 排除完成节点不在时间区间中的节点: 对待转入的统计没影响
    modifiedFlows = removeUnmatchedDateActivities(modifiedFlows, startDoneDate, endDoneDate)
    // 排除不需要统计的节点: 对待转入的统计没影响
    modifiedFlows = removeNoRequiredActivities(modifiedFlows)
    modifiedFlows = handleOutSourcingActivityFunc && handleOutSourcingActivityFunc(modifiedFlows) //cloneAssignToOutSourcingNode(modifiedFlows)
    modifiedFlows = setActivitiesIgnoreStatFunc && setActivitiesIgnoreStatFunc(modifiedFlows)
    modifiedFlows = levelUpDomainList(modifiedFlows)

    // 对于视觉部(482162119)和管理中台(902643613)，将外包人的名字添加到userNames中
    if (deptId && ["902643613", "482162119"].includes(deptId.toString())) {
        const getVisionOutSourcingNames = (flows) => {
            const outSourcingForms = [{
                formId: "FORM-30500E23B9C44712A5EBBC5622D3D1C4TL18",
                formName: "外包拍摄视觉流程",
                outSourceChargerFieldId: "textField_lvumnj2k"
            }, {
                formId: "FORM-4D592E41E1C744A3BCD70DB5AC228B01V8GV",
                formName: "外包修图视觉流程",
                outSourceChargerFieldId: "textField_lx48e5gk"
            }]

            const outSourcingUsers = {}
            for (const flow of flows) {
                const outSourcingFormIds = outSourcingForms.map(item => item.formId)
                if (outSourcingFormIds.includes(flow.formUuid)) {
                    const {outSourceChargerFieldId} = outSourcingForms.filter(item => item.formId === flow.formUuid)[0]

                    const username = flowFormReviewUtil.getFieldValue(outSourceChargerFieldId, flow.data)
                    if (username) {
                        outSourcingUsers[username] = 1
                    }
                }
            }
            return Object.keys(outSourcingUsers)
        }
        const outVisionSourcingUsers = getVisionOutSourcingNames(modifiedFlows)
        for (const outSourcingUser of outVisionSourcingUsers) {
            // 将视觉外包人的信息同步到Redis，便于后面转成部门统计
            await redisRepo.setOutSourcingUser("482162119", outSourcingUser)
        }
        userNames = userNames && `${userNames},${outVisionSourcingUsers.join(",")}`
    }

    // 获取表单的最新的审核流
    const formsWithReview = await flowFormRepo.getAllFlowFormsWithReviews(formIds)
    // 统计流程数据
    const formResult = await userFlowStat.get(userNames, modifiedFlows, formsWithReview)

    // 将result中进行中和已完成的逾期单独提取出来
    for (const formStat of formResult) {
        for (const activityStat of formStat.children) {
            const activityOverdue = {
                name: "逾期",
                type: "OVERDUE",
                excludeUpSum: true,
                children: [{name: "进行中", type: "TODO", sum: 0, ids: [], children: []}, {
                    name: "已完成",
                    type: "HISTORY",
                    sum: 0,
                    ids: [],
                    children: []
                }]
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
                        userName: key, ids: uniqueStateStat[key].ids, sum: uniqueStateStat[key].ids.length
                    })
                }
            }
            activityStat.children.push(activityOverdue)
        }
    }

    // 根据节点状态对流程进行统计
    for (const formStat of formResult) {
        // 统计流程状态的模版
        const flowStatusStatResult = [{
            status: flowStatusConst.RUNNING,
            name: "进行中",
            sum: 0,
            ids: []
        }, {status: flowStatusConst.COMPLETE, name: "已完成", sum: 0, ids: []}, {
            status: flowStatusConst.TERMINATED,
            name: "终止",
            sum: 0,
            ids: []
        }, {status: flowStatusConst.ERROR, name: "异常", sum: 0, ids: []}, {
            status: flowStatusConst.OVERDUE,
            name: "逾期",
            sum: 0,
            ids: []
        }]
        const statProcessToStatusResult = (processInstanceId, status, formStatusResult) => {
            const tmpStatusResult = formStatusResult.filter(statusResult => statusResult.status === status)[0]
            tmpStatusResult.ids.push(processInstanceId)
            tmpStatusResult.sum = tmpStatusResult.ids.length
        }


        const loopGetIds = (statNode) => {
            let ids = []
            if (statNode.ids) {
                ids = ids.concat(statNode.ids)
            }
            if (statNode.children && statNode.children.length > 0) {
                for (const ds of statNode.children) {
                    ids = ids.concat(loopGetIds(ds))
                }
            }
            return ids
        }

        const formStatIds = loopGetIds(formStat)
        const formFlows = originFlows.filter(flow => formStatIds.includes(flow.processInstanceId))
        for (const flow of formFlows) {
            // 流程异常则算为异常
            if (flow.instanceStatus === flowStatusConst.ERROR) {
                statProcessToStatusResult(flow.processInstanceId, flowStatusConst.ERROR, flowStatusStatResult)
                continue
            }

            // 终止节点的operator在userNames中，算为终止
            if (flow.instanceStatus === flowStatusConst.TERMINATED) {
                const lastActivity = flow.overallprocessflow[flow.overallprocessflow.length - 1]
                if (!lastActivity) {
                    continue
                }
                if (!userNames || (userNames && userNames.includes(lastActivity.operatorName))) {
                    statProcessToStatusResult(flow.processInstanceId, flowStatusConst.TERMINATED, flowStatusStatResult)
                }
                continue
            }

            // 获取仅包含 userNames 的节点，为空时获取所有节点
            let activities = flow.overallprocessflow
            if (userNames) {
                activities = activities.filter(activity => userNames.includes(activity.operatorName))
            }

            // 存在进行中的节点，则算为进行中
            const doingActivities = activities.filter(activity => activity.type === flowReviewTypeConst.TODO)
            if (doingActivities.length > 0) {
                statProcessToStatusResult(flow.processInstanceId, flowStatusConst.RUNNING, flowStatusStatResult)
                continue
            }

            // 如果节点都已完成，则算为完成
            const doneActivities = activities.filter(activity => activity.type === flowReviewTypeConst.HISTORY)
            if (doneActivities.length > 0 && doneActivities.length === activities.length) {
                statProcessToStatusResult(flow.processInstanceId, flowStatusConst.COMPLETE, flowStatusStatResult)
            }

            // 逾期：操作人的节点中有逾期计为逾期
            const overdueActivities = flow.overallprocessflow.filter(activity => activity.isOverDue)
            if (overdueActivities.length > 0) {
                if (userNames) {
                    const userOverdueActivities = overdueActivities.filter(activity => userNames.includes(activity.operatorName))
                    if (userOverdueActivities.length > 0) {
                        statProcessToStatusResult(flow.processInstanceId, flowStatusConst.OVERDUE, flowStatusStatResult)
                    }
                } else {
                    statProcessToStatusResult(flow.processInstanceId, flowStatusConst.OVERDUE, flowStatusStatResult)
                }
            }
        }

        formStat.flowsStat = flowStatusStatResult
    }
    return formResult
}

const overdueAloneStatusStructure = [{
    name: "待转入",
    type: flowReviewTypeConst.FORCAST,
    excludeUpSum: true,
    children: []
}, {
    name: "进行中", type: flowReviewTypeConst.TODO, children: []
}, {
    name: "已完成", type: flowReviewTypeConst.HISTORY, children: []
}, {
    name: "已逾期", type: "OVERDUE", excludeUpSum: true, children: [{
        name: "进行中", type: flowReviewTypeConst.TODO, children: []
    }, {
        name: "已完成", type: flowReviewTypeConst.HISTORY, children: []
    }]
}]

/**
 * 获取全流程数据
 *
 * @param userId
 * @param startDoneDate
 * @param endDoneDate
 * @param formIds
 * @returns {Promise<{activityStat: *, deptStat: *, users: *}>}
 */
const getFormsFlowsActivitiesStat = async (userId, startDoneDate, endDoneDate, formIds, deptId) => {
    const userDDId = (await userRepo.getAllUsers({userId}))[0].dingdingUserId
    const isAdmin = whiteList.pepArr().includes(userDDId)
    if (!isAdmin && !deptId) {
        throw new ParameterError("参数deptId不能为空")
    }

    let userNames = ""
    if (deptId) {
        // 根据userId的身份获取其下的用户(s)
        const realUsers = await userRepo.getDepartmentUsers(userDDId, deptId)
        // 获取部门下离职的人员信息
        const deptUsers = await departmentRepo.getDbDeptUsers(deptId)
        const resignUserNames = deptUsers.filter(item => item.isResign).map(item => `${item.nickname}[已离职]`)
        // todo: 6.6 人员信息已开启定时入库，让流程先跑一段时间，后面针对管理员的情况，从库中拉取全部人就行，不用下面这么诡异了
        // 管理员权限下，若是通过获取已经入库的所有人员，可能会有人员不全的情况（前期未及时入库）
        // 如果使用空值表示获取所有人，会跟通过deptId获取人员为空时相冲突
        // 所以在部门的情况下，在为查询到人员的情况下，使用一个特殊人名加以区分
        userNames = realUsers.map(user => user.userName).concat(resignUserNames).join(",")
        if (!userNames && !isAdmin) {
            userNames = "就是让你找不到"
        }
    }

    const pureUsersWithDepartment = await redisRepo.getAllUsersWithKeyFields()
    const originResult = await getUserFlowsStat(userNames, startDoneDate, endDoneDate, formIds, deptId, // 对执行中台分配外包的流程分情况进行处理
        // 1.全流程deptId=""，进行节点clone
        // 2.执行中台本部门deptId="902515853"或者其他部门,不需要改变
        // 3.视觉部deptId="482162119", 需要进行替换
        (flows) => {

            const assignerIds = ["281338354935548795", "01622516570029465425"]

            // 替换赵天鹏或者王耀庆为外包人的信息
            const outSourcingPhotography = {
                formId: "FORM-30500E23B9C44712A5EBBC5622D3D1C4TL18",
                formName: "外包拍摄视觉流程",
                outSourceChargerFieldId: "textField_lvumnj2k"
            }
            // 执行中台需要看到他们自己的工作，其他部门或者全流程都算视觉-外包美编的
            if (deptId && deptId.toString() !== "902515853") {
                const outSourcingPhotographyFlows = flows.filter(flow => flow.formUuid === outSourcingPhotography.formId)
                for (const flow of outSourcingPhotographyFlows) {
                    const fieldValue = flowFormReviewUtil.getFieldValue(outSourcingPhotographyFlows.outSourceChargerFieldId, flow.data)
                    const assignerActivities = flow.overallprocessflow.filter(activity => assignerIds.includes(activity.operatorUserId))
                    // note：拆节点时需要再处理
                    for (const activity of assignerActivities) {
                        activity.operatorName = fieldValue
                        activity.operatorDisplayName = fieldValue
                        activity.operatorUserId = ""
                    }
                }
            }

            // 替换最后一个节点为外包人的信息
            const outSourcingEditPicture = {
                formId: "FORM-4D592E41E1C744A3BCD70DB5AC228B01V8GV",
                formName: "外包修图视觉流程",
                outSourceChargerFieldId: "textField_lx48e5gk"
            }
            const outSourcingEditPictureFlows = flows.filter(flow => flow.formUuid === outSourcingEditPicture.formId)
            for (const flow of outSourcingEditPictureFlows) {
                if (flow.overallprocessflow && flow.overallprocessflow.length > 0) {
                    const fieldValue = flowFormReviewUtil.getFieldValue(outSourcingEditPicture.outSourceChargerFieldId, flow.data)
                    const lastActivity = flow.overallprocessflow[flow.overallprocessflow.length - 1]
                    lastActivity.operatorName = fieldValue
                    lastActivity.operatorDisplayName = fieldValue
                    lastActivity.operatorUserId = ""
                }
            }
            return flows
        }, (flows) => {
            // 人员跨部门的情况下，在指定部门下统计指定的表单，管理中台全流程忽略
            // 针对部门的统计，存在人员跨部门，需要根据forms分别统计
            if (deptId) {
                const multiDeptUserIds = pureUsersWithDepartment.filter(user => userNames.includes(user.userName) && user.multiDeptStat).map(user => user.userId)
                for (const flow of flows) {
                    // 过滤掉不必要的流程
                    const multiDeptUserActivities = flow.overallprocessflow.filter(activity => multiDeptUserIds.includes(activity.operatorUserId))
                    for (const activity of multiDeptUserActivities) {
                        // 用户多部门的配置信息
                        const userDepsExtensions = extensionsConst.getUserDepsExtensions(activity.operatorUserId)
                        // 配置中部门统计的form跟当前的deptId部门参数不匹配时，过滤掉
                        for (const deptExt of userDepsExtensions) {
                            const isFormInStatForms = deptExt.statForms.filter(form => form.formId === flow.formUuid).length > 0
                            // 跨部门人配置中该流程所在的form不在当前部门，为该节点添加ignoreStat标记
                            if (isFormInStatForms && deptExt.deptId.toString() !== deptId.toString()) {
                                const currActivity = flow.overallprocessflow.filter(item => item.activityId === activity.activityId)[0]
                                currActivity.ignoreStat = true
                            }
                        }
                    }
                }
            }
            return flows
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
                                types: newTypes, ...operatorResult
                            })
                        }
                    } else {
                        originOperatorsResult.push({
                            types: tmpTypes, ...originMaybeOperatorResult
                        })
                    }
                }
            }

            // 根据上面对人和状态的转换数据，转成人所在部门的统计
            for (const originOperatorResult of originOperatorsResult) {
                let userDepName = "未知"
                // 外包人员汇总部门
                const visionOutSourcingUsers = await redisRepo.getOutSourcingUsers("482162119")
                if (visionOutSourcingUsers.includes(originOperatorResult.userName)) {
                    userDepName = "视觉部"
                } else {
                    // 多部门的情况下： 按流程表单汇总不同的部门
                    // 根据配置中汇总部门需要统计的流程，将结果拆分进行统计
                    const currUser = pureUsersWithDepartment.filter(user => user.userName === originOperatorResult.userName)[0]
                    // 查找用户在该form(跨部门)和部门(可为空)下需要被统计到的部门名称
                    const findUserStatDeptName = (user, formId, deptId) => {
                        let userDepName = "未知"
                        if (!user) {
                            return userDepName
                        }
                        // 部门模块数据
                        if (deptId) {
                            const tmpUserDept = user.departments.filter(dept => dept.deptId.toString() === deptId.toString())
                            if (tmpUserDept.length > 0) {
                                userDepName = tmpUserDept[0].deptName
                            }

                        }
                        // 管理中台的全流程
                        else {
                            if (user.multiDeptStat) {
                                // 找到当前表单需要被统计到的部门
                                const tmpDeps = user.departments.filter(dept => {
                                    return dept.statForms && dept.statForms.filter(item => item.formId === formId).length > 0
                                })
                                if (tmpDeps.length > 0) {
                                    userDepName = tmpDeps[0].deptName
                                } else {
                                    userDepName = user.departments[0].deptName
                                }
                            } else {
                                userDepName = user.departments[0].deptName
                            }
                        }
                        return userDepName
                    }
                    userDepName = findUserStatDeptName(currUser, originFormResult.formId, deptId)
                }

                // 1. 从最终的结果中找到该用户所在的部门节点，没有的话则添加
                let deptResult = null
                const tmpDepartmentsResult = newFormResult.children.filter(depResult => depResult.deptName === userDepName)
                if (tmpDepartmentsResult.length === 0) {
                    newFormResult.children.push({
                        deptName: userDepName, children: _.cloneDeep(overdueAloneStatusStructure)
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

                // 4. 将原来对人的统计数据，转移到新的节点上
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

    let activityStatResult = flowUtil.removeSumEqualZeroFormStat(flowUtil.statIdsAndSumFromBottom(originResult))
    let deptStatResult = flowUtil.removeSumEqualZeroFormStat(flowUtil.statIdsAndSumFromBottom(formsDepsStatResult))

    // 根据配置过滤部门要隐藏的表单统计
    if (deptId) {
        const tmpDeps = deptHiddenFormsConst.filter(item => item.deptId.toString() === deptId.toString())
        if (tmpDeps.length > 0) {
            const deptHiddenFormIds = tmpDeps[0].forms.map(item => item.formId)
            activityStatResult = activityStatResult.filter(item => !deptHiddenFormIds.includes(item.formId))
            deptStatResult = deptStatResult.filter(item => !deptHiddenFormIds.includes(item.formId))
        }
    }
    // 根据流程配置的是否核心进行排序
    let deptCoreForms = []
    if (deptId) {
        deptCoreForms = await departmentFlowFormRepo.getDepartmentFlowForms({
            deptId, type: deptFlowFormConst.deptFlowFormCore
        })
    } else {
        deptCoreForms = await flowFormRepo.getAllForms({status: "1"})
    }

    let orderedActivityStatResult = []
    let orderedDeptStatResult = []
    for (const deptCoreFlow of deptCoreForms) {
        const tmpActivityStatResult = activityStatResult.find(item => item.formId === deptCoreFlow.flowFormId)
        if (tmpActivityStatResult) {
            orderedActivityStatResult.push(tmpActivityStatResult)
            const index = activityStatResult.findIndex(item => item.formId === deptCoreFlow.flowFormId)
            activityStatResult.splice(index, 1)
        }
        const tmpDeptStatResult = deptStatResult.find(item => item.formId === deptCoreFlow.flowFormId)
        if (tmpDeptStatResult) {
            orderedDeptStatResult.push(tmpDeptStatResult)
            const index = deptStatResult.findIndex(item => item.formId === deptCoreFlow.flowFormId)
            deptStatResult.splice(index, 1)
        }
    }
    orderedActivityStatResult = orderedActivityStatResult.concat(activityStatResult)
    orderedDeptStatResult = orderedDeptStatResult.concat(deptStatResult)


    return {activityStat: orderedActivityStatResult, deptStat: orderedDeptStatResult, users: pureUsersWithDepartment}
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
    removeUnmatchedDateActivities
}