const formReviewRepo = require("../repository/formReviewRepo")
const flowUtil = require("../utils/flowUtil")
const flowFormReviewUtil = require("../utils/flowFormReviewUtil")
const {opFunctions} = require("../const/operatorConst")
const {
    flowReviewTypeConst,
    activityIdMappingConst, flowStatusConst
} = require("../const/flowConst")

const ownerFrom = {"FORM": "FORM", "PROCESS": "PROCESS"}
const statusArr = [
    {name: "待转入", type: flowReviewTypeConst.FORCAST},
    {name: "进行中", type: flowReviewTypeConst.TODO},
    {name: "已完成", type: flowReviewTypeConst.HISTORY},
    {name: "已逾期", type: "OVERDUE"},
]

const getDeptCoreAction = async (userNames, flows, coreConfig) => {
    const finalResult = []
    // 根据配置信息获取基于所有人的数据
    // eg：[{actionName: "市场分析", children: [{"nameCN": "待做", children: [{nameCN:"逾期", children:[{userName: "张三", sum: 1, ids: ["xxx"]}]}]}]}]
    for (const action of coreConfig) {
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
                let currentFlows = flows.filter((flow) => flow.formUuid === rule.formId)
                // 需要计算的节点对
                for (const flowNodeRule of rule.flowNodeRules) {
                    if (rule.flowDetailsRules) {
                        for (const detailsRule of rule.flowDetailsRules) {
                            currentFlows = currentFlows.filter(flow => {
                                return opFunctions[detailsRule.opCode](flow.data[detailsRule.fieldId], detailsRule.value)
                            })
                        }
                    }

                    const {from: fromNode, to: toNode, overdue: overdueNode, ownerRule} = flowNodeRule

                    for (let flow of currentFlows) {

                        const processInstanceId = flow.processInstanceId
                        let fromMatched = false
                        let toMatched = false
                        let isOverDue = false

                        // 一个动作多人执行（会签）
                        let parallelOperators = []
                        const reviewItems = flowUtil.getLatestUniqueReviewItems(flow.overallprocessflow)
                        for (const reviewItem of reviewItems) {
                            // 发起的节点id对应的表单流程id不一致
                            const fromNodeId = activityIdMappingConst[fromNode.id] || fromNode.id

                            if (fromNode && reviewItem.activityId === fromNodeId && fromNode.status.includes(reviewItem.type)) {
                                fromMatched = true
                            }
                            if (toNode && reviewItem.activityId === toNode.id && toNode.status.includes(reviewItem.type)) {
                                toMatched = true
                            }
                            if (overdueNode && reviewItem.activityId === overdueNode.id && overdueNode.status.includes(reviewItem.type)) {
                                isOverDue = reviewItem.isOverDue
                            }

                            if (fromMatched && toMatched) {
                                if (reviewItem.domainList && reviewItem.domainList.length > 0) {
                                    for (const domain of reviewItem.domainList) {
                                        parallelOperators.push(domain.operatorName)
                                    }
                                }
                                break
                            }
                        }
                        if (!fromMatched || !toMatched) {
                            continue
                        }

                        if (parallelOperators.length === 0) {
                            // 找到该公工作量的负责人
                            let ownerName = ""
                            const {from, id} = ownerRule
                            if (from.toUpperCase() === ownerFrom.FORM) {
                                ownerName = flow.data[id] && flow.data[id].length > 0 && flow.data[id][0]
                            } else {
                                const processReviewId = activityIdMappingConst[id] || id
                                const reviewItems = flow.overallprocessflow.filter(item => item.activityId === processReviewId)
                                ownerName = reviewItems.length > 0 && reviewItems[0].operatorName
                            }
                            if (!ownerName) {
                                logger.warn(`没有匹配到计数规则的所有人。流程：${processInstanceId},rule: ${JSON.stringify(ownerRule)}`)
                                continue
                            }
                            parallelOperators.push(ownerName)
                        }

                        parallelOperators = parallelOperators.filter(operator => userNames.includes(operator))

                        if (parallelOperators.length === 0) {
                            continue
                        }

                        // 根据是否逾期汇总个人的ids和sum
                        for (const operator of parallelOperators) {
                            let userFlows = null
                            if (isOverDue) {
                                userFlows = overDueResult.children.filter(item => item.userName === operator)
                            } else {
                                userFlows = notOverDueResult.children.filter(item => item.userName === operator)
                            }
                            if (userFlows.length > 0 && userFlows[0].ids && userFlows[0].ids.length > 0) {
                                userFlows[0].ids.push(processInstanceId)
                                userFlows[0].sum = userFlows[0].ids.length
                            } else {
                                userFlows = {userName: operator, sum: 1, ids: [processInstanceId]}
                                if (isOverDue) {
                                    overDueResult.children.push(userFlows)
                                } else {
                                    notOverDueResult.children.push(userFlows)
                                }
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
    return finalResult
}

/**
 * 将 processInstanceId 统计到 resultNode中key=value的ids中
 *
 * @param processInstanceId
 * @param key
 * @param value
 * @param resultNode
 */
const statReviewItemsToResultNode = (processInstanceId, key, value, resultNode) => {
    const alreadyCount = resultNode.children.filter(item => item[[key]] === value)
    if (alreadyCount.length > 0) {
        const alreadyObj = alreadyCount[0]
        if (!alreadyObj.ids.includes(processInstanceId)) {
            alreadyObj.ids.push(processInstanceId)
            alreadyObj.sum = alreadyObj.ids.length
        }
    } else {
        resultNode.children.push({
            [key]: value,
            sum: 1,
            ids: [processInstanceId]
        })
    }
}

/**
 * 获取部门的核心流程
 *
 * @param userNames
 * @param flows
 * @param coreFormFlowConfigs
 * @returns {Promise<*[]>}
 */
const getDeptCoreFlow = async (userNames, flows, coreFormFlowConfigs) => {
    const finalResult = []

    const flowReviewItemsMap = {}
    for (const coreFormConfig of coreFormFlowConfigs) {
        const {children: activities} = coreFormConfig

        const formResult = initSingleFormResult(coreFormConfig)
        // 根据动作配置信息对flow进行统计
        const currentFormFlows = flows.filter(flow => flow.formUuid === coreFormConfig.formId)

        const formFlowStatResult = [
            {status: flowStatusConst.RUNNING, name: "进行中", sum: 0, ids: []},
            {status: flowStatusConst.COMPLETE, name: "已完成", sum: 0, ids: []}
        ]

        for (const flow of currentFormFlows) {
            // 统计待转入时，需要知道要统计节点的临近的工作节点的状况
            // 如果该流程中要统计所有核心节点都没有待转入状态，则不必获取表单流程详情
            let flowFormReviews = []
            if (flow.reviewId) {
                flowFormReviews = await getFlowReviewItems(flow.reviewId, flowReviewItemsMap)
            }

            // 将流程根据节点和状态进行统计
            for (const activity of activities) {
                const firstFilteredReviewItems = flowUtil.flatReviewItems(flow).overallprocessflow.filter(
                    item => activity.children.includes(item.activityId) && userNames.includes(item.operatorName))
                // 如果流程节点中还没有统计的节点信息（可能未开始），则直接跳过
                if (firstFilteredReviewItems.length === 0) {
                    continue
                }

                const activityResult = formResult.children.filter(item => item.activityName === activity.activityName)[0]
                for (const statusObj of statusArr) {
                    const statusResult = activityResult.children.filter(status => status.type === statusObj.type)[0]
                    statFlow(flow, activity, statusResult, "userName", flowFormReviews, firstFilteredReviewItems)
                }
            }

            let formFlowStatusStatResult = formFlowStatResult[1]
            if (flow.instanceStatus === flowStatusConst.RUNNING) {
                formFlowStatusStatResult = formFlowStatResult[0]
            }
            formFlowStatusStatResult.ids.push(flow.processInstanceId)
            formFlowStatusStatResult.sum = formFlowStatusStatResult.ids.length
        }
        // 添加对该表单所对应的所有流程的汇总
        formResult.flowsStat = formFlowStatResult
        finalResult.push(formResult)
    }
    return finalResult
}

/**
 * 初始化单个表单的数据
 *
 * @param form
 */
const initSingleFormResult = (form) => {
    const formResult = {...form, children: []}
    // 当前children 的数据包括：部门或者节点
    for (const formChild of form.children) {
        const formChildResult = {...formChild, children: []}
        for (const statusObj of statusArr) {
            const statusResult = {...statusObj, children: []}
            if (statusObj.type.toUpperCase() === "OVERDUE") {
                statusResult.children = [
                    {type: flowReviewTypeConst.TODO, name: "进行中", ids: [], sum: 0, children: []},
                    {type: flowReviewTypeConst.HISTORY, name: "已完成", ids: [], sum: 0, children: []}
                ]
            } else {
                statusResult.ids = []
                statusResult.sum = 0
            }
            formChildResult.children.push(statusResult)
        }
        formResult.children.push(formChildResult)
    }
    return formResult
}

/**
 * 根据reviewId获取审核配置信息
 *
 * @param reviewId
 * @param flowReviewItemsMap
 * @returns {Promise<*>}
 */
const getFlowReviewItems = async (reviewId, flowReviewItemsMap) => {
    const flowFormReviews = flowReviewItemsMap[reviewId] || []
    if (flowFormReviews.length === 0) {
        const formReview = await formReviewRepo.getDetailsById(reviewId)
        if (!formReview) {
            flowReviewItemsMap[reviewId] = []
        } else {
            flowReviewItemsMap[reviewId] = formReview.formReview
        }
    }
    return flowReviewItemsMap[reviewId]
}

/**
 * 将流程（flow）按照节点信息（activityConfig）-统计到状态结果（statusResult）的statKey中进行统计
 * flowFormReviews： 待转入判断需要判断临近的工作节点状态
 *
 * @param flow
 * @param activityConfig
 * @param statusResult
 * @param statKey
 * @param flowFormReviews
 * @param firstFilteredReviewItems
 */
const statFlow = (flow, activityConfig, statusResult, statKey, flowFormReviews, firstFilteredReviewItems) => {
    const processInstanceId = flow.processInstanceId
    let statValue = ""
    if (statKey === "activityName") {
        statValue = activityConfig.activityName
    }

    // 如果流程节点中还没有统计的节点信息（可能未开始），则直接跳过
    if (firstFilteredReviewItems.length > 0) {
        // 1.待转入：存在节点的状态为forcast 并且临近的节点(s)的状态为todo
        if (statusResult.type === flowReviewTypeConst.FORCAST) {
            const forecastReviewItems = firstFilteredReviewItems.filter(item => item.type === flowReviewTypeConst.FORCAST)
            if (forecastReviewItems.length > 0) {
                //  flowFormReviews>1的情况在分支条件下会出现，同样只要判断第一个即可
                const forecastReviewItem = forecastReviewItems[0]
                const reviewItem = flowFormReviewUtil.getReviewItem(forecastReviewItem.activityId, flowFormReviews)
                if (reviewItem && reviewItem.lastTimingNodes && reviewItem.lastTimingNodes.length > 0) {
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

                    if (lastNodeIsDoing) {
                        const actionFlowIds = statusResult.children.filter(item => item.activityName === activityConfig.activityName)
                        if (actionFlowIds.length === 0 || !actionFlowIds[0].ids.includes(processInstanceId)) {
                            if (statKey === "userName") {
                                statValue = [...new Set(forecastReviewItems.map(item => item.operatorName))].join("-")
                            }
                            statReviewItemsToResultNode(processInstanceId, statKey, statValue, statusResult)
                        }
                    }
                }
            }
        }
        // 2. 进行中
        else if (statusResult.type === flowReviewTypeConst.TODO) {
            // 存在进行中的节点即算为进行中
            const todoReviewItems = firstFilteredReviewItems.filter(item => item.type === flowReviewTypeConst.TODO)
            if (todoReviewItems.length > 0) {
                if (statKey === "userName") {
                    statValue = [...new Set(firstFilteredReviewItems.map(item => item.operatorName))].join("-")
                }
                statReviewItemsToResultNode(processInstanceId, statKey, statValue, statusResult)
            }
        }
        // 3. 已完成
        else if (statusResult.type === flowReviewTypeConst.HISTORY) {
            // 所有的节点状态都为history时才算完成
            const historyReviewItems = firstFilteredReviewItems.filter(item => item.type === flowReviewTypeConst.HISTORY)
            if (historyReviewItems.length === firstFilteredReviewItems.length) {
                if (statKey === "userName") {
                    statValue = [...new Set(firstFilteredReviewItems.map(item => item.operatorName))].join("-")
                }
                statReviewItemsToResultNode(processInstanceId, statKey, statValue, statusResult)
            }
        }
        // 4.逾期
        else if (statusResult.type === "OVERDUE") {
            const overDueNodes = firstFilteredReviewItems.filter(item => item.isOverDue)
            // 判断是完成还是进行中
            if (overDueNodes.length > 0) {
                // 并行分支的条件下，可能会有一个流程出现两种状态的逾期情况
                const tmpTodoOverdue = overDueNodes.filter(item => item.type === flowReviewTypeConst.TODO)
                if (statKey === "userName") {
                    statValue = [...new Set(overDueNodes.map(item => item.operatorName))].join("-")
                }
                if (tmpTodoOverdue.length > 0) {
                    const todoOverDueResult = statusResult.children.filter(item => item.type === flowReviewTypeConst.TODO)[0]
                    statReviewItemsToResultNode(processInstanceId, statKey, statValue, todoOverDueResult)
                }
                const tmpHistoryOverdue = overDueNodes.filter(item => item.type === flowReviewTypeConst.HISTORY)
                if (tmpHistoryOverdue.length === overDueNodes.length) {
                    const historyOverDueResult = statusResult.children.filter(item => item.type === flowReviewTypeConst.HISTORY)[0]
                    if (statKey === "userName") {

                    }
                    statReviewItemsToResultNode(processInstanceId, statKey, statValue, historyOverDueResult)
                }
            }
        }
    }
}

/**
 * 获取全流程数据
 *
 * @param deptIds
 * @param flows
 * @param formsDepsConfig
 * @returns {Promise<*[]>}
 */
const getOverallFlowForms = async (deptIds, flows, formsDepsConfig) => {
    const finalResult = []
    const flowReviewItemsMap = {}
    for (const form of formsDepsConfig) {
        const formResult = initSingleFormResult(form)
        flows = flows.filter(flow => flow.formUuid === form.formId)
        for (const flow of flows) {
            let flowFormReviews = []
            if (flow.reviewId) {
                flowFormReviews = await getFlowReviewItems(flow.reviewId, flowReviewItemsMap)
            }
            for (const formChildResult of formResult.children) {
                for (const statusResult of formChildResult.children) {
                    const childConfig = form.children.filter(dept => dept.deptId === formChildResult.deptId)[0]
                    for (const activityConfig of childConfig.children) {
                        const firstFilteredReviewItems = flowUtil.flatReviewItems(flow).overallprocessflow.filter(
                            item => activityConfig.children.includes(item.activityId)
                        )
                        statFlow(flow, activityConfig, statusResult, "activityName", flowFormReviews, firstFilteredReviewItems)
                    }
                }
            }
        }
        finalResult.push(formResult)
    }
    return finalResult
}


module.exports = {
    getDeptCoreAction,
    getDeptCoreFlow,
    getOverallFlowForms
}