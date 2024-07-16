const coreActionStatService = require("@/service/core/coreActionStatService")
const userCommonService = require("@/service/common/userCommonService")
const coreActionStatTypeConst = require("@/const/coreActionStatTypeConst")
const flowRepo = require("@/repository/flowRepo")
const flowUtil = require("@/utils/flowUtil");
const _ = require("lodash");
const {opFunctions} = require("@/const/operatorConst");
const {visionFormDoneActivityIds} = require("@/const/tmp/coreActionsConst");
const {flowReviewTypeConst} = require("@/const/flowConst");

const getCoreActionStat = async (statType, userId, deptIds, userNames, startDoneDate, endDoneDate) => {
    const isDeptLeader = await userCommonService.isDeptLeaderOfTheUser(userId, deptIds)
    const requiredUsers = await coreActionStatService.getRequiredUsers(userNames, isDeptLeader, deptIds, null)

    const coreActionConfig = await flowRepo.getCoreActionsConfig(deptIds)
    const differentForms = coreActionStatService.extractInnerAndOutSourcingFormsFromConfig(coreActionConfig)
    const configuredFormIds = differentForms.inner.concat(differentForms.outSourcing).map(item => item.formId)
    const flows = await coreActionStatService.filterFlows(configuredFormIds, startDoneDate, endDoneDate)

    // 基于人的汇总(最基本的明细统计)
    const actionStatBasedOnUserResult = await coreActionStatService.stat(
        requiredUsers,
        flows,
        coreActionConfig,
        null
    )
    let finalResult = []
    if (statType === coreActionStatTypeConst.StatUser) {
        const userStatArr = coreActionStatService.convertToUserActionResult(requiredUsers, actionStatBasedOnUserResult)
        for (const userStat of userStatArr) {
            finalResult.unshift(userStat)
        }
    } else {
        finalResult = actionStatBasedOnUserResult
        const statusStatFlowResult = convertToFlowStatResult(flows, coreActionConfig, actionStatBasedOnUserResult)
        finalResult.unshift({
            actionName: "流程汇总", actionCode: "sumFlowStat", children: statusStatFlowResult
        })
    }
    return flowUtil.statIdsAndSumFromBottom(finalResult)
}

const convertToFlowStatResult = (flows, coreActionConfig, userStatResult) => {
    const overdueConfigTemplate = [
        {nameCN: "逾期", nameEN: "overdue", children: []},
        {nameCN: "未逾期", nameEN: "notOverdue", children: []}
    ]
    const flowStatConfigTemplate = [
        {nameCN: "待转入", nameEN: "TODO", children: _.cloneDeep(overdueConfigTemplate)},
        {nameCN: "进行中", nameEN: "DOING", children: _.cloneDeep(overdueConfigTemplate)},
        {nameCN: "已完成", nameEN: "DONE", children: _.cloneDeep(overdueConfigTemplate)}
    ]

    const statusKeyTexts = ["待", "中", "完"]
    const statusStatFlowResult = coreActionStatService.getFlowSumStructure(_.cloneDeep(userStatResult), flowStatConfigTemplate)

    for (const actionResult of statusStatFlowResult) {
        for (const statusResult of actionResult.children) {
            const statusKeyText = statusKeyTexts.filter(key => statusResult.nameCN.includes(key))[0]

            const targetCoreActionConfig = coreActionConfig.filter(item => item.actionName === actionResult.nameCN)[0]
            const coreActionSameKeyTextConfig = targetCoreActionConfig.actionStatus.filter(item => item.nameCN.includes(statusKeyText))
            for (const statusConfig of coreActionSameKeyTextConfig) {
                // 获取需要统计到的节点名称
                const getPureActionName = (text) => {
                    const uselessKeyText = ["待", "拍", "入", "进", "行", "中", "已", "完", "成"]
                    for (const key of uselessKeyText) {
                        text = text.replace(key, "")
                    }
                    return text
                }
                const {nameCN, rules} = statusConfig
                // 对于完成的流程统计不用区分具体的动作，要不会重复的
                const actionName = statusKeyText === "完" ? "合计" : getPureActionName(nameCN)

                // 根据表单的统计规则，将流程统计到对应的节点下
                for (const formRule of rules) {
                    let formFlows = flows.filter(flow => flow.formUuid === formRule.formId)
                    if (formRule.flowDetailsRules) {
                        for (const detailsRule of formRule.flowDetailsRules) {
                            formFlows = formFlows.filter(flow => {
                                if (flow.data[detailsRule.fieldId]) {
                                    return opFunctions[detailsRule.opCode](flow.data[detailsRule.fieldId], detailsRule.value)
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
                            const {from: fromNode, to: toNode, overdue: overdueNode} = flowNodeRule
                            const fromNodeMatched = activities.filter(item => item.activityId === fromNode.id && fromNode.status.includes(item.type)).length > 0
                            const toNodeMatched = activities.filter(item => item.activityId === toNode.id && toNode.status.includes(item.type)).length > 0

                            if (!overdueNode) {
                                continue
                            }

                            const overdueActivity = activities.filter(item => item.activityId === overdueNode.id && overdueNode.status.includes(item.type))
                            if (overdueActivity.length === 0) {
                                continue
                            }

                            const needToStatResult = statusResult.children.find(item => item.nameCN === (overdueActivity[0].isOverDue ? "逾期" : "未逾期"))

                            if (fromNodeMatched && toNodeMatched) {
                                const tmpSubActionResult = needToStatResult.children.find(item => item.nameCN === actionName)
                                if (tmpSubActionResult) {
                                    if (!tmpSubActionResult.ids.includes(flow.processInstanceId)) {
                                        tmpSubActionResult.ids.push(flow.processInstanceId)
                                        tmpSubActionResult.sum = tmpSubActionResult.ids.length
                                    }
                                } else {
                                    needToStatResult.children.push({
                                        nameCN: actionName, ids: [flow.processInstanceId]
                                    })
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return statusStatFlowResult
}


module.exports = {
    getCoreActionStat
}