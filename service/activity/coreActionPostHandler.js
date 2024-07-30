const _ = require("lodash");
const Bignumber = require("bignumber.js")
const {visionFormDoneActivityIds} = require("@/const/tmp/coreActionsConst")
const flowUtil = require("@/utils/flowUtil")
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
    
    const statusStatFlowResult = initResultTemplate(userStatResult)
    
    const statusKeyTexts = ["待", "中", "完"]
    for (const actionResult of statusStatFlowResult) {
        // 从配置 coreActionConfig 中找到类似‘全套-待xxx’中的rules
        for (let i = 0; i < actionResult.children.length; i++) {
            let statusResult = actionResult.children[i]
            
            const statusKeyText = statusKeyTexts.filter(key => statusResult.actionName.includes(key))[0]
            // 找到同名的配置, 如：全套、半套、散图、视频
            const targetCoreActionConfig = coreActionConfig.filter(item => item.actionName === actionResult.actionName)[0]
            // 找到具有想匹配关键词的状态节点(s)：待拍视频、待入美编
            const coreActionSameKeyTextConfig = targetCoreActionConfig.children.filter(item => item.actionName.includes(statusKeyText))
            
            if (isStandardStat) {
                statusResult = standardStat(flows, coreActionSameKeyTextConfig, statusResult)
            } else {
                // 待转入和进行中流程的统计，根据配置符合一项计算匹配成功
                if (statusKeyText !== "完") {
                    statusResult = standardStat(flows, coreActionSameKeyTextConfig, statusResult)
                } else {
                    // 已完成流程的统计，仅要看最后的审核节点是否完成即可，对于要统计到逾期和未逾期需要看全部的配置节点
                    // 还要附件上美编的审核节点（审核结束才算真正完成）
                    statusResult = statFlowsToActionByTargetFormActivityIds(flows, actionResult.actionName, coreActionSameKeyTextConfig, visionFormDoneActivityIds, statusResult)
                }
            }
        }
    }
    return statusStatFlowResult
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
 * 标准统计： 将流程按照statusConfigs的规则统计到statusResult中
 *
 * @param flows
 * @param actionConfigs
 * @param statusResult
 * @returns {*}
 */
const standardStat = (flows, actionConfigs, statusResult) => {
    for (const actionConfig of actionConfigs) {
        let {actionName, children: childActions} = actionConfig
        actionName = getPureActionName(actionName) || "合计"
        
        for (const childAction of childActions) {
            if (!childAction.rules) {
                continue
            }
            let overdueResult = statusResult.children.find(item => item.actionName === childAction.actionName)
            for (const formRule of childAction.rules) {
                overdueResult = statFlowsToActionByFormRule(flows, formRule, actionName, overdueResult)
            }
        }
    }
    return statusResult
}


/**
 * 将包含特定节点的流程统计到statusResult中对应的actionName中
 *
 * @param flows
 * @param actionName
 * @param coreActionSameKeyTextConfig
 * @param visionTargetFormDoneActivityIds
 * @param statusResult
 * @returns {*}
 */
const statFlowsToActionByTargetFormActivityIds = (flows, actionName, coreActionSameKeyTextConfig, visionTargetFormDoneActivityIds, statusResult) => {
    for (const flow of flows) {
        const targetDoneForm = visionTargetFormDoneActivityIds.find(item => item.formId === flow.formUuid)
        if (!targetDoneForm) {
            continue
        }
        const requiredDoneActivities = flow.overallprocessflow.filter(item => targetDoneForm.doneActivityIds.includes(item.activityId) && item.type === flowReviewTypeConst.HISTORY)
        if (requiredDoneActivities.length === 0) {
            continue
        }
        
        if (!coreActionSameKeyTextConfig[0].rules) {
            continue
        }
        // 要将多个流程的多个工作项配置合并，用于算逾期，存在一个逾期计算逾期
        const rules = _.cloneDeep(coreActionSameKeyTextConfig[0].rules)
        for (let i = 1; i < coreActionSameKeyTextConfig.length; i++) {
            const tmpRules = coreActionSameKeyTextConfig[i].rules
            if (!tmpRules) {
                continue
            }
            for (const tmpRule of tmpRules) {
                const existRule = rules.find(item => item.formId === tmpRule.formId)
                if (existRule) {
                    existRule.flowNodeRules = existRule.flowNodeRules.concat(tmpRule.flowNodeRules)
                } else {
                    rules.push(tmpRule)
                }
            }
        }
        
        for (const formRule of rules) {
            if (formRule.formId !== flow.formUuid) {
                continue
            }
            // 判断视觉属性是否相同
            let hasSameVisionAttr = false
            for (const detailsRule of formRule.flowDetailsRules || []) {
                hasSameVisionAttr = opFunctions[detailsRule.opCode](flow.data[detailsRule.fieldId], [actionName])
                if (hasSameVisionAttr) {
                    hasSameVisionAttr = true
                    break
                }
            }
            
            if (hasSameVisionAttr) {
                // 判断是否出现过逾期
                let overdueActivity = null
                // 审核节点逾期
                if (requiredDoneActivities[0].isOverDue) {
                    overdueActivity = requiredDoneActivities[0]
                }
                // 非审核节点逾期
                else {
                    for (const flowNodeRule of formRule.flowNodeRules) {
                        const {overdue: overdueNode} = flowNodeRule
                        overdueActivity = flow.overallprocessflow.find(item => item.activityId === overdueNode.id && item.isOverDue)
                        if (overdueActivity) {
                            break
                        }
                    }
                }
                
                const tmpOverdueStatResult = statusResult.children.find(item => item.nameCN === (overdueActivity ? "逾期" : "未逾期"))
                // 对于完成的流程统计不用区分具体的动作，要不会重复的， 默认为”合计“
                const defaultActionName = "合计"
                if (tmpOverdueStatResult.children.length === 0) {
                    tmpOverdueStatResult.children.push({
                        nameCN: defaultActionName, ids: [flow.processInstanceId]
                    })
                } else {
                    if (!tmpOverdueStatResult.children[0].ids.includes(flow.processInstanceId)) {
                        tmpOverdueStatResult.children[0].ids.push(flow.processInstanceId)
                    }
                }
            }
        }
    }
    return statusResult
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
            const resultNode = result.find(item => item.nameCN === details.nameCN)
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

module.exports = {
    generateNewActionResult,
    convertToFlowStatResult,
    createFlowDataStatNode,
    sumUserActionStat
}