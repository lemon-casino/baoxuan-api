const _ = require("lodash")
const Bignumber = require("bignumber.js")
const userCommonService = require("@/service/common/userCommonService")
const coreActionStatTypeConst = require("@/const/coreActionStatTypeConst")
const coreActionStatService = require("@/service/activity/coreActionStatService")
const regexConst = require("@/const/regexConst")
const visionConst = require("@/const/tmp/visionConst")
const statResultTemplateConst = require("@/const/statResultTemplateConst")
const flowUtil = require("@/utils/flowUtil")
const patchUtil = require("@/patch/patchUtil")
const coreActionPostHandler = require("../coreActionPostHandler")
const coreActionPreHandler = require("../coreActionPreHandler")
const newFormRepo = require('../../../repository/newFormsRepo')
const { 
    statItem,
    statItem1,
    statItem2,
    statItem3,
    statItem4,
    totalStat,
    statLeaderItem,
    leaderItemField,
    totalCode,
    totalName,
    retouchList, 
    nameFilter
} = require('../../../const/newFormConst')

/**
 *
 *
 * @param type 美编的type区分：总览（）、内部视频（innerPhotography）、内部美编（innerPs）、外包视频（outPhotography）、外包美编（outPs）
 * @param userId
 * @param deptIds
 * @param userNames
 * @param startDoneDate
 * @param endDoneDate
 * @returns {Promise<*>}
 */
const getCoreActionStat = async (statType, tags, userId, deptIds, userNames, startDoneDate, endDoneDate) => {
    const coreActionConfig = await coreActionPreHandler.getFirstExistDeptCoreActionsConfig(deptIds)
    let requiredUsers = await coreActionPreHandler.getUsers(userId, deptIds, userNames, true)
    requiredUsers = filterUsersByTags(requiredUsers, tags)
    
    const flows = await coreActionPreHandler.getFlows(coreActionConfig, startDoneDate, endDoneDate)
    
    // 基于人的汇总(最基本的明细统计)
    const actionStatBasedOnUserResult = await coreActionStatService.stat(requiredUsers, flows, coreActionConfig, statVisionUserFlowData)
    
    // 区分核心动作、核心人员统计
    const isFromCoreActionMenu = statType === coreActionStatTypeConst.StatAction
    
    let finalResult = []
    // 核心动作统计不用标签区分
    if (isFromCoreActionMenu) {
        finalResult = _.cloneDeep(actionStatBasedOnUserResult)
        
        for (const item of finalResult) {
            const workloadNode = coreActionPostHandler.createFlowDataStatNode(item, "工作量", "该工作量会统计表单中预计的数据")
            item.children.push(workloadNode)
        }
        
        const sumUserActionStatResult = coreActionPostHandler.sumUserActionStat(actionStatBasedOnUserResult)
        finalResult.unshift(coreActionPostHandler.generateNewActionResult("工作量汇总", "sumActStat", sumUserActionStatResult))
        
        const isDeptLeader = await userCommonService.isDeptLeaderOfTheUser(userId, deptIds)
        if (isDeptLeader) {
            const differentForms = coreActionStatService.extractInnerAndOutSourcingFormsFromConfig(coreActionConfig)
            // 对内部的流程进行转化统计
            const innerFormIds = differentForms.inner.map(item => item.formId)
            const innerFlows = flows.filter(item => innerFormIds.includes(item.formUuid))
            const innerStatusStatFlowResult = coreActionPostHandler.convertToFlowStatResult(
                false,
                innerFlows,
                coreActionConfig,
                actionStatBasedOnUserResult
            )
            finalResult.unshift(coreActionPostHandler.generateNewActionResult("流程汇总(内部)", "sumFlowStat", innerStatusStatFlowResult))
            
            // 对外包的流程进行转化统计
            const outSourcingFormIds = differentForms.outSourcing.map(item => item.formId)
            const outSourcingFlows = flows.filter(item => outSourcingFormIds.includes(item.formUuid))
            const outSourcingStatusStatFlowResult = coreActionPostHandler.convertToFlowStatResult(
                false,
                outSourcingFlows,
                coreActionConfig,
                actionStatBasedOnUserResult
            )
            finalResult.unshift(coreActionPostHandler.generateNewActionResult("流程汇总(外包)", "sumFlowStat", outSourcingStatusStatFlowResult))
            
            const statusStatFlowResult = coreActionPostHandler.convertToFlowStatResult(
                false,
                flows,
                coreActionConfig,
                actionStatBasedOnUserResult
            )
            finalResult.unshift(coreActionPostHandler.generateNewActionResult("流程汇总", "sumFlowStat", statusStatFlowResult))
        }
    }
    // 核心人的统计用标签区分
    else {
        const userStatArr = coreActionStatService.convertToUserActionResult(requiredUsers, actionStatBasedOnUserResult)
        for (const userStat of userStatArr) {
            userStat.children.push(coreActionPostHandler.createFlowDataStatNode(userStat, "工作量", "该工作量会统计表单中预计的数据"))
            finalResult.unshift(userStat)
        }
    }
    return flowUtil.statIdsAndSumFromBottom(finalResult)
}

