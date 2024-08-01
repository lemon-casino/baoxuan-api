const _ = require("lodash");
const Bignumber = require("bignumber.js")
const {visionFormDoneActivityIds} = require("@/const/tmp/coreActionsConst")
const flowUtil = require("@/utils/flowUtil")
const algorithmUtil = require("@/utils/algorithmUtil")
const {flowReviewTypeConst} = require("@/const/flowConst");
const {opFunctions} = require("@/const/ruleConst/operatorConst");
const operatorConst = require("@/const/ruleConst/operatorConst");


const generateNewActionResult = (actionName, actionCode, data) => {
    return {actionName, actionCode, children: data}
}

/**
 * 对流程进行汇总
 *
 * @param flows
 * @param coreActionConfig
 * @param userStatResult
 * @returns {*[]}
 */
const convertToFlowStatResult = (isStandardStat, flows, coreActionConfig, userStatResult) => {
    
    const resultTemplate = initResultTemplate(userStatResult)
    
    for (const level1ActionResult of resultTemplate) {
        // 从配置 coreActionConfig 中找到类似‘全套-待xxx’中的节点
        for (let level2ActionResult of level1ActionResult.children) {
            const actionNameContainKey = getActionNameContainedKey(level2ActionResult.actionName)
            if (!actionNameContainKey) {
                continue
            }
            
            // 找到同名的配置, 如：全套、半套、散图、视频
            const targetCoreActionConfig = coreActionConfig.filter(item => item.actionName === level1ActionResult.actionName)[0]
            // 找到具有想匹配关键词的状态节点(s)：待拍视频、待入美编
            const hasSameKeyActionConfig = targetCoreActionConfig.children.filter(item => item.actionName.includes(actionNameContainKey))
            
            if (isStandardStat) {
                level2ActionResult = standardStat(flows, hasSameKeyActionConfig, level2ActionResult)
            } else {
                // 待转入和进行中流程的统计，根据配置符合一项计算匹配成功
                if (actionNameContainKey !== "完") {
                    level2ActionResult = standardStat(flows, hasSameKeyActionConfig, level2ActionResult)
                } else {
                    // 已完成流程的统计，仅要看最后的审核节点是否完成即可，对于要统计到逾期和未逾期需要看全部的配置节点
                    // 还要附件上美编的审核节点（审核结束才算真正完成）
                    level2ActionResult = statFlowsToActionByTargetFormActivityIds(
                        flows,
                        level1ActionResult.actionName,
                        hasSameKeyActionConfig,
                        level2ActionResult
                    )
                }
            }
        }
    }
    return resultTemplate
}

const getActionNameContainedKey = (actionName) => {
    const statusKeys = ["待", "中", "完"]
    const actionNameContainKeys = statusKeys.filter(key => actionName.includes(key))
    if (actionNameContainKeys.length === 0) {
        return null
    }
    return actionNameContainKeys[0]
}

const initResultTemplate = (userStatResult) => {
    const overdueConfigTemplate = [{actionName: "逾期", actionCode: "overdue", children: []}, {
        actionName: "未逾期", actionCode: "notOverdue", children: []
    }]
    const flowStatConfigTemplate = [{
        actionName: "待转入", actionCode: "TODO", children: _.cloneDeep(overdueConfigTemplate)
    }, {actionName: "进行中", actionCode: "DOING", children: _.cloneDeep(overdueConfigTemplate)}, {
        actionName: "已完成", actionCode: "DONE", children: _.cloneDeep(overdueConfigTemplate)
    }]
    
    return getFlowSumStructure(_.cloneDeep(userStatResult), flowStatConfigTemplate)
}


/**
 * 标准统计： 将流程按照actionConfigs的规则统计到resultTemplate中
 *
 * @param flows
 * @param actionConfigs
 * @param resultTemplate
 * @returns {*}
 */
const standardStat = (flows, actionConfigs, resultTemplate) => {
    for (const actionConfig of actionConfigs) {
        let {actionName, children: childActions} = actionConfig
        actionName = getPureActionName(actionName) || "合计"
        
        for (const childAction of childActions) {
            if (!childAction.rules) {
                continue
            }
            let overdueResult = resultTemplate.children.find(item => item.actionName === childAction.actionName)
            for (const formRule of childAction.rules) {
                overdueResult = statFlowsToActionByFormRule(flows, formRule, actionName, overdueResult)
            }
        }
    }
    return resultTemplate
}


/**
 * 将包含特定节点的流程统计到statusResult中对应的actionName中
 *
 * @param flows
 * @param filterFlowFieldName
 * @param hasSameKeyActionConfigs
 * @param visionTargetFormDoneActivityIds
 * @param resultTemplate
 * @returns {*}
 */
