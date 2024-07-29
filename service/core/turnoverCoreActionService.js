const _ = require("lodash")
const bignumber = require("bignumber.js")
const coreActionStatService = require("@/service/core/coreActionStatService")
const userCommonService = require("@/service/common/userCommonService")
const coreActionStatTypeConst = require("@/const/coreActionStatTypeConst")
const flowRepo = require("@/repository/flowRepo")
const flowUtil = require("@/utils/flowUtil")

// 仓外库存调整差异流程
const flowIds = ["FORM-NO7665914UHBI1LH7C79CAD8H08D3FL35MPILA"]
// 退残单金额字段
const formItemId = "textField_lq3df47j"

const statTurnoverUserFlowData = async (userActivity, flow) => {
    // 需要对退残冲抵账目动作统计退残单金额
    const result = []
    if (flowIds.includes(flow.formUuid) && Object.keys(flow.data).includes(formItemId)) {
        result.push({
            nameCN: "汇总",
            workload: flow.data["textField_lq3df47j"] || "0",
            children: [
                {
                    fieldId: formItemId,
                    fieldName: "退残单金额",
                    value: flow.data["textField_lq3df47j"] || "0"
                }
            ]
        })
    }
    return result
}

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
        statTurnoverUserFlowData
    )
    
    let finalResult = []
    if (statType === coreActionStatTypeConst.StatUser) {
        const userStatArr = coreActionStatService.convertToUserActionResult(requiredUsers, actionStatBasedOnUserResult)
        for (const userStat of userStatArr) {
            userStat.children.push(coreActionStatService.createFlowDataStatNode(userStat, "退残单金额", ""))
            finalResult.unshift(userStat)
        }
    } else {
        finalResult = actionStatBasedOnUserResult
        const statusStatFlowResult = coreActionStatService.convertToFlowStatResult(true, flows, coreActionConfig, actionStatBasedOnUserResult)
        finalResult.unshift({
            actionName: "流程汇总", actionCode: "sumFlowStat", children: statusStatFlowResult
        })
    }
    return flowUtil.statIdsAndSumFromBottom(finalResult)
}

module.exports = {
    getCoreActionStat
}