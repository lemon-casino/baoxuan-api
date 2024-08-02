const _ = require("lodash")
const coreActionStatService = require("@/service/activity/coreActionStatService")
const userCommonService = require("@/service/common/userCommonService")
const coreActionPostHandler = require("../coreActionPostHandler")
const coreActionStatTypeConst = require("@/const/coreActionStatTypeConst")
const flowRepo = require("@/repository/flowRepo")
const flowUtil = require("@/utils/flowUtil")
const coreActionPreHandler = require("../coreActionPreHandler")

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
    const requiredUsers = await coreActionPreHandler.getUsersWithAdmin(userId, deptIds, userNames)
    const coreActionConfig = await flowRepo.getCoreActionsConfig(deptIds)
    const flows = await coreActionPreHandler.getFlows(coreActionConfig, startDoneDate, endDoneDate)
    
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
            userStat.children.push(coreActionPostHandler.createFlowDataStatNode(userStat, "退残单金额", ""))
            finalResult.unshift(userStat)
        }
    } else {
        finalResult = actionStatBasedOnUserResult
        const statusStatFlowResult = coreActionPostHandler.convertToFlowStatResult(true, flows, coreActionConfig, actionStatBasedOnUserResult)
        finalResult.unshift({
            actionName: "流程汇总", actionCode: "sumFlowStat", children: statusStatFlowResult
        })
    }
    return flowUtil.statIdsAndSumFromBottom(finalResult)
}

module.exports = {
    getCoreActionStat
}