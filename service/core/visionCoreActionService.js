const _ = require("lodash")
const Bignumber = require("bignumber.js")
const userRepo = require("@/repository/userRepo")
const outUsersRepo = require("@/repository/outUsersRepo")
const flowRepo = require("@/repository/flowRepo")
const userCommonService = require("@/service/common/userCommonService")
const flowCommonService = require("@/service/common/flowCommonService")
const coreActionStatService = require("@/service/core/coreActionStatService")
const {flowReviewTypeConst, flowStatusConst} = require("@/const/flowConst")
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
const getCoreActionStat = async (tags, userId, deptIds, userNames, startDoneDate, endDoneDate) => {
    // 筛选的信息组成： userNames、outUserNames、resignedUserNames
    // 普通的身份不要组合 outUserNames、resignedUserNames

    const isDeptLeader = await userCommonService.isDeptLeaderOfTheUser(userId, deptIds)
    let requiredUsers = await coreActionStatService.getRequiredUsers(userNames, isDeptLeader, deptIds)
    requiredUsers = filterUsersByTags(requiredUsers, tags)

    const coreActionConfig = await flowRepo.getCoreActionsConfig(deptIds)
    const differentForms = extractInnerAndOutSourcingFormsFromConfig(coreActionConfig)
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
    const isFromCoreActionMenu = tags.length === 0
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
            const innerStatusStatFlowResult = convertToFlowStatResult(innerFlows, coreActionConfig, actionStatBasedOnUserResult)
            finalResult.unshift({
                actionName: "流程汇总(内部)", actionCode: "sumFlowStat", children: innerStatusStatFlowResult
            })

            // 对外包的流程进行转化统计
            const outSourcingFormIds = differentForms.outSourcing.map(item => item.formId)
            const outSourcingFlows = flows.filter(item => outSourcingFormIds.includes(item.formUuid))
            const outSourcingStatusStatFlowResult = convertToFlowStatResult(outSourcingFlows, coreActionConfig, actionStatBasedOnUserResult)
            finalResult.unshift({
                actionName: "流程汇总(外包)", actionCode: "sumFlowStat", children: outSourcingStatusStatFlowResult
            })

            const statusStatFlowResult = convertToFlowStatResult(flows, coreActionConfig, actionStatBasedOnUserResult)
            finalResult.unshift({
                actionName: "流程汇总", actionCode: "sumFlowStat", children: statusStatFlowResult
            })
        }
    }
    // 核心人的统计用标签区分
    else {
        const userStatArr = convertToUserActionResult(requiredUsers, actionStatBasedOnUserResult)
        for (const userStat of userStatArr) {
            userStat.children.push(createFlowDataStatNode(userStat))
            finalResult.unshift(userStat)
        }
    }


    // } else if (deptIds.includes("903075138")) {
    //     const userStatArr = convertToUserActionResult(requiredUsers, actionStatBasedOnUserResult)
    //     for (const userStat of userStatArr) {
    //         userStat.children.push(createFlowDataStatNode(userStat))
    //         finalResult.unshift(userStat)
    //     }
    // }
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
        nameCN: "工作量", excludeUpSum: true, sumAlone: true,
        children: [
            {
                nameCN: "进行中",
                tooltip: "该工作量会统计表单中预计的数据",
                sumAlone: true,
                children: runningWorkload
            },
            {
                nameCN: "已完成",
                sumAlone: true, children: completedWorkload
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
                    const tmpForms = extractInnerAndOutSourcingFormsFromConfig(item[key])
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
 * 对流程进行汇总
 *
 * @param flows
 * @param coreActionConfig
 * @param userStatResult
 * @returns {*[]}
 */
const convertToFlowStatResult = (flows, coreActionConfig, userStatResult) => {
    const overdueConfigTemplate = [{nameCN: "逾期", nameEN: "overdue", children: []}, {
        nameCN: "未逾期", nameEN: "notOverdue", children: []
    }]
    const flowStatConfigTemplate = [{
        nameCN: "待转入", nameEN: "TODO", children: _.cloneDeep(overdueConfigTemplate)
    }, {nameCN: "进行中", nameEN: "DOING", children: _.cloneDeep(overdueConfigTemplate)}, {
        nameCN: "已完成", nameEN: "DONE", children: _.cloneDeep(overdueConfigTemplate)
    }]

    const statusKeyTexts = ["待", "中", "完"]
    const statusStatFlowResult = getFlowSumStructure(_.cloneDeep(userStatResult), flowStatConfigTemplate)

    for (const actionResult of statusStatFlowResult) {
        // 从配置 coreActionConfig 中找到类似‘全套-待xxx’中的rules
        for (const statusResult of actionResult.children) {
            const statusKeyText = statusKeyTexts.filter(key => statusResult.nameCN.includes(key))[0]

            // 找到同名的配置: 全套、半套、散图、视频
            const targetCoreActionConfig = coreActionConfig.filter(item => item.actionName === actionResult.nameCN)[0]
            // 找到具有想匹配关键词的状态节点(s)：待拍视频、待入美编
            const coreActionSameKeyTextConfig = targetCoreActionConfig.actionStatus.filter(item => item.nameCN.includes(statusKeyText))

            // 待转入和进行中流程的统计，根据配置符合一项计算匹配成功
            if (statusKeyText !== "完") {
                // 分别根据其中的配置，统计流程并放到逾期下对应的摄影或美编节点下
                for (const statusConfig of coreActionSameKeyTextConfig) {
                    // 获取需要统计到的节点名称
                    const getPureActionName = (text) => {
                        const uselessKeyText = ["待", "拍", "入", "进", "行", "中", "已", "完", "成"]
                        for (const key of uselessKeyText) {
                            text = text.replace(key, "")
                        }
                        return text
                    }
                    const {nameCN, rules} = statusConfig
                    // 对于完成的流程统计不用区分具体的动作，要不会重复的
                    const actionName = statusKeyText === "完" ? "合计" : getPureActionName(nameCN)

                    // 根据表单的统计规则，将流程统计到对应的节点下
                    for (const formRule of rules) {
                        let formFlows = flows.filter(flow => flow.formUuid === formRule.formId)
                        if (formRule.flowDetailsRules) {
                            for (const detailsRule of formRule.flowDetailsRules) {
                                formFlows = formFlows.filter(flow => {
                                    if (flow.data[detailsRule.fieldId]) {
                                        return opFunctions[detailsRule.opCode](flow.data[detailsRule.fieldId], detailsRule.value)
                                    }
                                    return false
                                })
                            }
                        }

                        // 将流程统计到对应结果状态中，包含逾期
                        for (const flow of formFlows) {
                            const activities = flow.overallprocessflow

                            // 匹配到一项即算匹配成功
                            for (let i = 0; i < formRule.flowNodeRules.length; i++) {
                                const flowNodeRule = formRule.flowNodeRules[i]
                                const {from: fromNode, to: toNode, overdue: overdueNode} = flowNodeRule
                                const fromNodeMatched = activities.filter(item => item.activityId === fromNode.id && fromNode.status.includes(item.type)).length > 0
                                const toNodeMatched = activities.filter(item => item.activityId === toNode.id && toNode.status.includes(item.type)).length > 0

                                if (!overdueNode) {
                                    continue
                                }

                                const overdueActivity = activities.filter(item => item.activityId === overdueNode.id && overdueNode.status.includes(item.type))
                                if (overdueActivity.length === 0) {
                                    continue
                                }

                                const needToStatResult = statusResult.children.find(item => item.nameCN === (overdueActivity[0].isOverDue ? "逾期" : "未逾期"))

                                if (fromNodeMatched && toNodeMatched) {
                                    const tmpSubActionResult = needToStatResult.children.find(item => item.nameCN === actionName)
                                    if (tmpSubActionResult) {
                                        if (!tmpSubActionResult.ids.includes(flow.processInstanceId)) {
                                            tmpSubActionResult.ids.push(flow.processInstanceId)
                                            tmpSubActionResult.sum = tmpSubActionResult.ids.length
                                        }
                                    } else {
                                        needToStatResult.children.push({
                                            nameCN: actionName, ids: [flow.processInstanceId]
                                        })
                                    }
                                }
                            }
                        }
                    }
                }
            }
                // 已完成流程的统计，仅要看最后的审核节点是否完成即可，对于要统计到逾期和未逾期需要看全部的配置节点
            // 还要附件上美编的审核节点（审核结束才算真正完成）
            else {
                for (const flow of flows) {
                    // 根据判断流程是否要进行统计
                    const visionFormDoneActivity = visionFormDoneActivityIds.find(item => item.formId === flow.formUuid)
                    if (!visionFormDoneActivity) {
                        continue
                    }
                    const requiredDoneActivities = flow.overallprocessflow.filter(item => visionFormDoneActivity.doneActivityIds.includes(item.activityId) && item.type === flowReviewTypeConst.HISTORY)
                    if (requiredDoneActivities.length === 0) {
                        continue
                    }

                    for (const statusConfig of coreActionSameKeyTextConfig) {
                        const {rules} = statusConfig
                        for (const formRule of rules) {
                            if (formRule.formId !== flow.formUuid) {
                                continue
                            }
                            // 判断视觉属性是否相同
                            let hasSameVisionAttr = false
                            for (const detailsRule of formRule.flowDetailsRules || []) {
                                hasSameVisionAttr = opFunctions[detailsRule.opCode](flow.data[detailsRule.fieldId], [actionResult.nameCN])
                                if (hasSameVisionAttr) {
                                    break
                                }
                            }

                            if (hasSameVisionAttr) {
                                // 判断是否出现过逾期
                                let overdueActivity = null
                                // 审核节点逾期
                                if (requiredDoneActivities[0].isOverDue) {
                                    overdueActivity = requiredDoneActivities[0]
                                }
                                // 非审核节点逾期
                                else {
                                    for (const flowNodeRule of formRule.flowNodeRules) {
                                        const {overdue: overdueNode} = flowNodeRule
                                        overdueActivity = flow.overallprocessflow.find(item => item.activityId === overdueNode.id && item.isOverDue)
                                        if (overdueActivity) {
                                            break
                                        }
                                    }
                                }

                                const tmpOverdueStatResult = statusResult.children.find(item => item.nameCN === (overdueActivity ? "逾期" : "未逾期"))
                                // 对于完成的流程统计不用区分具体的动作，要不会重复的， 默认为”合计“
                                const defaultActionName = "合计"
                                if (tmpOverdueStatResult.children.length === 0) {
                                    tmpOverdueStatResult.children.push({
                                        nameCN: defaultActionName, ids: [flow.processInstanceId]
                                    })
                                } else {
                                    if (!tmpOverdueStatResult.children[0].ids.includes(flow.processInstanceId)) {
                                        tmpOverdueStatResult.children[0].ids.push(flow.processInstanceId)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return statusStatFlowResult
}

const convertToUserActionResult = (users, userStatResult) => {
    // 因为要兼容前期混乱的外包负责人信息
    // 如果users中有 外包的人才需要visionConfusedUserNamesConst的参与
    const userStatArr = []
    const mixedOutSourcingUsers = _.cloneDeep(visionConst.unifiedConfusedUserNames).filter(item => {
        const tmpUsers = users.filter(user => user.userName === item.username)
        return tmpUsers.length > 0
    })
    let isRequiredVisionConfusedUserNamesConst = false
    for (const mixedOutSourcingUser of mixedOutSourcingUsers) {
        const user = users.find(item => (item.nickname || item.userName) === mixedOutSourcingUser.username)
        if (user) {
            isRequiredVisionConfusedUserNamesConst = true
            break
        }
    }

    const newStructureUsers = isRequiredVisionConfusedUserNamesConst ? mixedOutSourcingUsers : []
    const userNamesArr = users.map(item => item.nickname || item.userName)
    for (const username of userNamesArr) {
        let isConfusedOutSourcingUser = false
        for (const mixedOutSourcingUser of mixedOutSourcingUsers) {
            if (mixedOutSourcingUser.children.includes(username)) {
                isConfusedOutSourcingUser = true
                break
            }
        }
        if (!isConfusedOutSourcingUser) {
            newStructureUsers.push({username, children: [username]})
        }
    }

    for (const user of newStructureUsers) {
        const getActionChildren = (usernames) => {
            const statusKeyTexts = ["待", "中", "完"]
            const leve1Actions = ["待转入", "进行中", "已完成"]
            const leve2Actions = ["逾期", "未逾期"]
            const result = []
            for (const l1Action of leve1Actions) {
                const currStatusKeyText = statusKeyTexts.find(key => l1Action.includes(key))
                const l1ActionStructure = {nameCN: l1Action, nameEN: "", children: []}
                for (const l2Action of leve2Actions) {
                    const l2ActionStructure = {
                        nameCN: l2Action, nameEN: "", children: []
                    }

                    // 找出所有key所对应的逾期所包含的children
                    for (const result of userStatResult) {
                        let ids = []
                        let userFlowsDataStat = []
                        const actionName = result.actionName
                        const sameKeyTextStat = result.children.filter(item => item.nameCN.includes(currStatusKeyText))
                        for (const statusActionStat of sameKeyTextStat) {
                            const overdueActionStat = statusActionStat.children.find(item => item.nameCN === l2Action)
                            const userActionStat = overdueActionStat.children.filter(item => usernames.includes(item.userName))
                            if (userActionStat.length > 0) {
                                for (const stat of userActionStat) {
                                    ids = ids.concat(stat.ids)
                                    userFlowsDataStat = userFlowsDataStat.concat(stat.userFlowsDataStat)
                                }
                            }
                        }
                        l2ActionStructure.children.push({userName: actionName, ids, sum: ids.length, userFlowsDataStat})
                    }
                    l1ActionStructure.children.push(l2ActionStructure)
                }
                result.push(l1ActionStructure)
            }
            return result
        }
        if (!user.username.includes("离职")) {
            const userStatStructure = {
                actionCode: "userActStat",
                actionName: user.username,
                children: getActionChildren(user.children)
            }
            userStatArr.push(userStatStructure)
        }
    }
    return userStatArr
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


const getFlowSumStructure = (result, flowStatConfigTemplate) => {
    const sumFlowStat = []
    for (const coreActionResult of result) {
        sumFlowStat.push({
            nameCN: coreActionResult.actionName,
            nameEN: coreActionResult.actionCode,
            children: _.cloneDeep(flowStatConfigTemplate)
        })
    }
    return sumFlowStat
}

module.exports = {
    getCoreActionStat
}