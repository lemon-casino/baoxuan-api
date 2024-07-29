const userCommonService = require("@/service/common/userCommonService")
const coreActionStatService = require("@/service/activity/coreActionStatService")

const getUsers = async(userId, deptIds, userNames)=>{
    const isDeptLeader = await userCommonService.isDeptLeaderOfTheUser(userId, deptIds)
    return (await coreActionStatService.getRequiredUsers(userNames, isDeptLeader, deptIds, null))
}

const getFlows = async (coreActionConfig, startDoneDate, endDoneDate)=>{
    const differentForms = coreActionStatService.extractInnerAndOutSourcingFormsFromConfig(coreActionConfig)
    const configuredFormIds = differentForms.inner.concat(differentForms.outSourcing).map(item => item.formId)
    return (await coreActionStatService.filterFlows(configuredFormIds, startDoneDate, endDoneDate))
}

module.exports = {
    getUsers,
    getFlows
}