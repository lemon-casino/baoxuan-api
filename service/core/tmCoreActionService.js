const _ = require("lodash")
const coreActionStatService = require("@/service/core/coreActionStatService")
const userCommonService = require("@/service/common/userCommonService")
const coreActionStatTypeConst = require("@/const/coreActionStatTypeConst")
const flowRepo = require("@/repository/flowRepo")
const flowUtil = require("@/utils/flowUtil")

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