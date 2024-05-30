const _ = require("lodash")
const formReviewRepo = require("../repository/formReviewRepo")
const flowUtil = require("../utils/flowUtil")
const flowFormReviewUtil = require("../utils/flowFormReviewUtil")
const {opFunctions, opCodes} = require("../const/operatorConst")
const {
    flowReviewTypeConst,
    activityIdMappingConst, flowStatusConst
} = require("../const/flowConst")

const ownerFrom = {"FORM": "FORM", "PROCESS": "PROCESS"}

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
 * 找到当前统计的节点所对应的状态Result
 *
 * @param userActivities
 * @param activityResult
 * @param params
 * @returns {*|null}
 */
const findActivityStatusResult = (userActivities, activityResult, params) => {
    if (userActivities[0].type === flowReviewTypeConst.FORCAST) {
        //  flowFormReviews>1的情况在分支条件下会出现，同样只要判断第一个即可
        // const forecastReviewItem = forecastReviewItems[0]
        const reviewItem = flowFormReviewUtil.getReviewItem(userActivities[0].activityId, params.flowFormReviews)
        if (reviewItem && reviewItem.lastTimingNodes && reviewItem.lastTimingNodes.length > 0) {
            // 所有的临近节点状态都为进行中
            let lastNodeIsDoing = true
            for (const nodeId of reviewItem.lastTimingNodes) {
                const isDoing = params.originActivities.filter(
                    item => item.activityId === nodeId && item.type === flowReviewTypeConst.TODO
                ).length > 0

                if (!isDoing) {
                    lastNodeIsDoing = false
                    break
                }
            }

            if (lastNodeIsDoing) {
                const activityForecastResult = activityResult.children.filter(item => item.type === flowReviewTypeConst.FORCAST)
                return activityForecastResult[0]
            }
        }
        return null
    }

    const todoReviewItems = userActivities.filter(item => item.type === flowReviewTypeConst.TODO)

    let activityStatusResult = null
    let flowReviewType = flowReviewTypeConst.HISTORY
    if (todoReviewItems.length > 0) {
        flowReviewType = flowReviewTypeConst.TODO
    }
    activityStatusResult = activityResult.children.filter(item => item.type === flowReviewType)[0]

    if (!userActivities[0].isOverDue) {
        userActivities[0].isOverDue = false
    }
    const activityOverdueStatusResult = activityStatusResult.children.filter(item => userActivities[0].isOverDue === item.isOverDue)[0]

    return activityOverdueStatusResult
}

// 将根据节点状态，将流程 统计到 activityResult 中
const countFlowIntoActivityResultByActivities = async (activityResult, params) => {
    const activityStatusResult = findActivityStatusResult(params.userActivities, activityResult, params)
    // 待转入状态可能会不用统计，返回null
    if (activityStatusResult) {
        if (params.statValues && params.statValues.length > 0) {
            for (const statValue of params.statValues) {
                statReviewItemsToResultNode(params.originActivities[0].processInstanceId, params.statKey, statValue, activityStatusResult)
            }
        }
    }
}

// 将flow统计到activity中
const countFlowIntoFormResultByActivities = async (formResult, params) => {
    // 将流程根据节点和状态进行统计
    for (const activityResult of formResult.children) {
        if (params.statKey === "userName") {
            const userActivities = params.originActivities.filter(item => activityResult.activityIds.includes(item.activityId))
            if (userActivities.length === 0) {
                continue
            }
            params.userActivities = userActivities
            // 分别汇总到多个人
            params.statValues = userActivities.map(item => item.operatorName)
        } else {
            params.statValues = [activityResult.activityName]
        }
        await countFlowIntoActivityResultByActivities(activityResult, params)
    }
}

// 根据最新的流程表单对节点进行排序，不在其中的节点拍到后面
const sortFormResultAccordingToLatestReviewItems = (formResult, reviewItems) => {
    const longestExecutePath = flowFormReviewUtil.getLongestFormExecutePath(reviewItems)
    if (longestExecutePath[0].activityName = "发起") {
        longestExecutePath[0].activityName = "提交申请"
        longestExecutePath[0].activityId = activityIdMappingConst[longestExecutePath[0].activityId]
    }
    // 根据最新的流程表单节点顺序，为结果中的节点增加order，进行排序
    formResult.children.map(item => {
        const activityIndex = longestExecutePath.findIndex(activity => activity.activityName === item.activityName)
        if (activityIndex > -1) {
            item.order = activityIndex
        } else if (item.activityName === "未知") {
            item.order = 999
        } else {
            item.order = 777
        }
        return item
    })
    formResult.children.sort((curr, next) => curr.order - next.order)
}


