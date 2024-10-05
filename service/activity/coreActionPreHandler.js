const userCommonService = require("@/service/common/userCommonService")
const coreActionStatService = require("@/service/activity/coreActionStatService")
const globalGetter = require("@/global/getter")
const redisUtil = require("@/utils/redisUtil");
const redisConst = require("@/const/redisConst");
const algorithmUtil = require("@/utils/algorithmUtil");
const NotFoundError = require("@/error/http/notFoundError");
const userRepo = require('../../repository/userRepo')
const { 
    designGroups, 
    designerTags, 
    designerSort,
    photographerSort, 
    statItem,
    statLeaderItem, 
    statItem3, 
    leaderItemField,
    memberItem,
    photographerTags
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

const getDesignerGroup = async (userNames) => {
    let groupInfo = await userRepo.getUsersByTagCodesAndNickname(userNames, designGroups, true)
    if (groupInfo.length == 1) {
        let users = await userRepo.getUsersByTagCodes([groupInfo[0].tag_code])
        userNames = []
        for (let i = 0; i < users.length; i++) {
            userNames.push(users[i].nickname)
        }
        groupInfo = await userRepo.getUsersByTagCodesAndNickname(userNames, [groupInfo[0].tag_code], true)
    }
    let designerInfo = await userRepo.getUsersByTagCodesAndNickname(userNames, designerTags, false)
    let group = [], userGroup = {}
    let defaultInfo = JSON.parse(JSON.stringify(statItem))
    defaultInfo.member = []
    for (let i = 0; i < groupInfo.length; i++) {
        for (let j = 0; j < designerInfo.length; j++) {
            if (designerInfo[j].id == groupInfo[i].id) {
                groupInfo[i].tag_code2 = designerInfo[j].tag_code
                groupInfo[i].tag_name2 = designerInfo[j].tag_name
                designerInfo.splice(j, 1)
            }
        }
        let child = JSON.parse(JSON.stringify(statItem))
        if (i == 0 || groupInfo[i].tag_code != groupInfo[i-1].tag_code) {
            let info = JSON.parse(JSON.stringify(defaultInfo))
            info.actionName = groupInfo[i].tag_name
            info.actionCode = groupInfo[i].tag_code
            for (let j = 0; j < statLeaderItem[2].child.length; j++) {
                let chil = JSON.parse(JSON.stringify(statItem))
                chil.actionName = statItem3[statLeaderItem[2].child[j]].name
                chil.actionCode = statItem3[statLeaderItem[2].child[j]].code
                let child_key = statLeaderItem[2].child[j]
                for (let k = 0; k < statLeaderItem[2].childItem[child_key].length; k++) {
                    let ch = JSON.parse(JSON.stringify(statItem))
                    let chil_key = statLeaderItem[2].childItem[child_key][k]
                    ch.actionName = leaderItemField[chil_key].name
                    ch.type = chil_key
                    chil.children.push(ch)
                }
                info.children.push(chil)
            }
            group.push(info)
            userGroup[group.length - 1] = []
        }
        child.actionCode = groupInfo[i].user_id
        child.actionName = groupInfo[i].nickname
        let sort = designerSort[groupInfo[i].tag_code2]
        let group_key = group.length - 1
        let member = JSON.parse(JSON.stringify(memberItem))
        member.name = groupInfo[i].nickname
        member.position = groupInfo[i].tag_name2
        member.sort = sort
        group[group_key].member.push(member)
        userGroup[group_key].push(groupInfo[i].nickname)
    }
    return { group, userGroup }
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
        let child_key = statLeaderItem[2].child[i]
        for (let k = 0; k < statLeaderItem[2].childItem[child_key].length; k++) {
            let ch = JSON.parse(JSON.stringify(statItem))
            let chil_key = statLeaderItem[2].childItem[child_key][k]
            ch.actionName = leaderItemField[chil_key].name
            ch.type = chil_key
            chil.children.push(ch)
        }
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
    getDesignerGroup,
    getPhotographerGroup,
}