const statFlowsToActionByTargetFormActivityIds = (flows, filterFlowFieldName, hasSameKeyActionConfigs, resultTemplate) => {
    for (const flow of flows) {
        const targetDoneForm = visionFormDoneActivityIds.find(item => item.formId === flow.formUuid)
        if (!targetDoneForm) {
            continue
        }
        const requiredDoneActivities = flow.overallprocessflow.filter(item => targetDoneForm.doneActivityIds.includes(item.activityId) && item.type === flowReviewTypeConst.HISTORY)
        if (requiredDoneActivities.length === 0) {
            continue
        }
        // 有重复数据
        const combinedRules = algorithmUtil.getAllRequiredKeyValues(hasSameKeyActionConfigs, "children", "rules")
        
        const flowFormRules = combinedRules.filter(rule => rule.formId === flow.formUuid)
        if (flowFormRules.length === 0) {
            continue
        }
        
        let combinedFlowNodeRules = []
        for (const flowFormRule of flowFormRules) {
            combinedFlowNodeRules = combinedFlowNodeRules.concat(flowFormRule.flowNodeRules)
        }
        
        // 流程满足完成的统计条件，将其放到对应的逾期或未逾期节点中
        // 流程中跟该部门相关的所有节点，有一个逾期即算为逾期
        // 判断是否出现过逾期
        let overdueActivity = getOverdueActivity(flow.overallprocessflow, combinedFlowNodeRules)
        const tmpOverdueStatResult = resultTemplate.children.find(item => item.actionName === (overdueActivity ? "逾期" : "未逾期"))
        // 对于完成的流程统计不用区分具体的动作，要不会重复的， 默认为”合计“
        const defaultActionName = "合计"
        if (tmpOverdueStatResult.children.length === 0) {
            tmpOverdueStatResult.children.push({
                actionName: defaultActionName, ids: [flow.processInstanceId]
            })
        } else {
            if (!tmpOverdueStatResult.children[0].ids.includes(flow.processInstanceId)) {
                tmpOverdueStatResult.children[0].ids.push(flow.processInstanceId)
            }
        }
    }
    return resultTemplate
}

const getOverdueActivity = (activities, flowNodeRules) => {
    const flowNodeRulesIds = flowNodeRules.map(item => item.activityId)
    for (const activity of activities) {
        if (flowNodeRulesIds.includes(activity.activityId) && activity.isOverDue === true) {
            return activity
        }
    }
    return null
}

const getFlowSumStructure = (result, flowStatConfigTemplate) => {
    const sumFlowStat = []
    for (const coreActionResult of result) {
        sumFlowStat.push({
            actionName: coreActionResult.actionName,
            actionCode: coreActionResult.actionCode,
            children: _.cloneDeep(flowStatConfigTemplate)
        })
    }
    return sumFlowStat
}

/**
 * 去掉文本中不需要的信息
 *
 * @param text
 * @returns {*}
 */
const getPureActionName = (text) => {
    const uselessKeyText = ["待", "拍", "做", "入", "进", "行", "中", "已", "完", "成"]
    for (const key of uselessKeyText) {
        text = text.replace(key, "")
    }
    return text
}

/**
 * 根据表单规则，将flows汇总到 statusResult中匹配的actionName节点
 *
 * @param flows
 * @param formRule
 * @param actionName
 * @param statusResult
 * @returns {*}
 */
const statFlowsToActionByFormRule = (flows, formRule, actionName, statusResult) => {
    let formFlows = flows.filter(flow => flow.formUuid === formRule.formId)
    if (formFlows.length === 0) {
        return statusResult
    }
    
    if (formRule.flowDetailsRules) {
        for (const detailsRule of formRule.flowDetailsRules) {
            formFlows = formFlows.filter(flow => {
                if (flow.data[detailsRule.fieldId]) {
                    return operatorConst.opFunctions[detailsRule.opCode](flow.data[detailsRule.fieldId], detailsRule.value)
                }
                return false
            })
        }
    }
    
    // 将流程统计到对应结果状态中，包含逾期
    for (const flow of formFlows) {
        const activities = flow.overallprocessflow
        
        // 匹配到一项即算匹配成功
        for (let i = 0; i < formRule.flowNodeRules.length; i++) {
            const flowNodeRule = formRule.flowNodeRules[i]
            
            const {activityId, status, isOverdue} = flowNodeRule
            
            const matchedActivities = activities.filter(item => item.activityId === activityId && status.includes(item.type) && item.isOverDue === isOverdue)
            
            if (matchedActivities.length === 0) {
                continue
            }
            
            const tmpSubActionResult = statusResult.children.find(item => item.actionName === actionName)
            if (tmpSubActionResult) {
                if (!tmpSubActionResult.ids.includes(flow.processInstanceId)) {
                    tmpSubActionResult.ids.push(flow.processInstanceId)
                    tmpSubActionResult.sum = tmpSubActionResult.ids.length
                }
            } else {
                statusResult.children.push({
                    actionName, ids: [flow.processInstanceId]
                })
            }
        }
    }
    return statusResult
}