const getUsersStat = async (tags, deptIds, userId, userNames, start, end) => {
    let requiredUsers = await coreActionPreHandler.getUsers(userId, deptIds, userNames, true)
    requiredUsers = filterUsersByTags(requiredUsers, tags)
    let names = []
    for (let i = 0; i < requiredUsers.length; i++) {
        if (requiredUsers[i].nickname?.indexOf('已离职') == -1) names.push(requiredUsers[i].nickname)
        else if (requiredUsers[i].userName) names.push(requiredUsers[i].userName)
    }
    const result = await newFormRepo.getProcessStat(names, tags[0], start, end)
    return result
}

/**
 * 获取核心动作数据
 * @param {*} start 
 * @param {*} end 
 * @returns 
 */
const getStat = async (start, end) => {
    let result = []
    for (let i = 0; i < statItem1.length; i++) {
        let info = JSON.parse(JSON.stringify(statItem))
        info.actionName = statItem1[i].name
        info.actionCode = statItem1[i].code
        for (let j = 0; j < statItem2.length; j++) {
            let child = JSON.parse(JSON.stringify(statItem))
            child.actionName = statItem2[j].name
            for (let k = 0; k < statItem3.length; k++) {
                let chil = JSON.parse(JSON.stringify(statItem))
                chil.actionName = statItem3[k].name
                chil.actionCode = statItem3[k].code
                for (let h = 0; h < statItem4.length; h++) {
                    let chi = JSON.parse(JSON.stringify(statItem))
                    chi.actionName = statItem4[h].name
                    chi.actionCode = statItem4[h].code
                    chil.children.push(chi)
                }
                child.children.push(chil)
            }
            info.children.push(child)
        }
        result.push(info)
    }

    for (let i = 0; i < retouchList.length; i++) {
        let child = JSON.parse(JSON.stringify(statItem))
        child.actionName = retouchList[i].name
        child.actionCode = retouchList[i].code
        result[3].children.push(child)
    }

    let info = JSON.parse(JSON.stringify(statItem))
    info.actionCode = totalCode
    info.actionName = totalName
    for (let i = 0; i < totalStat.length; i++) {
        let child = JSON.parse(JSON.stringify(statItem))
        for (let j = 0; j < statItem4.length; j++) {
            let chil = JSON.parse(JSON.stringify(statItem))
            for (let k = 0; k < statItem2.length; k++) {
                let chi = JSON.parse(JSON.stringify(statItem))
                chi.actionName = statItem2[k].name
                chil.children.push(chi)
            }
            chil.actionName = statItem4[j].name
            chil.actionCode = statItem4[j].code
            child.children.push(chil)
        }
        child.actionName = totalStat[i].name
        info.children.push(child)
    }
    result.push(info)

    for (let i = 0; i < statItem2.length; i++) {
        let child = JSON.parse(JSON.stringify(statItem))
        for (let j = 0; j < totalStat.length; j++) {
            let chil = JSON.parse(JSON.stringify(statItem))
            for (let k = 0; k < statItem4.length; k++) {
                let chi = JSON.parse(JSON.stringify(statItem))
                chi.actionName = statItem4[k].name
                chi.actionCode = statItem4[k].code
                chil.children.push(chi)
            }
            chil.actionName = totalStat[j].name
            child.children.push(chil)
        }
        child.actionName = statItem2[i].name
        result.push(child)
    }
    result = await newFormRepo.getStat(result, start, end)
    return result
}

/**
 * 获取视觉总监面板数据
 * @param {*} tags 
 * @param {*} start 
 * @param {*} end 
 * @returns 
 */
