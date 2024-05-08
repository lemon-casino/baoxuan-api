const FlowForm = require("../model/flowfrom")
const flowRepo = require("../repository/flowRepo")
const formReviewRepo = require("../repository/formReviewRepo")
const formService = require("../service/flowFormService")
const departmentService = require("../service/departmentService")
const dingDingService = require("../service/dingDingService")
const processService = require("../service/processService")
const redisService = require("../service/redisService")
const globalGetter = require("../global/getter")
const globalSetter = require("../global/setter")
const dateUtil = require("../utils/dateUtil")
const flowUtil = require("../utils/flowUtil")
const flowFormReviewUtil = require("../utils/flowFormReviewUtil")
const formFlowIdMappings = require("../const/formFlowIdMappings")
const flowReviewTypeConst = require("../const/flowReviewTypeConst")
const flowStatusConst = require("../const/flowStatusConst")
const {logger} = require("../utils/log")
const NotFoundError = require("../error/http/notFoundError")
const ParameterError = require("../error/parameterError")

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
    return {
        ids: resultTemplate.ids,
        sum: Object.keys(resultTemplate.ids).length,
        departments: resultTemplate.departments.map(item => {
            return {deptName: item.deptName, sum: Object.keys(item.ids).length, users: item.users, ids: item.ids}
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

    await redisService.setTodayFlows(newTodayFlows)
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

    const computedFlows = await getFlowsByDoneTimeRange(startDoneDate, endDoneDate)

    const ownerFrom = {"FORM": "FORM", "PROCESS": "PROCESS"}
    // 部门的核心动作配置信息
    const coreActionsConfig = await flowRepo.getCoreActionsConfig(deptId)

    const finalResult = []
    // 根据配置信息获取基于所有人的数据
    // eg：[{actionName: "市场分析", children: [{"nameCN": "待做", children: [{nameCN:"逾期", children:[{userName: "张三", sum: 1, ids: ["xxx"]}]}]}]}]
    for (const action of coreActionsConfig) {
        const {actionName, actionCode} = action
        // 动作节点
        const actionResult = {actionName, actionCode, children: []}
        for (const actionStatus of action.actionStatus) {
            const {nameCN, nameEN, rules} = actionStatus

            // 动作的状态节点
            let statusResult = {nameCN, nameEN, children: []}

            // 动作的状态节点区分逾期-未逾期两种
            const overDueResult = {nameCN: "逾期", nameEN: "overDue", children: []}
            const notOverDueResult = {nameCN: "未逾期", nameEN: "notOverDue", children: []}

            // 根据配置中状态的计算规则进行统计
            for (const rule of rules) {
                const currentFlows = computedFlows.filter((flow) => flow.formUuid === rule.formId)
                // 需要计算的节点对
                for (const nodePair of rule.countNodePairs) {
                    const {from: fromNode, to: toNode, overdue: overdueNode, ownerRule} = nodePair

                    for (const flow of currentFlows) {

                        const processInstanceId = flow.processInstanceId

                        let fromMatched = false
                        let toMatched = false
                        let isOverDue = false

                        for (const reviewItem of flow.overallprocessflow) {
                            // 发起的节点id对应的表单流程id不一致
                            const fromNodeId = formFlowIdMappings[fromNode.id] || fromNode.id

                            if (fromNode && reviewItem.activityId === fromNodeId && fromNode.status.includes(reviewItem.type)) {
                                fromMatched = true
                            }
                            if (toNode && reviewItem.activityId === toNode.id && toNode.status.includes(reviewItem.type)) {
                                toMatched = true
                            }
                            if (overdueNode && reviewItem.activityId === overdueNode.id && overdueNode.status.includes(reviewItem.type)) {
                                isOverDue = reviewItem.isOverDue
                            }
                        }
                        if (!fromMatched || !toMatched) {
                            continue
                        }

                        // 找到该公工作量的负责人
                        let ownerName = ""
                        const {from, id} = ownerRule
                        if (from.toUpperCase() === ownerFrom.FORM) {
                            ownerName = flow.data[id] && flow.data[id].length > 0 && flow.data[id][0]
                        } else {
                            const processReviewId = formFlowIdMappings[id] || id
                            const reviewItems = flow.overallprocessflow.filter(item => item.activityId === processReviewId)
                            ownerName = reviewItems.length > 0 && reviewItems[0].operatorName
                        }
                        if (!ownerName) {
                            logger.warn(`没有匹配到计数规则的所有人。流程：${processInstanceId},rule: ${JSON.stringify(ownerRule)}`)
                            continue
                        }

                        // 统计指定人的工作量
                        if (!userNames.includes(ownerName)) {
                            continue
                        }

                        // 根据是否逾期汇总个人的ids和sum
                        let userFlows = null
                        if (isOverDue) {
                            userFlows = overDueResult.children.filter(item => item.userName === ownerName)
                        } else {
                            userFlows = notOverDueResult.children.filter(item => item.userName === ownerName)
                        }
                        if (userFlows.length > 0 && userFlows[0].ids && userFlows[0].ids.length > 0) {
                            userFlows[0].ids.push(processInstanceId)
                            userFlows[0].sum = userFlows[0].ids.length
                        } else {
                            userFlows = {userName: ownerName, sum: 1, ids: [processInstanceId]}
                            if (isOverDue) {
                                overDueResult.children.push(userFlows)
                            } else {
                                notOverDueResult.children.push(userFlows)
                            }
                        }
                    }
                }
            }

            // 汇总结果保存
            statusResult.children.push(overDueResult)
            statusResult.children.push(notOverDueResult)
            actionResult.children.push(statusResult)
        }
        finalResult.push(actionResult)
    }

    for (let result of finalResult) {
        if (result.children) {
            result = flowUtil.attachIdsAndSum(result)
        }
    }
    return finalResult
}

/**
 * 统计部门的核心流程指定节点的数据
 * @param deptId
 * @param userNames
 * @param startDoneDate
 * @param endDoneDate
 * @returns {Promise<*[]>}
 */
const getCoreFlowData = async (deptId, userNames, startDoneDate, endDoneDate) => {
    // 根据时间获取需要统计的流程数据（今天+历史）
    const flows = await getFlowsByDoneTimeRange(startDoneDate, endDoneDate)

    const finalResult = []

    const nodeTypes = [
        {name: "进行中", type: flowReviewTypeConst.TODO},
        {name: "待转入", type: flowReviewTypeConst.FORCAST},
        {name: "已完成", type: flowReviewTypeConst.HISTORY},
        {name: "已终止", type: flowReviewTypeConst.TERMINATED},
        {name: "已逾期", type: "OVERDUE"},
        {name: "异常", type: flowReviewTypeConst.ERROR},
    ]

    const coreFormFlowConfigs = await flowRepo.getCoreFormFlowConfig(deptId)
    for (const coreFormConfig of coreFormFlowConfigs) {
        const {formName, formId, actions} = coreFormConfig

        const formResult = {formId, formName, children: []}
        // 初始化结果
        for (const action of actions) {
            const actionResult = {name: action.name, children: []}
            for (const nodeType of nodeTypes) {
                const typeResult = {type: nodeType.type, name: nodeType.name}
                if (nodeType.type.toUpperCase() === "OVERDUE") {
                    typeResult.children = [
                        {type: flowReviewTypeConst.TODO, name: "进行中", ids: [], sum: 0},
                        {type: flowReviewTypeConst.HISTORY, name: "已完成", ids: [], sum: 0}
                    ]
                } else {
                    typeResult.ids = []
                    typeResult.sum = 0
                }

                actionResult.children.push(typeResult)
            }
            formResult.children.push(actionResult)
        }

        // 根据动作配置信息对flow进行统计
        const currentFormFlows = flows.filter(flow => flow.formUuid === formId)
        for (const flow of currentFormFlows) {

            // 统计待转入时，需要知道要统计节点的临近的工作节点的状况
            // 循环中最耗时的地方
            // 如果该流程中药统计所有核心节点都没有待转入状态，则不必获取表单流程详情
            let flowFormReviews = []
            if (flow.instanceStatus === flowStatusConst.RUNNING) {
                flowFormReviews = await formReviewRepo.getFormReviewByFormId(flow.formUuid)
                if (flowFormReviews.length === 0) {
                    logger.warn(`未在flowFormReview中找到表单${flow.formUuid}的配置信息`)
                }
            }

            const processInstanceId = flow.processInstanceId

            for (const action of actions) {
                const currActionResult = formResult.children.filter(item => item.name === action.name)[0]
                const firstFilteredReviewItems = flow.overallprocessflow.filter(
                    item => action.nodeIds.includes(item.activityId) && userNames.includes(item.operatorName))

                // 如果流程节点中还没有统计的节点信息（可能未开始），则直接跳过
                if (firstFilteredReviewItems.length === 0) {
                    continue
                }

                for (const nodeType of nodeTypes) {
                    const typeResult = currActionResult.children.filter(item => item.type === nodeType.type)[0]

                    // 筛选出统计动作所对应的节点
                    // 1.逾期
                    if (nodeType.type === "OVERDUE") {
                        const overDueNodes = firstFilteredReviewItems.filter(item => item.isOverDue)
                        // 判断是完成还是进行中
                        if (overDueNodes.length === 0) {
                            continue
                        }
                        // 并行分支的条件下，可能会有一个流程出现两种状态的逾期情况
                        const tmpHistoryOverdue = overDueNodes.filter(item => item.type === flowReviewTypeConst.HISTORY)
                        if (tmpHistoryOverdue.length > 0) {
                            const historyOverDueResult = typeResult.children.filter(item => item.type === flowReviewTypeConst.HISTORY)[0]
                            historyOverDueResult.ids.push(processInstanceId)
                            historyOverDueResult.sum = historyOverDueResult.ids.length
                        }
                        const tmpTodoOverdue = overDueNodes.filter(item => item.type === flowReviewTypeConst.TODO)
                        if (tmpTodoOverdue.length > 0) {
                            const todoOverDueResult = typeResult.children.filter(item => item.type === flowReviewTypeConst.TODO)[0]
                            todoOverDueResult.ids.push(processInstanceId)
                            todoOverDueResult.sum = todoOverDueResult.ids.length
                        }
                    }
                    // 2.待转入：存在节点的状态为forcast 并且临近的节点(s)的状态为todo
                    else if (nodeType.type === flowReviewTypeConst.FORCAST) {
                        // 找到该节点的临近的节点(s)
                        if (flowFormReviews.length === 0) {
                            continue
                        }

                        const forecastReviewItems = firstFilteredReviewItems.filter(item => item.type === flowReviewTypeConst.FORCAST)
                        if (forecastReviewItems.length == 0) {
                            continue
                        }

                        for (const forecastReviewItem of forecastReviewItems) {

                            const flowReviewItems = flowFormReviews[0].formReview
                            const reviewItem = flowFormReviewUtil.getReviewItem(forecastReviewItem.activityId, flowReviewItems)
                            if (!reviewItem) {
                                logger.warn(`未在flowFormReview中找到节点${forecastReviewItem.activityId}的配置信息`)
                                continue
                            }
                            // 判断临近节点(s)的状态
                            if (!reviewItem.lastTimingNodes || reviewItem.lastTimingNodes.length === 0) {
                                logger.warn(`未在flowFormReview中找到节点${forecastReviewItem.nodeId}的lastTimingNodes信息`)
                                continue
                            }

                            // 所有的临近节点状态都为进行中
                            let lastNodeIsDoing = true
                            for (const nodeId of reviewItem.lastTimingNodes) {
                                const isDoing = flow.overallprocessflow.filter(
                                    item => item.activityId === nodeId && item.type === flowReviewTypeConst.TODO
                                ).length > 0

                                if (!isDoing) {
                                    lastNodeIsDoing = false
                                    break
                                }
                            }
                            if (lastNodeIsDoing && !typeResult.ids.includes(processInstanceId)) {
                                typeResult.ids.push(processInstanceId)
                                typeResult.sum = typeResult.ids.length
                                break
                            }
                        }
                    }
                    // 3.进行中、已完成：判断type即可
                    else if (nodeType.type === flowReviewTypeConst.TODO || nodeType.type === flowReviewTypeConst.HISTORY) {
                        const currTypeReviewItems = firstFilteredReviewItems.filter(item => item.type === nodeType.type)
                        if (currTypeReviewItems.length > 0) {
                            typeResult.ids.push(processInstanceId)
                            typeResult.sum = typeResult.ids.length
                        }
                    }
                    // 终止、异常判断流程状态
                    else {
                        const flowAbnormalStatus = [flowStatusConst.ERROR, flowStatusConst.TERMINATED]
                        if (flowAbnormalStatus.includes(flow.instanceStatus)) {
                            typeResult.ids.push(processInstanceId)
                            typeResult.sum = typeResult.ids.length
                        }
                    }
                }
            }
        }
        finalResult.push(formResult)
    }

    for (let result of finalResult) {
        if (result.children) {
            result = flowUtil.attachIdsAndSum(result)
        }
    }
    return finalResult
}

/**
 * 根据完成时间获取流程数据
 *
 * 历史数据转成Redis中的格式统一处理
 * @param startDoneDate
 * @param endDoneDate
 * @returns {Promise<*|[]|*[]|*[]>}
 */
const getFlowsByDoneTimeRange = async (startDoneDate, endDoneDate) => {

    if (!startDoneDate && !endDoneDate) {
        // 没有选择日期默认筛选今天的流程
        return await globalGetter.getTodayFlows()
    }

    if ((startDoneDate || endDoneDate) && !(startDoneDate && endDoneDate)) {
        throw new ParameterError("时间区间不完整")
    }

    if (dateUtil.duration(endDoneDate, startDoneDate) < 0) {
        throw new ParameterError("结束日期不能小于开始日期")
    }

    // 起止时间在将来
    if (dateUtil.duration(startDoneDate, dateUtil.format2Str(new Date(), "YYYY-MM-DD")) > 0) {
        return []
    }

    const processDataReviewItem = await Promise.all([
        flowRepo.getProcessDataByReviewItemDoneTime(dateUtil.startOfDay(startDoneDate), dateUtil.endOfDay(endDoneDate)),
        flowRepo.getProcessWithReviewByReviewItemDoneTime(dateUtil.startOfDay(startDoneDate), dateUtil.endOfDay(endDoneDate))
    ])

    let computedFlows = processDataReviewItem[1]
    const processWithData = processDataReviewItem[0]
    // 合并流程的data和审核流信息
    for (let i = 0; i < computedFlows.length; i++) {
        const currData = {}
        for (const item of processWithData[i].data) {
            const fieldValue = item.fieldValue
            if (fieldValue.startsWith("[") && fieldValue.endsWith("]")) {
                currData[item.fieldId] = JSON.parse(fieldValue)
            } else {
                currData[item.fieldId] = fieldValue
            }
        }
        computedFlows[i].data = currData
    }

    if (endDoneDate && dateUtil.duration(endDoneDate, dateUtil.format2Str(new Date(), "YYYY-MM-DD")) >= 0) {
        const todayFlows = await globalGetter.getTodayFlows()
        computedFlows = computedFlows.concat(todayFlows)
    }

    return computedFlows
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
    getCoreFlowData
}