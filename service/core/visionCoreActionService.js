const _ = require("lodash")
const Bignumber = require("bignumber.js")
const userRepo = require("@/repository/userRepo")
const outUsersRepo = require("@/repository/outUsersRepo")
const flowRepo = require("@/repository/flowRepo")
const userCommonService = require("@/service/common/userCommonService")
const flowCommonService = require("@/service/common/flowCommonService")
const coreActionStatService = require("@/service/core/coreActionStatService")
const {flowReviewTypeConst, flowStatusConst} = require("@/const/flowConst")
const coreActionStatTypeConst = require("@/const/coreActionStatTypeConst")
const {opFunctions} = require("@/const/operatorConst")
const {visionFormDoneActivityIds} = require("@/const/tmp/coreActionsConst")
const regexConst = require("@/const/regexConst")
const visionConst = require("@/const/tmp/visionConst")
const statResultTemplateConst = require("@/const/statResultTemplateConst")
const flowUtil = require("@/utils/flowUtil")
const algorithmUtil = require("@/utils/algorithmUtil")
const patchUtil = require("@/patch/patchUtil")

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

    const isDeptLeader = await userCommonService.isDeptLeaderOfTheUser(userId, deptIds)
    const requiredUsers = await coreActionStatService.getRequiredUsers(userNames, isDeptLeader, deptIds, (users) => {
        return filterUsersByTags(users, tags)
    })

    const coreActionConfig = await flowRepo.getCoreActionsConfig(deptIds)
    const differentForms = coreActionStatService.extractInnerAndOutSourcingFormsFromConfig(coreActionConfig)
    const configuredFormIds = differentForms.inner.concat(differentForms.outSourcing).map(item => item.formId)
    const flows = await coreActionStatService.filterFlows(configuredFormIds, startDoneDate, endDoneDate)

    // 基于人的汇总(最基本的明细统计)
    const actionStatBasedOnUserResult = await coreActionStatService.stat(
        requiredUsers,
        flows,
        coreActionConfig,
        statVisionUserFlowData
    )

    // 区分核心动作、核心人员统计
    const isFromCoreActionMenu = statType === coreActionStatTypeConst.StatAction
    const finalResult = isFromCoreActionMenu ? _.cloneDeep(actionStatBasedOnUserResult) : []

    for (const item of finalResult) {
        const workloadNode = createFlowDataStatNode(item)
        item.children.push(workloadNode)
    }

    // 核心动作统计不用标签区分
    if (isFromCoreActionMenu) {
        const sumUserActionStatResult = sumUserActionStat(actionStatBasedOnUserResult)
        finalResult.unshift({
            actionName: "工作量汇总", actionCode: "sumActStat", children: sumUserActionStatResult
        })

        if (isDeptLeader) {
            // 对内部的流程进行转化统计
            const innerFormIds = differentForms.inner.map(item => item.formId)
            const innerFlows = flows.filter(item => innerFormIds.includes(item.formUuid))
            const innerStatusStatFlowResult = coreActionStatService.convertToFlowStatResult(false, innerFlows, coreActionConfig, actionStatBasedOnUserResult)
            finalResult.unshift({
                actionName: "流程汇总(内部)", actionCode: "sumFlowStat", children: innerStatusStatFlowResult
            })

            // 对外包的流程进行转化统计
            const outSourcingFormIds = differentForms.outSourcing.map(item => item.formId)
            const outSourcingFlows = flows.filter(item => outSourcingFormIds.includes(item.formUuid))
            const outSourcingStatusStatFlowResult = coreActionStatService.convertToFlowStatResult(false, outSourcingFlows, coreActionConfig, actionStatBasedOnUserResult)
            finalResult.unshift({
                actionName: "流程汇总(外包)", actionCode: "sumFlowStat", children: outSourcingStatusStatFlowResult
            })

            const statusStatFlowResult = coreActionStatService.convertToFlowStatResult(false, flows, coreActionConfig, actionStatBasedOnUserResult)
            finalResult.unshift({
                actionName: "流程汇总", actionCode: "sumFlowStat", children: statusStatFlowResult
            })
        }
    }
    // 核心人的统计用标签区分
    else {
        const userStatArr = coreActionStatService.convertToUserActionResult(requiredUsers, actionStatBasedOnUserResult)
        for (const userStat of userStatArr) {
            userStat.children.push(createFlowDataStatNode(userStat))
            finalResult.unshift(userStat)
        }
    }
    return flowUtil.statIdsAndSumFromBottom(finalResult)
}

/**
 * 获取部门其他相关的人员：外包、离职
 *
 * @param deptIds
 * @returns {Promise<*[]>}
 */