const getLeaderStat = async (tags, start, end) => {
    let result = []
    for (let i = 0; i < statLeaderItem.length; i++) {
        let info = JSON.parse(JSON.stringify(statItem))
        info.actionName = statLeaderItem[i].name
        info.actionCode = statLeaderItem[i].code
        for (let j = 0; j < statLeaderItem[i].child.length; j++) {
            let child = JSON.parse(JSON.stringify(statItem))
            child.actionName = statItem3[statLeaderItem[i].child[j]].name
            child.actionCode = statItem3[statLeaderItem[i].child[j]].code
            let child_key = statLeaderItem[i].child[j]
            for (let k = 0; k < statLeaderItem[i].childItem[child_key]?.length; k++) {
                let field_key = statLeaderItem[i].childItem[child_key][k]
                if (leaderItemField[field_key].display == 0) {
                    let childInfo = await newFormRepo.getVisionField(start, end, tags[0], child_key, i, field_key)
                    for (let h = 0; h < childInfo.length; h++) {
                        let cItem = JSON.parse(JSON.stringify(statItem))
                        cItem.actionName = childInfo[h].value
                        cItem.type = field_key
                        cItem.sum = childInfo[h].count
                        child.children.push(cItem)
                    }
                } else if (leaderItemField[field_key].display == 2) {
                    let childInfo = await newFormRepo.getVisionField(start, end, tags[0], child_key, i, field_key)
                    let cItem = JSON.parse(JSON.stringify(statItem))
                    cItem.actionName = leaderItemField[field_key].name                    
                    cItem.type = field_key
                    for (let h = 0; h < childInfo.length; h++) {
                        if (leaderItemField[field_key].map == 'like') {
                            if (childInfo[h].value.indexOf(leaderItemField[field_key].data) == -1)
                                cItem.sum += childInfo[h].count
                        } else {
                            if (childInfo[h].value == leaderItemField[field_key].data)
                                cItem.sum += childInfo[h].count
                        }
                    }
                    child.children.push(cItem)
                } else {
                    let childInfo = await newFormRepo.getVisionType(start, end, tags[0], child_key, i)
                    let cInfo = []
                    for (let h = 0; h < leaderItemField[field_key].data.length; h++) {
                        let cItem = JSON.parse(JSON.stringify(statItem))
                        cItem.actionName = leaderItemField[field_key].data[h]                        
                        cItem.type = field_key
                        cItem.field_type = h
                        cInfo.push(cItem)
                    }
                    for (let h = 0; h < childInfo.length; h++) {
                        for (let l = 0; l < leaderItemField[field_key].map[childInfo[h].vision_type].length; l++) {
                            let iInfo = leaderItemField[field_key].map[childInfo[h].vision_type][l]
                            cInfo[iInfo].sum += childInfo[h].count
                        }
                    }
                    child.children.push(...cInfo)
                }
            }            
            info.children.push(child)
        }
        result.push(info)
    }
    result = await newFormRepo.getLeaderStat(result, start, end)
    return result
}

/**
 * 获取主设面板数据
 * @param {*} userNames 
 * @param {*} start 
 * @param {*} end 
 * @returns 
 */
const getMainDesignerStat = async (userNames, start, end) => {
    userNames = await coreActionPreHandler.getMainDesigner(userNames)
    let group = [], userGroup = {}
    for (let i = 0; i < userNames.length; i++) {
        let info = JSON.parse(JSON.stringify(statItem))
        info.actionName = userNames[i]
        for (let j = 0; j < statLeaderItem[2].child.length; j++) {
            let child_key = statLeaderItem[2].child[j]
            let child = JSON.parse(JSON.stringify(statItem))
            child.actionName = statItem3[child_key].name
            child.actionCode = statItem3[child_key].code
            for (let k = 0; k < statLeaderItem[2].childItem[child_key].length; k++) {
                const ch_key = statLeaderItem[2].childItem[child_key][k]
                let ch = JSON.parse(JSON.stringify(statItem))
                ch.actionName = leaderItemField[ch_key].name
                ch.type = ch_key
                child.children.push(ch)
            }
            info.children.push(child)
        }
        group.push(info)
        if (nameFilter[userNames[i]]) userGroup[nameFilter[userNames[i]]] = i
        userGroup[userNames[i]] = i
    }
    let result = await newFormRepo.getDesignerFlowStat(userNames, start, end)
    for (let i = 0; i < result.length; i++) {
        let child_key = statLeaderItem[2].childMap[result[i].type]
        let group_id = userGroup[result[i].operator_name]
        group[group_id].children[child_key].sum += result[i].count
    }
    result = await newFormRepo.getDesignerNodeStat(group, start, end)
    for (let i = 0; i < result.length; i++) {
        let child_key = statLeaderItem[2].childMap[result[i].type]
        let ch_key = statLeaderItem[2].childItemMap[result[i].type][result[i].vision_type]
        group[result[i].group_id]
            .children[child_key]
            .children[ch_key]
            .sum = result[i].count
    }
    return group
}

