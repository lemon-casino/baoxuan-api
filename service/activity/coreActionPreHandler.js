const userCommonService = require("@/service/common/userCommonService")
const coreActionStatService = require("@/service/activity/coreActionStatService")
const globalGetter = require("@/global/getter")

const getUsersWithAdmin = async (userId, deptIds, userNames) => {
    const isDeptLeader = await userCommonService.isDeptLeaderOfTheUser(userId, deptIds)
    const deptUsers = await coreActionStatService.getRequiredUsers(userNames, isDeptLeader, deptIds, null)
    const maxDataAuthorityUsers = await globalGetter.getMaxDataAuthorityUsers()
    return deptUsers.concat(maxDataAuthorityUsers)
}

const getFlows = async (coreActionConfig, startDoneDate, endDoneDate) => {
    const differentForms = coreActionStatService.extractInnerAndOutSourcingFormsFromConfig(coreActionConfig)
    const configuredFormIds = differentForms.inner.concat(differentForms.outSourcing).map(item => item.formId)
    return (await coreActionStatService.filterFlows(configuredFormIds, startDoneDate, endDoneDate))
}

module.exports = {
    getUsersWithAdmin,
    getFlows
}