/**
 * 为节点增加表单中工作量的统计的node
 *
 * @param node
 * @returns {Array}
 */
const createFlowDataStatNode = (node, title, tooltip) => {
    const runningStatNode = node.children.filter(item => item.actionName.includes("中"))
    const completedStatNode = node.children.filter(item => item.actionName.includes("完"))
    const runningFlowDataStatNodes = findAllUserFlowsDataStatNode(runningStatNode)
    const completedFlowDataStatNodes = findAllUserFlowsDataStatNode(completedStatNode)
    const runningWorkload = sumSameNameWorkload(runningFlowDataStatNodes)
    const completedWorkload = sumSameNameWorkload(completedFlowDataStatNodes)
    
    const newWorkloadStatNode = {
        actionName: title, excludeUpSum: true, sumAlone: true, uniqueIds: true, children: [
            {
                actionName: "进行中", tooltip, sumAlone: true, uniqueIds: true, children: runningWorkload,
            },
            {
                actionName: "已完成", sumAlone: true, uniqueIds: true, children: completedWorkload
            }
        ]
    }
    return flowUtil.statSumFromBottom(newWorkloadStatNode)
}

/**
 * 找到节点下所有的 userFlowsDataStat 数据
 *
 * @param topNode
 * @returns {*[]}
 */
const findAllUserFlowsDataStatNode = (topNode) => {
    // 统一转成数组处理
    if (!(_.isArray(topNode))) {
        topNode = [topNode]
    }
    
    let allUserFlowsDataStatNodes = []
    
    for (const node of topNode) {
        if (node.userFlowsDataStat) {
            allUserFlowsDataStatNodes = allUserFlowsDataStatNodes.concat(node.userFlowsDataStat)
        }
        
        if (node.children && node.children.length > 0) {
            const subResult = findAllUserFlowsDataStatNode(node.children)
            allUserFlowsDataStatNodes = allUserFlowsDataStatNodes.concat(subResult)
        }
    }
    
    return allUserFlowsDataStatNodes
}

/**
 * 将流程中对美编核心工作统计对同名的进行汇总
 * statResultTemplateConst下的visionUserFlowDataStatResultTemplate
 *
 * @param flows
 * @returns {*[]}
 */
const sumSameNameWorkload = (flows) => {
    const result = []
    for (const flow of flows) {
        for (const details of flow.flowData) {
            if (!details.workload || details.workload === "0") {
                continue
            }
            const resultNode = result.find(item => item.actionName === details.actionName)
            if (resultNode) {
                if (!resultNode.ids.includes(flow.processInstanceId)) {
                    resultNode.ids.push(flow.processInstanceId)
                }
                resultNode.sum = new Bignumber(resultNode.sum).plus(details.workload).toString()
            } else {
                result.push({
                    actionName: details.actionName, sum: details.workload, ids: [flow.processInstanceId], sumAlone: true
                })
            }
        }
    }
    return result
}

/**
 * 将对人的统计汇总成工作量的统计(按照核心动作名对基于人的统计的汇总)
 *
 * @param userStatResult
 * @returns {*[]}
 */
const sumUserActionStat = (userStatResult) => {
    const activityStatResult = getActivityStatStructure(_.cloneDeep(userStatResult))
    for (const actionStatResult of userStatResult) {
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
                    const subActStatResult = activityStatResult.filter(item => item.actionName === subActStatName)[0]
                    if (subActStatResult) {
                        const subActOverdueStatResult = subActStatResult.children.filter(item => item.actionName === overDueName)[0]
                        return subActOverdueStatResult
                    }
                    return null
                }
                
                const targetActResult = findTargetActResult(subActionResult.actionName, overdueResult.actionName)
                if (targetActResult) {
                    targetActResult.children.push({actionName: coreActionName, ids: ids})
                }
            }
        }
    }
    return activityStatResult
}

/**
 * 获取结果的模板结构
 *
 * @param referenceStatResult
 * @returns {*[]}
 */
const getActivityStatStructure = (referenceStatResult) => {
    const structure = []
    // todo：good idea： 没时间实现了
    // 保留2层深度的结构信息, 将底层基于人的统计信息忽略
    for (const actStat of referenceStatResult) {
        for (const subActStat of actStat.children) {
            const isExist = structure.filter(item => item.actionName === subActStat.actionName).length > 0
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

module.exports = {
    generateNewActionResult,
    convertToFlowStatResult,
    createFlowDataStatNode,
    sumUserActionStat
}