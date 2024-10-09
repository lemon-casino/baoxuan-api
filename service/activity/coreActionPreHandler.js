const userCommonService = require("@/service/common/userCommonService")
const coreActionStatService = require("@/service/activity/coreActionStatService")
const globalGetter = require("@/global/getter")
const redisUtil = require("@/utils/redisUtil");
const redisConst = require("@/const/redisConst");
const algorithmUtil = require("@/utils/algorithmUtil");
const NotFoundError = require("@/error/http/notFoundError");
const userRepo = require('../../repository/userRepo')
const {
    designerTags,
    photographerSort, 
    statItem,
    statLeaderItem, 
    statItem3, 
    leaderItemField,
    memberItem,
    photographerTags,
    designerSort,
    photographerChild
} = require('../../const/newFormConst')

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
        throw new NotFoundError(`部门${deptNames.join(",")}没找到抓取动作的配置信息`)
    }
    return JSON.parse(coreActionConfigStr)
}

const getMainDesigner = async (userNames) => {
    let designers = await userRepo.getUsersByTagCodesAndNickname(userNames, [designerTags[0]], true)
    let names = []
    for (let i = 0; i < designers.length; i++) {
        names.push(designers[i].nickname)
    }
    return names
}

const getDesigner = async () => {
    let designers = await userRepo.getUsersWithTagsByTagCodes(designerTags)
    let users = []
    for (let i = 0; i < designers.length; i++) {
        users.push({
            name: designers[i].nickname,
            position: designers[i].tag_name,
            sort: designerSort[designers[i].tag_code],
        })
    }
    return users
}

const getPhotographerGroup = async (userNames) => {
    let photographerInfo = await userRepo.getUsersByTagCodesAndNickname(userNames, photographerTags, false)
    let group = [], users = []
    let defaultInfo = JSON.parse(JSON.stringify(statItem))
    defaultInfo.actionName = '摄影组'
    defaultInfo.member = []
    for (let i = 0; i < statLeaderItem[2].child.length; i++) {
        let chil = JSON.parse(JSON.stringify(statItem))
        chil.actionName = statItem3[statLeaderItem[2].child[i]].name
        chil.actionCode = statItem3[statLeaderItem[2].child[i]].code
        // for (let k = 0; k < photographerChild.item.length; k++) {
        //     let ch = JSON.parse(JSON.stringify(statItem))
        //     let chil_key = photographerChild.item[k]
        //     ch.actionName = leaderItemField[chil_key].name
        //     ch.type = chil_key
        //     chil.children.push(ch)
        // }
        defaultInfo.children.push(chil)
    }
    group.push(JSON.parse(JSON.stringify(defaultInfo)))
    for (let i = 0; i < photographerInfo.length; i++) {
        let sort = photographerSort[photographerInfo[i].tag_code]
        let member = JSON.parse(JSON.stringify(memberItem))
        member.name = photographerInfo[i].nickname
        member.position = photographerInfo[i].tag_name
        member.sort = sort
        users.push(photographerInfo[i].nickname)
        group[0].member.push(member)
    }
    return { group, users }
}

module.exports = {
    getFirstExistDeptCoreActionsConfig,
    getUsers,
    getFlows,
    getMainDesigner,
    getDesigner,
    getPhotographerGroup,
}