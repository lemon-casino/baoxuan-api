const userCommonService = require("@/service/common/userCommonService")
const coreActionStatService = require("@/service/activity/coreActionStatService")
const globalGetter = require("@/global/getter")
const redisUtil = require("@/utils/redisUtil");
const redisConst = require("@/const/redisConst");
const algorithmUtil = require("@/utils/algorithmUtil");
const NotFoundError = require("@/error/http/notFoundError");

const getUsers = async (userId, deptIds, userNames, containAdmins = false) => {
    const isDeptLeader = await userCommonService.isDeptLeaderOfTheUser(userId, deptIds)
    const deptUsers = await coreActionStatService.getRequiredUsers(userNames, isDeptLeader, deptIds, null)
    if (containAdmins) {
        const maxDataAuthorityUsers = await globalGetter.getMaxDataAuthorityUsers()
        return deptUsers.concat(maxDataAuthorityUsers)
    }
    return deptUsers
}

const getFlows = async (coreActionConfig, startDoneDate, endDoneDate) => {
    const differentForms = coreActionStatService.extractInnerAndOutSourcingFormsFromConfig(coreActionConfig)
    const configuredFormIds = differentForms.inner.concat(differentForms.outSourcing).map(item => item.formId)
    return (await coreActionStatService.filterFlows(configuredFormIds, startDoneDate, endDoneDate))
}


/**
 * 获取和心动动作配置信息
 * 不存在，返回NotFoundError
 *
 * @param deptIds
 * @returns {Promise<any>}
 */
const getFirstExistDeptCoreActionsConfig = async (deptIds) => {
    
    let coreActionConfigStr = null
    for (const deptId of deptIds) {
        coreActionConfigStr = await redisUtil.get(`${redisConst.redisKeys.CoreActionRules}:${deptId}`)
        if (coreActionConfigStr) {
            break
        }
    }
    
    if (!coreActionConfigStr) {
        const departmentsStr = await redisUtil.get(redisConst.redisKeys.Departments)
        const departments = JSON.parse(departmentsStr)
        const deptNames = []
        for (const deptId of deptIds) {
            const dept = algorithmUtil.getJsonFromUnionFormattedJsonArr(departments, "dep_chil", "dept_id", deptId)
            if (dept) {
                deptNames.push(dept.name)
            }
        }
        throw new NotFoundError(`部门${deptNames.join(",")}没找到核心动作配置信息`)
    }
    return JSON.parse(coreActionConfigStr)
}

module.exports = {
    getFirstExistDeptCoreActionsConfig,
    getUsers,
    getFlows
}