const _ = require("lodash")
const {opFunctions} = require("@/const/operatorConst")
const {activityIdMappingConst} = require("@/const/flowConst")
const flowUtil = require("@/utils/flowUtil")

const ownerFrom = {"FORM": "FORM", "PROCESS": "PROCESS"}

/**
 * 根据人名和核心动作配置信息统计流程
 *
 * @param users
 * @param currFlows
 * @param coreConfig
 * @param userFlowDataStatCB
 * @returns {Promise<*[]>}
 */
const get = async (users, flows, coreConfig, userFlowDataStatCB) => {
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
                let currFlows = flows.filter((flow) => flow.formUuid === rule.formId)
                // 根据配置的流程数据规则过滤流程
                const filterFlowsByFlowDetailsRules = (flows, flowDetailsRules) => {
                    if (flowDetailsRules) {
                        for (const detailsRule of flowDetailsRules) {
                            flows = flows.filter(flow => {
                                if (flow.data[detailsRule.fieldId]) {
                                    return opFunctions[detailsRule.opCode](flow.data[detailsRule.fieldId], detailsRule.value)
                                }
                                return false
                            })
                        }
                    }
                    return flows
                }

                currFlows = filterFlowsByFlowDetailsRules(currFlows, rule.flowDetailsRules)

                if (currFlows.length === 0) {
                    continue
                }

                for (const flowNodeRule of rule.flowNodeRules) {
                    const {from: fromNode, to: toNode, ownerRule} = flowNodeRule

                    // 根据节点配置对流程进行汇总
                    for (let flow of currFlows) {
                        const processInstanceId = flow.processInstanceId

                        // 一个动作多人执行（会签）
                        let operatorsActivity = []
                        const activities = flowUtil.getLatestUniqueReviewItems(flow.overallprocessflow)

                        const getMatchedActivity = (fromNode, toNode, activities) => {
                            let fromMatched = false
                            let toMatched = false

                            for (const activity of activities) {
                                // 发起的节点id对应的表单流程id不一致
                                const fromNodeId = activityIdMappingConst[fromNode.id] || fromNode.id

                                if (fromNode && activity.activityId === fromNodeId && fromNode.status.includes(activity.type)) {
                                    fromMatched = true
                                }
                                if (toNode && activity.activityId === toNode.id && toNode.status.includes(activity.type)) {
                                    toMatched = true
                                }
                                // if (overdueNode && activity.activityId === overdueNode.id && overdueNode.status.includes(activity.type)) {
                                //     isOverDue = activity.isOverDue
                                // }

                                if (fromMatched && toMatched) {
                                    return activity
                                }
                            }
                            return null
                        }

                        const matchedActivity = getMatchedActivity(fromNode, toNode, activities)
                        if (!matchedActivity) {
                            continue
                        }


                        const extendActivityWithUserNameAndTags = (activity, users) => {
                            const tmpOperatorsActivity = []
                            if (activity.domainList && activity.domainList.length > 0) {
                                // 包含domainList的节点直接算到节点操作人的头上
                                for (const domain of activity.domainList) {
                                    const user = users.find(user => user.nickname === domain.operatorName || user.userName === domain.operatorName)
                                    tmpOperatorsActivity.push({
                                        userName: domain.operatorName,
                                        tags: user.tags || [],
                                        activity: activity
                                    })
                                }
                            }
                            // 单节点根据配置确定要计算的人头上
                            else {
                                // 找到该工作量的负责人
                                let ownerName = "未分配"
                                let {from, id, defaultUserName} = ownerRule
                                // 外包的流程可能会存在未选择外包人的情况
                                if (from.toUpperCase() === ownerFrom.FORM) {
                                    let tmpOwnerName = flow.data[id] && flow.data[id].length > 0 && flow.data[id]
                                    // 如果是数组的格式，转成以“,”连接的字符串
                                    if (tmpOwnerName instanceof Array) {
                                        tmpOwnerName = tmpOwnerName.join(",")
                                    }
                                    if (tmpOwnerName) {
                                        ownerName = tmpOwnerName
                                    } else if (defaultUserName) {
                                        ownerName = defaultUserName
                                    }
                                } else {
                                    const processReviewId = activityIdMappingConst[id] || id
                                    const reviewItems = flow.overallprocessflow.filter(item => item.activityId === processReviewId)
                                    ownerName = reviewItems.length > 0 ? reviewItems[0].operatorName : defaultUserName
                                }

                                const user = users.find(user => user.nickname === ownerName || user.userName === ownerName)

                                if (user) {
                                    tmpOperatorsActivity.push({
                                        userName: ownerName,
                                        tags: user.tags,
                                        activity: activity
                                    })
                                }
                            }
                            return tmpOperatorsActivity
                        }

                        operatorsActivity = extendActivityWithUserNameAndTags(matchedActivity, users)

                        if (operatorsActivity.length === 0) {
                            continue
                        }


                        // 根据是否逾期汇总个人的ids和sum
                        for (const operatorActivity of operatorsActivity) {

                            const getStatNode = (activity, overDueResult, notOverDueResult) => {
                                if (activity.isOverDue) {
                                    return overDueResult.children.filter(item => item.userName === operatorActivity.userName)
                                }
                                return notOverDueResult.children.filter(item => item.userName === operatorActivity.userName)
                            }

                            const getUserStatResult = () => {

                            }

                            const createStatNode = () => {

                            }

                            const statNode = getStatNode(matchedActivity,  overDueResult, notOverDueResult)

                            const userStatResult = getUserStatResult()


                            let userFlows = null
                            if (matchedActivity.isOverDue) {
                                userFlows = overDueResult.children.filter(item => item.userName === operatorActivity.userName)
                            } else {
                                userFlows = notOverDueResult.children.filter(item => item.userName === operatorActivity.userName)
                            }

                            let userFlowDataStat = null
                            // 获取该人在该流程中当前表单的数据进行汇总(进行中、已完成)
                            if (!statusResult.nameCN.includes("待")) {
                                const tmpFlow = _.cloneDeep(flow)
                                // 进行中的工作会统计表单中预计的数量 完成后需要排除掉预计的数量， 表单标识有【预计】字样
                                if (statusResult.nameCN.includes("完")) {
                                    const containYuJiTagKeys = []
                                    for (const key of Object.keys(tmpFlow.dataKeyDetails)) {
                                        if (tmpFlow.dataKeyDetails[key].includes("预计") && tmpFlow.dataKeyDetails[key].includes("数量")) {
                                            containYuJiTagKeys.push(key)
                                        }
                                    }
                                    for (const containYuJiTagKey of containYuJiTagKeys) {
                                        delete tmpFlow.dataKeyDetails[containYuJiTagKey]
                                        delete tmpFlow.data[containYuJiTagKey]
                                    }
                                }

                                const dataStatResult = await userFlowDataStatCB(operatorActivity, tmpFlow)
                                if (dataStatResult.length > 0) {
                                    userFlowDataStat = {
                                        processInstanceId,
                                        flowData: dataStatResult
                                    }
                                }
                            }

                            if (userFlows.length > 0 && userFlows[0].ids && userFlows[0].ids.length > 0) {
                                // 避免一人在同一流程中干多个活重复计算
                                if (!userFlows[0].ids.includes(processInstanceId)) {
                                    userFlows[0].ids.push(processInstanceId)
                                    userFlows[0].sum = userFlows[0].ids.length
                                    userFlowDataStat && userFlows[0].userFlowsDataStat.push(userFlowDataStat)
                                }
                            } else {
                                userFlows = {
                                    userName: operatorActivity.userName,
                                    sum: 1,
                                    ids: [processInstanceId],
                                    userFlowsDataStat: userFlowDataStat ? [userFlowDataStat] : []
                                }
                                if (matchedActivity.isOverDue) {
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