/**
 * 获取部门的核心流程
 *
 * @param userNames 需要过滤出来的人名
 * @param flows 需要统计的流程
 * @param forms 表单的统计配置 [formName:"", ..., children: [{activityName: "",..., children: []}]]
 * @returns {Promise<*[]>}
 */
const getDeptCoreFlow = async (userNames, flows, forms) => {
    const finalResult = []

    const flowReviewItemsMap = {}
    for (const form of forms) {
        const formResult = {formId: form.flowFormId, formName: form.flowFormName, children: []}
        const formFlowStatResult = [
            {status: flowStatusConst.RUNNING, name: "进行中", sum: 0, ids: []},
            {status: flowStatusConst.COMPLETE, name: "已完成", sum: 0, ids: []},
            {status: flowStatusConst.TERMINATED, name: "终止", sum: 0, ids: []},
            {status: flowStatusConst.ERROR, name: "异常", sum: 0, ids: []}
        ]
        // 根据动作配置信息对flow进行统计
        const formFlows = flows.filter(flow => flow.formUuid === form.flowFormId)
        for (const flow of formFlows) {
            flow.overallprocessflow = flow.overallprocessflow.map(item => {
                if (!item.activityId) {
                    return {...item, activityId: "unKnown", showName: "未知"}
                }
                return item
            })
            const params = {
                flowFormReviews: flow.reviewId ? await getFlowReviewItems(flow.reviewId, flowReviewItemsMap) : [],
                statKey: "userName",
                originActivities: flow.overallprocessflow
            }
            if (userNames) {
                params.funcUserNames = {opCode: opCodes.Contain, value: userNames}
            }
            // 因为流程经常改动，根据最新的表单流程生成的formResult会有节点信息丢失
            // 补充formResult的信息
            let userActivities = flow.overallprocessflow
            if (userNames) {
                userActivities = userActivities.filter(item => userNames.includes(item.operatorName))
            }

            if (userActivities.length === 0) {
                continue
            }

            for (const activity of userActivities) {
                const sameActivities = formResult.children.filter(item => item.activityName === activity.showName)
                if (sameActivities.length === 0) {
                    formResult.children.push({
                        activityIds: [activity.activityId],
                        activityName: activity.showName,
                        children: _.cloneDeep(overdueMixedStatusStructure)
                    })
                } else {
                    sameActivities[0].activityIds.push(activity.activityId)
                }
            }
            // 将flow中的activities（formStatConfig.children） 统计到formResult中
            await countFlowIntoFormResultByActivities(formResult, params)

            for (const statusResult of formFlowStatResult) {
                if (statusResult.status === flow.instanceStatus) {
                    statusResult.ids.push(flow.processInstanceId)
                    statusResult.sum = statusResult.ids.length
                }
            }
        }

        const formReviews = form.flowFormReviews[0]?.formReview
        if (formReviews && formReviews.length > 0) {
            sortFormResultAccordingToLatestReviewItems(formResult, formReviews)
        }

        // remove activityIds
        for (let i = 0; i < formResult.children.length; i++) {
            const activityResult = formResult.children[i]
            formResult.children[i] = {activityName: activityResult.activityName, children: activityResult.children}
        }

        // 添加对该表单所对应的所有流程的汇总
        formResult.flowsStat = formFlowStatResult
        finalResult.push(formResult)
    }
    return finalResult
}

const overdueAloneStatusStructure = [
    {name: "待转入", type: flowReviewTypeConst.FORCAST, children: [], excludeUpSum: true},
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
        name: "已逾期", type: "OVERDUE", children: [
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

const overdueMixedStatusStructure = [
    {name: "待转入", type: flowReviewTypeConst.FORCAST, children: [], excludeUpSum: true},
    {
        name: "进行中",
        type: flowReviewTypeConst.TODO,
        children: [{name: "未逾期", isOverDue: false, children: []}, {name: "逾期", isOverDue: true, children: []}]
    },
    {
        name: "已完成", type: flowReviewTypeConst.HISTORY,
        children: [{name: "未逾期", isOverDue: false, children: []}, {name: "逾期", isOverDue: true, children: []}]
    }
]

/**
 * 初始化单个表单的数据
 *
 * @param form
 */
const initSingleFormResult = (form, statusStructure) => {
    const formResult = {...form, children: []}
    // 当前children 的数据包括：部门或者节点
    if (form.children && form.children.length > 0) {
        for (const formChild of form.children) {
            const formChildResult = {...formChild, children: []}
            formChildResult.children = _.cloneDeep(statusStructure)
            formResult.children.push(formChildResult)
        }
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
        const formResult = initSingleFormResult(form, overdueAloneStatusStructure)
        const currFormFlows = flows.filter(flow => flow.formUuid === form.formId)
        for (const flow of currFormFlows) {
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