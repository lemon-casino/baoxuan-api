const {opFunctions} = require("../../const/operatorConst")
const {activityIdMappingConst} = require("../../const/flowConst")
const flowUtil = require("../../utils/flowUtil")

const ownerFrom = {"FORM": "FORM", "PROCESS": "PROCESS"}

const get = async (userNames, flows, coreConfig) => {
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
                                ownerName = flow.data[id] && flow.data[id].length > 0 && flow.data[id]
                                // 如果是数组的格式，转成以“,”连接的字符串
                                if (ownerName instanceof Array) {
                                    ownerName = ownerName.join(",")
                                }
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

module.exports = {
    get
}