const getDesignerStat = async (userNames, start, end) => {
    let group = []
    let result = await newFormRepo.getDesignerFlowStat(userNames, start, end)
    for (let i = 0; i < result.length; i++) {
        if (i == 0 || (result[i].operator_name != result[i-1].operator_name)) {
            let info = JSON.parse(JSON.stringify(statItem))
            info.actionName = result[i].operator_name
            for (let j = 0; j < statLeaderItem[2].child.length; j++) {
                let child = JSON.parse(JSON.stringify(statItem))
                child.actionName = statItem3[statLeaderItem[2].child[j]].name
                child.actionCode = statItem3[statLeaderItem[2].child[j]].code
                for (let k = 0; k < statLeaderItem[2].childItem[statLeaderItem[2].child[j]].length; k++) {
                    let ch = JSON.parse(JSON.stringify(statItem))
                    let ch_key = statLeaderItem[2].childItem[statLeaderItem[2].child[j]][k]
                    ch.actionName = leaderItemField[ch_key].name
                    ch.type = ch_key
                    child.children.push(ch)
                }
                info.children.push(child)
            }
            group.push(info)
        }
        let child_key = statLeaderItem[2].childMap[result[i].type]
        group[group.length - 1].children[child_key].sum = result[i].count
    }
    if (group.length) {
        result = await newFormRepo.getDesignerNodeStat(group, start, end)
        for (let i = 0; i < result.length; i++) {
            let child_key = statLeaderItem[2].childMap[result[i].type]
            let ch_key = statLeaderItem[2].childItemMap[result[i].type][result[i].vision_type]
            group[result[i].group_id]
                .children[child_key]
                .children[ch_key]
                .sum = result[i].count
        }
    }
    return group
}

const getDesignerDetails = async (users, action, start, end) => {
    let type
    for (let i = 0; i < statItem3.length; i++) {
        if (statItem3[i].code == action) {
            type = i
            break
        }
    }
    let name = users[0].name
    let userGroup = {}, userDelete = {}
    users = await coreActionPreHandler.getDesigner()
    for (let i = 0; i < users.length; i++) {
        userGroup[users[i].name] = i
        if (nameFilter[users[i].name]) userGroup[nameFilter[users[i].name]] = i
    }
    let details = await newFormRepo.getDesignerStat(name, type, start, end)
    for (let j = 0; j < details.length; j++) {
        let user_id = userGroup[details[j].operator_name]
        if (user_id != undefined) {
            users[user_id][details[j].title] = users[user_id][details[j].title] ? 
                users[user_id][details[j].title] + parseInt(details[j].count) : 
                parseInt(details[j].count)
            userDelete[user_id] = 1
        }
    }
    for (let i = 0, j = 0; i != users.length; j++) {
        if (!userDelete[j]) users.splice(i, 1)
        else i = i + 1
    }
    users.sort((a, b) => a.sort - b.sort)
    let title = await newFormRepo.getVisionFieldName('insideArt')
    title = [{ title: '姓名', value: 'name'}, { title: '岗位', value: 'position' }].concat(title)
    return { users, title }
}

/**
 * 获取拍摄主管面板
 * @param {*} userNames 
 * @param {*} start 
 * @param {*} end 
 * @returns 
 */
const getPhotographerStat = async (userNames, start, end) => {
    let { group, users } = await coreActionPreHandler.getPhotographerGroup(userNames)
    let result = await newFormRepo.getPhotographerFlowStat(users, start, end)
    for (let i = 0; i < result.length; i++) {
        let child_key = statLeaderItem[2].childMap[result[i].type]
        group[0].children[child_key].sum = result[i].count
    }
    result = await newFormRepo.getPhotographerNodeStat(users, start, end)
    for (let i = 0; i < result.length; i++) {
        let child_key = statLeaderItem[2].childMap[result[i].type]
        let ch_key = statLeaderItem[2].childItemMap[result[i].type][result[i].vision_type]
        group[0]
            .children[child_key]
            .children[ch_key]
            .sum = result[i].count
    }
    return group
}

