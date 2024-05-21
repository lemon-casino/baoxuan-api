const flowRepo = require("../repository/flowRepo")
const formReviewRepo = require("../repository/formReviewRepo")
const flowUtil = require("../utils/flowUtil")
const flowFormReviewUtil = require("../utils/flowFormReviewUtil")
const {opFunctions} = require("../const/operatorConst")
const {flowStatusConst, flowReviewTypeConst, activityIdMappingConst} = require("../const/flowConst")

const ownerFrom = {"FORM": "FORM", "PROCESS": "PROCESS"}

const getDeptCoreAction = async (deptId, userNames, flows) => {
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

// 根据操作人汇总流程节点数据到结果节点中
const sumReviewItemsToResultNodeByOperators = (processInstanceId, userNames, resultNode) => {
    // // 逾期节点的人：存在多个节点多个人、多个节点一个人
    // const tmpUniqueUserNames = {}
    // for (const overdueItem of reviewItems) {
    //     tmpUniqueUserNames[[overdueItem.operatorName]] = 1
    // }
    //
    // const uniqueUserNames = Object.keys(tmpUniqueUserNames)
    // for (const userName of uniqueUserNames) {
    //
    // }

    const userAlreadyCount = resultNode.children.filter(item => item.userName === userNames)
    if (userAlreadyCount.length > 0) {
        userAlreadyCount[0].ids.push(processInstanceId)
        userAlreadyCount[0].sum = userAlreadyCount[0].ids.length
    } else {
        resultNode.children.push({
            userName: userNames,
            sum: 1,
            ids: [processInstanceId]
        })
    }
}

const getDeptCoreFlow = async (deptId, userNames, flows) => {
    const finalResult = []

    const nodeTypes = [
        {name: "待转入", type: flowReviewTypeConst.FORCAST},
        {name: "进行中", type: flowReviewTypeConst.TODO},
        {name: "已完成", type: flowReviewTypeConst.HISTORY},
        {name: "已逾期", type: "OVERDUE"},
    ]

    // const userIds = users.map(user => user.userid)
    const coreFormFlowConfigs = await flowRepo.getCoreFormFlowConfig(deptId)
    const flowReviewItemsMap = {}
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
                        // children 用于保存人的统计信息
                        {type: flowReviewTypeConst.TODO, name: "进行中", ids: [], sum: 0, children: []},
                        {type: flowReviewTypeConst.HISTORY, name: "已完成", ids: [], sum: 0, children: []}
                    ]
                } else {
                    // children 用于保存人的统计信息
                    typeResult.children = []
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
            // 如果该流程中要统计所有核心节点都没有待转入状态，则不必获取表单流程详情
            let flowFormReviews = flowReviewItemsMap[flow.reviewId] || []
            if (!flowFormReviews) {
                const formReview = await formReviewRepo.getDetailsById(flow.reviewId)
                if (!formReview) {
                    logger.warn(`未在flowFormReview中找到表单${flow.formUuid}的配置信息`)
                    flowReviewItemsMap[flow.reviewId] = []
                } else {
                    flowReviewItemsMap[flow.reviewId] = formReview.formReview
                }
            }

            const processInstanceId = flow.processInstanceId

            // 将流程根据节点和状态进行统计
            for (const action of actions) {
                const firstFilteredReviewItems = flowUtil.flatReviewItems(flow).overallprocessflow.filter(
                    item => action.nodeIds.includes(item.activityId) && userNames.includes(item.operatorName))

                // 如果流程节点中还没有统计的节点信息（可能未开始），则直接跳过
                if (firstFilteredReviewItems.length === 0) {
                    continue
                }

                const currActionResult = formResult.children.filter(item => item.name === action.name)[0]
                for (const nodeType of nodeTypes) {
                    const typeResult = currActionResult.children.filter(item => item.type === nodeType.type)[0]

                    // 1.待转入：存在节点的状态为forcast 并且临近的节点(s)的状态为todo
                    if (nodeType.type === flowReviewTypeConst.FORCAST) {
                        // 找到该节点的临近的节点(s)
                        if (flowFormReviews.length === 0) {
                            continue
                        }

                        const forecastReviewItems = firstFilteredReviewItems.filter(item => item.type === flowReviewTypeConst.FORCAST)
                        if (forecastReviewItems.length == 0) {
                            continue
                        }
                        //  flowFormReviews>1的情况在分支条件下会出现，同样只要判断第一个即可
                        const forecastReviewItem = forecastReviewItems[0]
                        const flowReviewItems = flowReviewItemsMap[flow.reviewId]
                        const reviewItem = flowFormReviewUtil.getReviewItem(forecastReviewItem.activityId, flowReviewItems)
                        if (!reviewItem) {
                            logger.warn(`未在flowFormReview中找到节点${forecastReviewItem.activityId}的配置信息`)
                            continue
                        }
                        // 判断临近节点(s)的状态
                        if (!reviewItem.lastTimingNodes || reviewItem.lastTimingNodes.length === 0) {
                            logger.warn(`未在flowFormReview中找到节点${forecastReviewItem.id}的lastTimingNodes信息`)
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
                            const userNames = [...new Set(forecastReviewItems.map(item => item.operatorName))].join("-")
                            sumReviewItemsToResultNodeByOperators(processInstanceId, userNames, typeResult)
                            break
                        }
                    }
                    // 2. 进行中
                    else if (nodeType.type === flowReviewTypeConst.TODO) {
                        // 存在进行中的节点即算为进行中
                        const todoReviewItems = firstFilteredReviewItems.filter(item => item.type === flowReviewTypeConst.TODO)
                        if (todoReviewItems.length > 0) {
                            // 存在部分节点已完成的情况，不要标记出来
                            const userNames = [...new Set(firstFilteredReviewItems.map(item => item.operatorName))].join("-")
                            sumReviewItemsToResultNodeByOperators(processInstanceId, userNames, typeResult)
                        }
                    }
                    // 3. 已完成
                    else if (nodeType.type === flowReviewTypeConst.HISTORY) {
                        // 所有的节点状态都为history时才算完成
                        const historyReviewItems = firstFilteredReviewItems.filter(item => item.type === flowReviewTypeConst.HISTORY)
                        if (historyReviewItems.length === firstFilteredReviewItems.length) {
                            const userNames = [...new Set(firstFilteredReviewItems.map(item => item.operatorName))].join("-")
                            sumReviewItemsToResultNodeByOperators(processInstanceId, userNames, typeResult)
                        }
                    }
                    // 4.逾期
                    else if (nodeType.type === "OVERDUE") {
                        const overDueNodes = firstFilteredReviewItems.filter(item => item.isOverDue)
                        // 判断是完成还是进行中
                        if (overDueNodes.length === 0) {
                            continue
                        }
                        const userNames = [...new Set(overDueNodes.map(item => item.operatorName))].join("-")
                        // 并行分支的条件下，可能会有一个流程出现两种状态的逾期情况
                        const tmpTodoOverdue = overDueNodes.filter(item => item.type === flowReviewTypeConst.TODO)
                        if (tmpTodoOverdue.length > 0) {
                            const todoOverDueResult = typeResult.children.filter(item => item.type === flowReviewTypeConst.TODO)[0]
                            sumReviewItemsToResultNodeByOperators(processInstanceId, userNames, todoOverDueResult)
                        }
                        const tmpHistoryOverdue = overDueNodes.filter(item => item.type === flowReviewTypeConst.HISTORY)
                        if (tmpHistoryOverdue.length === overDueNodes.length) {
                            const historyOverDueResult = typeResult.children.filter(item => item.type === flowReviewTypeConst.HISTORY)[0]
                            sumReviewItemsToResultNodeByOperators(processInstanceId, userNames, historyOverDueResult)
                        }
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
    getDeptCoreFlow
}