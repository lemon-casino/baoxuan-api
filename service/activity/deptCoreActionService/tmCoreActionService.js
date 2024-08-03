const _ = require("lodash")
const coreActionStatService = require("@/service/activity/coreActionStatService")
const coreActionStatTypeConst = require("@/const/coreActionStatTypeConst")
const coreActionPostHandler =  require("../coreActionPostHandler")
const flowUtil = require("@/utils/flowUtil")
const coreActionPreHandler = require("../coreActionPreHandler")

const getCoreActionStat = async (statType, userId, deptIds, userNames, startDoneDate, endDoneDate) => {
    const requiredUsers = await coreActionPreHandler.getUsers(userId, deptIds, userNames)
    // const coreActionConfig = await flowRepo.getCoreActionsConfig(deptIds)
    const coreActionConfig = await coreActionPreHandler.getFirstExistDeptCoreActionsConfig(deptIds)
    
    const flows = await coreActionPreHandler.getFlows(coreActionConfig, startDoneDate, endDoneDate)

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