const getPhotographerDetails = async (users, action, start, end) => {
    let type
    for (let i = 0; i < statItem3.length; i++) {
        if (statItem3[i].code == action) type = i
    }
    for (let i = 0; i < users.length; i++) {
        let details = await newFormRepo.getPhotographerStat(users[i].name, type, start, end)
        for (let j = 0; j < details.length; j++) {
            users[i][details[j].title] = details[j].count
        }
    }    
    let title = await newFormRepo.getVisionFieldName('insidePhoto')
    title = [{ title: '姓名', value: 'name'}, { title: '岗位', value: 'position' }].concat(title)
    return { users, title }
}

/**
 * 根据tags过滤用户
 *
 * @param users
 * @param tags
 * @returns {*}
 */
const filterUsersByTags = (users, tags) => {
    // 根据标签对前面获取的所有用户进行筛选
    if (tags && tags.length > 0) {
        users = users.filter(user => {
            if (!user.tags) {
                return false
            }
            
            for (const tagCode of tags) {
                const tmpUserTags = user.tags.find(uTag => uTag.tagCode === tagCode)
                if (tmpUserTags) {
                    return true
                }
            }
            return false
        })
    }
    return users
}

/**
 *  统计视觉部员工的流程表单数据
 * @param resultNode
 * @param ownerActivity
 * @param flow
 * @returns {*|*[]|null}
 */
const statVisionUserFlowData = (resultNode, ownerActivity, flow) => {
    const {fullActionName} = resultNode
    
    // 获取该人在该流程中当前表单的数据进行汇总(进行中、已完成)
    if (!fullActionName || (!fullActionName.includes("中") && !fullActionName.includes("完"))) {
        return null
    }
    
    // 当前用户统计到的节点需要时正在干活的节点才要汇总表单信息
    let {actionName, tags: userTags, activity} = ownerActivity
    
    // 没有标签的用户直接返回空模板
    if (!userTags || userTags.length === 0) {
        return []
    }
    
    let userTagCodes = userTags.map(item => item.tagCode)
    
    const userTmpTags = patchUtil.getUserTmpTags(actionName, flow.processInstanceId)
    userTagCodes = userTagCodes.concat(userTmpTags)
    
    // 仅对内部美编人员的节点做判断
    const insideArtTagCode = userTagCodes.find(tagCode => tagCode === "insideArt")
    // 内部美编会涵盖剪辑组标签的人：不能排除掉剪辑组的标签节点
    if (insideArtTagCode) {
        let validActivity = false
        const standardVisionActivityNamePattern = "^.*修图$"
        let validVisionActivityNamePatternForStatFormData = visionConst.confusedActivityNameForStatFormData.concat(standardVisionActivityNamePattern)
        const clipGroupCode = userTagCodes.find(tagCode => tagCode === "clipGroup")
        const clipGroupActivityNamePattern = ["^.*剪辑.*$", "执行人"]
        if (clipGroupCode) {
            validVisionActivityNamePatternForStatFormData = validVisionActivityNamePatternForStatFormData.concat(clipGroupActivityNamePattern)
        }
        for (const pattern of validVisionActivityNamePatternForStatFormData) {
            if (new RegExp(pattern).test(activity.showName)) {
                validActivity = true
                break
            }
        }
        if (!validActivity) {
            return []
        }
    }
    
    const visionUserFlowDataStatResultTemplate = _.cloneDeep(statResultTemplateConst.visionUserFlowDataStatResultTemplate)
    
    const userTagsFormItemKeywordsMappings = visionConst.getCompletedTagsFormItemKeywordsMapping(flow.formUuid)
        .filter(item => {
            return !!userTagCodes.find(tagCode => tagCode === item.tagCode)
        })
    
    if (userTagsFormItemKeywordsMappings.length === 0) {
        return []
    }
    
    flow = preHandleFlowData(fullActionName, flow)
    const userRequiredFieldIds = getUserRequiredFieldIdsByKWMapping(flow.dataKeyDetails, userTagsFormItemKeywordsMappings)
    
    const userRequiredFields = getNotEmptyUserRequiredFields(userRequiredFieldIds, flow.data, flow.dataKeyDetails)
    
    // 根据关键词将这些用户需要的表单信息分类统计
    for (const userRequiredField of userRequiredFields) {
        const resultNode = getResultNode(userRequiredField.fieldName, visionUserFlowDataStatResultTemplate)
        if (resultNode) {
            if (regexConst.floatNumberReg.test(userRequiredField.value)) {
                resultNode.workload = new Bignumber(resultNode.workload).plus(userRequiredField.value).toNumber()
                resultNode.children.push(userRequiredField)
            }
        }
    }
    
    const notEmptyFlowDataStat = visionUserFlowDataStatResultTemplate.filter(item => item.children.length > 0)
    return removeFormFieldNameKWs(notEmptyFlowDataStat)
}


