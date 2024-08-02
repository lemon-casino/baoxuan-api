const _ = require("lodash")
const Bignumber = require("bignumber.js")
const userCommonService = require("@/service/common/userCommonService")
const coreActionStatTypeConst = require("@/const/coreActionStatTypeConst")
const coreActionStatService = require("@/service/activity/coreActionStatService")
const regexConst = require("@/const/regexConst")
const visionConst = require("@/const/tmp/visionConst")
const statResultTemplateConst = require("@/const/statResultTemplateConst")
const redisConst = require("@/const/redisConst")
const flowUtil = require("@/utils/flowUtil")
const algorithmUtil = require("@/utils/algorithmUtil")
const redisUtil = require("@/utils/redisUtil")
const patchUtil = require("@/patch/patchUtil")
const NotFoundError = require("@/error/http/notFoundError")
const coreActionPostHandler = require("../coreActionPostHandler")
const coreActionPreHandler = require("../coreActionPreHandler")

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
    const coreActionConfig = await getFirstExistDeptCoreActionsConfig(deptIds)
    
    const flows = await coreActionPreHandler.getFlows(coreActionConfig, startDoneDate, endDoneDate)
    
    let requiredUsers = await coreActionPreHandler.getUsersWithAdmin(userId, deptIds, userNames)
    requiredUsers = filterUsersByTags(requiredUsers, tags)
    
    // 基于人的汇总(最基本的明细统计)
    const actionStatBasedOnUserResult = await coreActionStatService.stat(requiredUsers, flows, coreActionConfig, statVisionUserFlowData)
    
    // 区分核心动作、核心人员统计
    const isFromCoreActionMenu = statType === coreActionStatTypeConst.StatAction
    
    let finalResult = []
    // 核心动作统计不用标签区分
    if (isFromCoreActionMenu) {
        finalResult = _.cloneDeep(actionStatBasedOnUserResult)
        // finalResult = algorithmUtil.removeTargetKey(finalResult, "children", "userFlowsDataStat")
        
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
                const tmpUserTags = user.tags.filter(item => item.tagCode === tagCode)
                if (tmpUserTags.length > 0) {
                    return true
                }
            }
            return false
        })
    }
    return users
}

/**
 *
 * 统计视觉部员工的流程表单数据
 *
 * @param userTags 用户标签
 * @param flow
 * @param rectifyDataParams 纠正数据的参数
 * @returns {Promise<*|*[]>}
 */
const statVisionUserFlowData = async (resultNode, ownerActivity, flow) => {
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
            return userTagCodes.filter(tagCode => tagCode === item.tagCode).length > 0
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
    const result = removeFormFieldNameKWs(notEmptyFlowDataStat)
    return result
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
    const tmpFlow = _.cloneDeep(flow)
    // 进行中的工作会统计表单中预计的数量 完成后需要排除掉预计的数量， 表单标识有【预计】字样
    if (actionName.includes("完")) {
        const containYuJiTagKeys = []
        for (const key of Object.keys(tmpFlow.dataKeyDetails)) {
            if (tmpFlow.dataKeyDetails[key].includes("预计") && tmpFlow.dataKeyDetails[key].includes("数量")) {
                containYuJiTagKeys.push(key)
            }
        }
        for (const containYuJiTagKey of containYuJiTagKeys) {
            delete tmpFlow.dataKeyDetails[containYuJiTagKey]
            delete tmpFlow.data[containYuJiTagKey]
        }
    }
    return tmpFlow
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
    getCoreActionStat
}