const getRelatedOtherUsers = async (deptIds) => {
    let otherUsers = []
    for (const deptId of deptIds) {
        const deptOutSourcingUsers = await outUsersRepo.getOutUsersWithTags({deptId: deptId, enabled: true})
        otherUsers = otherUsers.concat(deptOutSourcingUsers)
        const deptResignUsers = await userRepo.getDeptResignUsers(deptId)
        const deptResignedUsers = deptResignUsers.map(item => {
            item.nickname = `${item.nickname}[已离职]`
            return item
        })
        otherUsers = otherUsers.concat(deptResignedUsers)
    }
    return otherUsers
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
 * 统计视觉部员工的流程表单数据
 *
 * @param userActivity 用户和工作节点相关的信息
 * @param flow
 * @returns {Promise<*|*[]>}
 */
const statVisionUserFlowData = async (userActivity, flow) => {
    // 当前用户统计到的节点需要时正在干活的节点才要汇总表单信息
    let {userName, tags: userTags, activity} = userActivity

    // 没有标签的用户直接返回空模板
    if (userTags.length === 0) {
        return []
    }

    let userTagCodes = userTags.map(item => item.tagCode)

    const userTmpTags = patchUtil.getUserTmpTags(userName, flow.processInstanceId)
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

    const userTagsFormItemKeywordsMappings = visionConst.tagsFormItemKeywordsMapping.filter(item => userTagCodes.filter(tagCode => tagCode === item.tagCode).length > 0)
    if (userTagsFormItemKeywordsMappings.length === 0) {
        return []
    }

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

/**
 * 为节点增加表单中工作量的统计的node
 *
 * @param node
 * @returns {Array}
 */
const createFlowDataStatNode = (node) => {
    const runningStatNode = node.children.filter(item => item.nameCN.includes("中"))
    const completedStatNode = node.children.filter(item => item.nameCN.includes("完"))
    const runningFlowDataStatNodes = findAllUserFlowsDataStatNode(runningStatNode)
    const completedFlowDataStatNodes = findAllUserFlowsDataStatNode(completedStatNode)
    const runningWorkload = sumSameNameWorkload(runningFlowDataStatNodes)
    const completedWorkload = sumSameNameWorkload(completedFlowDataStatNodes)

    const newWorkloadStatNode = {
        nameCN: "工作量",
        excludeUpSum: true,
        sumAlone: true,
        uniqueIds: true,
        children: [
            {
                nameCN: "进行中",
                tooltip: "该工作量会统计表单中预计的数据",
                sumAlone: true,
                uniqueIds: true,
                children: runningWorkload,
            },
            {
                nameCN: "已完成",
                sumAlone: true,
                uniqueIds: true,
                children: completedWorkload
            }
        ]
    }

    return flowUtil.statSumFromBottom(newWorkloadStatNode)
}

/**
 * 将流程中对美编核心工作统计对同名的进行汇总
 * statResultTemplateConst下的visionUserFlowDataStatResultTemplate
 *
 * @param flows
 * @returns {*[]}
 */
const sumSameNameWorkload = (flows) => {
    const result = []
    for (const flow of flows) {
        for (const details of flow.flowData) {
            if (!details.workload || details.workload === "0") {
                continue
            }
            const resultNode = result.find(item => item.nameCN === details.nameCN)
            if (resultNode) {
                if (!resultNode.ids.includes(flow.processInstanceId)) {
                    resultNode.ids.push(flow.processInstanceId)
                }
                resultNode.sum = new Bignumber(resultNode.sum).plus(details.workload).toString()
            } else {
                result.push({
                    nameCN: details.nameCN,
                    sum: details.workload,
                    ids: [flow.processInstanceId],
                    sumAlone: true
                })
            }
        }
    }
    return result
}

/**
 * 找到节点下所有的 userFlowsDataStat 数据
 *
 * @param topNode
 * @returns {*[]}
 */
const findAllUserFlowsDataStatNode = (topNode) => {
    // 统一转成数组处理
    if (!(_.isArray(topNode))) {
        topNode = [topNode]
    }

    let allUserFlowsDataStatNodes = []

    for (const node of topNode) {
        if (node.userFlowsDataStat) {
            allUserFlowsDataStatNodes = allUserFlowsDataStatNodes.concat(node.userFlowsDataStat)
        }

        if (node.children && node.children.length > 0) {
            const subResult = findAllUserFlowsDataStatNode(node.children)
            allUserFlowsDataStatNodes = allUserFlowsDataStatNodes.concat(subResult)
        }
    }

    return allUserFlowsDataStatNodes
}

/**
 * 从配置中获取外包和非外包表单流程分开进行汇总
 *
 * @param coreActionConfig
 * @returns {{outSourcing: *[], inner: *[]}}
 */
const extractInnerAndOutSourcingFormsFromConfig = (coreActionConfig) => {
    const forms = {"inner": [], "outSourcing": []}
    if (coreActionConfig instanceof Array) {
        for (const item of coreActionConfig) {
            // 找到有form的节点配置信息直接拿出来
            if (Object.keys(item).includes("formId")) {
                const tmpForm = {formName: item.formName, formId: item.formId}
                if (item.formName.includes("外包")) {
                    forms.outSourcing.push(tmpForm)
                } else {
                    forms.inner.push(tmpForm)
                }
                continue
            }
            // 当前item不存在form先关的配置信息
            for (const key of Object.keys(item)) {
                if (item[key] instanceof Array) {
                    const tmpForms = coreActionStatService.extractInnerAndOutSourcingFormsFromConfig(item[key])
                    forms.inner = forms.inner.concat(tmpForms.inner)
                    forms.outSourcing = forms.outSourcing.concat(tmpForms.outSourcing)
                }
            }
        }
    }
    forms.inner = algorithmUtil.removeJsonArrDuplicateItems(forms.inner, "formId")
    forms.outSourcing = algorithmUtil.removeJsonArrDuplicateItems(forms.outSourcing, "formId")
    return forms
}

/**
 * 根据userId的身份和deptId获取外包和离职人员信息
 *
 * @param userId
 * @param deptId
 * @returns {Promise<{resignedUsers: *[], outUsers: *[]}>}
 */
// const getOutAndResignedUsers = async (userId, deptId) => {
//     // todo: 视觉(482162119)和全流程的统计userNames要加上外包的信息
//     //   先单独处理，要不就得把外包的人全部返回视觉的前端，可能还得改http method，
//     //   等数据ok稳定后需要整理
//     const user = await userRepo.getUserDetails({userId})
//     const userDDId = user.dingdingUserId
//     // 有条件地为userNames添加外包人信息、离职人员信息
//     let canGetDeptOutSourcingUsers = false
//     let canGetResignUsers = false
//     if (whiteList.pepArr().includes(userDDId)) {
//         canGetDeptOutSourcingUsers = true
//         canGetResignUsers = true
//     } else {
//         const redisUsers = await redisRepo.getAllUsersDetail()
//         const userTargetDeps = redisUsers.find(u => u.userid === userDDId).leader_in_dept
//         const userCurrDept = userTargetDeps.find(item => item.dept_id.toString() === deptId)
//         if (userCurrDept && userCurrDept.leader) {
//             canGetDeptOutSourcingUsers = true
//             canGetResignUsers = true
//         }
//     }
//     const result = {resignedUsers: [], outUsers: []}
//     let deptResignUsersWithTag = []
//     if (canGetResignUsers) {
//         const deptResignUsers = await userRepo.getDeptResignUsers(deptId)
//         deptResignUsersWithTag = deptResignUsers.map(item => `${item.nickname}[已离职]`)
//     }
//     result.resignedUsers = deptResignUsersWithTag
//
//     let outSourcingUsers = []
//     if (canGetDeptOutSourcingUsers) {
//         outSourcingUsers = await outUsersRepo.getOutUsersWithTags({deptId, enabled: true}) // redisRepo.getOutSourcingUsers(deptId)
//     }
//     result.outUsers = outSourcingUsers
//     return result
// }

/**
 * 将对人的统计汇总成工作量的统计(按照核心动作名对基于人的统计的汇总)
 *
 * @param userStatResult
 * @returns {*[]}
 */
const sumUserActionStat = (userStatResult) => {
    const activityStatResult = getActivityStatStructure(_.cloneDeep(userStatResult))
    for (const actionStatResult of userStatResult) {
        const coreActionName = actionStatResult.actionName
        const subStatusActionsResult = actionStatResult.children
        for (const subActionResult of subStatusActionsResult) {
            const subOverdueActionsResult = subActionResult.children
            for (const overdueResult of subOverdueActionsResult) {
                // 获取逾期节点下所有人的汇总
                const getOverdueIds = (overdueResult) => {
                    let overdueIds = []
                    for (const userStatResult of overdueResult.children) {
                        overdueIds = overdueIds.concat(userStatResult.ids)
                    }
                    return overdueIds
                }
                const ids = getOverdueIds(overdueResult)
                const findTargetActResult = (subActStatName, overDueName) => {
                    const subActStatResult = activityStatResult.filter(item => item.nameCN === subActStatName)[0]
                    if (subActStatResult) {
                        const subActOverdueStatResult = subActStatResult.children.filter(item => item.nameCN === overDueName)[0]
                        return subActOverdueStatResult
                    }
                    return null
                }

                const targetActResult = findTargetActResult(subActionResult.nameCN, overdueResult.nameCN)
                if (targetActResult) {
                    targetActResult.children.push({actionName: coreActionName, ids: ids})
                }
            }
        }
    }
    return activityStatResult
}

/**
 * 获取结果的模板结构
 *
 * @param referenceStatResult
 * @returns {*[]}
 */
const getActivityStatStructure = (referenceStatResult) => {
    const structure = []
    // todo：good idea： 没时间实现了
    // 保留2层深度的结构信息, 将底层基于人的统计信息忽略
    for (const actStat of referenceStatResult) {
        for (const subActStat of actStat.children) {
            const isExist = structure.filter(item => item.nameCN === subActStat.nameCN).length > 0
            if (!isExist) {
                for (const overDueStat of subActStat.children) {
                    overDueStat.children = []
                }
                structure.push(subActStat)
            }
        }
    }
    return structure
}

module.exports = {
    getCoreActionStat
}