/**
 * 预处理flow的data 数据
 * 如果 actionName中包含“完”关键字，则过滤表单中含有“预计”字样的项
 *
 * @param actionName
 * @param flow
 * @returns {unknown}
 */
const preHandleFlowData = (actionName, flow) => {
    //llx:const tmpFlow = _.cloneDeep(flow)
    // 进行中的工作会统计表单中预计的数量 完成后需要排除掉预计的数量， 表单标识有【预计】字样
    if (actionName.includes("完")) {
        const containYuJiTagKeys = []
        for (const key of Object.keys(flow.dataKeyDetails)) {
            if (flow.dataKeyDetails[key].includes("预计") && flow.dataKeyDetails[key].includes("数量")) {
                containYuJiTagKeys.push(key)
            }
        }
        for (const yuJiKey of containYuJiTagKeys) {
            delete flow.dataKeyDetails[yuJiKey]
            delete flow.data[yuJiKey]
        }
    }
    return flow
}


const removeFormFieldNameKWs = (flowDataStat) => {
    for (const item of flowDataStat) {
        delete item["formFieldNameKWs"]
    }
    return flowDataStat
}


const isIncludeFormItemKw = (fieldName, includeFormItemKws) => {
    for (const includeFormItemKw of includeFormItemKws) {
        if (fieldName.includes(includeFormItemKw)) {
            return true
        }
    }
    return false
}

const isExcludeFormItemKws = (fieldName, excludeFormItemKws) => {
    for (const excludeFormItemKw of excludeFormItemKws) {
        if (fieldName.includes(excludeFormItemKw)) {
            return false
        }
    }
    return true
}

const isUserRequiredFieldName = (fieldName, userTagsFormItemKeywordsMappings) => {
    for (const formItemKWMapping of userTagsFormItemKeywordsMappings) {
        const {includeFormItemKws, excludeFormItemKws} = formItemKWMapping
        if (isIncludeFormItemKw(fieldName, includeFormItemKws) && isExcludeFormItemKws(fieldName, excludeFormItemKws)) {
            return true
        }
    }
    return false
}

const getUserRequiredFieldIdsByKWMapping = (flowDataKeyDetails, userTagsFormItemKeywordsMappings) => {
    const userRequiredFields = []
    for (const formItemKey of Object.keys(flowDataKeyDetails)) {
        if (isUserRequiredFieldName(flowDataKeyDetails[formItemKey], userTagsFormItemKeywordsMappings)) {
            userRequiredFields.push(formItemKey)
        }
    }
    return userRequiredFields
}

const getNotEmptyUserRequiredFields = (fieldIds, data, dataKeyDetails) => {
    const result = []
    for (const fieldId of fieldIds) {
        if (data[fieldId] && data[fieldId] !== "0") {
            result.push({fieldId, fieldName: dataKeyDetails[fieldId], value: data[fieldId]})
        }
    }
    return result
}

const getResultNode = (fieldName, visionUserFlowDataStatResultTemplate) => {
    const resultNode = visionUserFlowDataStatResultTemplate.find(item => {
        const whichKW = item.formFieldNameKWs.find(kw => fieldName.includes(kw))
        return !!whichKW
    })
    return resultNode
}

module.exports = {
    getCoreActionStat,
    getUsersStat,
    getLeaderStat,
    getDesignerStat,
    getMainDesignerStat,
    getDesignerDetails,
    getPhotographerStat,
    getPhotographerDetails,
    getStat
}