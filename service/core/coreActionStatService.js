const _ = require("lodash")
const userRepo = require("@/repository/userRepo");
const outUsersRepo = require("@/repository/outUsersRepo");
const flowCommonService = require("@/service/common/flowCommonService");
const flowUtil = require("@/utils/flowUtil")
const algorithmUtil = require("@/utils/algorithmUtil");
const {activityIdMappingConst, flowStatusConst, flowReviewTypeConst} = require("@/const/flowConst")
const operatorConst = require("@/const/ruleConst/operatorConst")
const conditionConst = require("@/const/ruleConst/conditionConst")
const visionConst = require("@/const/tmp/visionConst");
const {visionFormDoneActivityIds} = require("@/const/tmp/coreActionsConst");

const ownerFrom = {"FORM": "FORM", "PROCESS": "PROCESS"}

/**
 * 根据人名和核心动作配置信息统计流程
 *
 * @param users
 * @param currFlows
 * @param coreConfig
 * @param userFlowDataStatFunc
 * @returns {Promise<*[]>}
 */
const stat = async (users, flows, coreConfig, userFlowDataStatFunc) => {
    const result = await statForHasRulesNode(users, flows, coreConfig, userFlowDataStatFunc)
    return result
}

/**
 * 添加一层方法便于递归调用
 *
 * @param users
 * @param flows
 * @param coreConfig
 * @param userFlowDataStatFunc
 * @returns {Promise<*>}
 */
const statForHasRulesNode = async (users, flows, coreConfig, userFlowDataStatFunc) => {
    for (let action of coreConfig) {
        if (action.rules && action.rules.length > 0) {
            const statResult = await statFlowsByRules(users, action.rules, flows, userFlowDataStatFunc, action)
            action = statResult
        }
        
        if (action.children && action.children.length > 0) {
            await statForHasRulesNode(users, flows, action.children, userFlowDataStatFunc)
        }
    }
    return coreConfig
}

/**
 * 根据 rule 统计流程数据
 * 将结果放到resultNode中返回
 *
 * @param resultNode
 * @param rules
 * @param flows
 * @param userFlowDataStatFunc
 * @param users
 * @returns {Promise<*>}
 */
const statFlowsByRules = async (users, rules, flows, userFlowDataStatFunc, resultNode) => {
    for (const rule of rules) {
        flows = flows.filter((flow) => flow.formUuid === rule.formId)
        flows = filterFlowsByFlowDetailsRules(flows, rule.flowDetailsRules)
        
        if (flows.length === 0) {
            continue
        }
        
        for (const flowNodeRule of rule.flowNodeRules) {
            const {activityId, status, isOverdue, owner} = flowNodeRule
            
            // 根据节点配置对流程进行汇总
            for (const flow of flows) {
                const processInstanceId = flow.processInstanceId
                
                const activities = flowUtil.getLatestUniqueReviewItems(flow.overallprocessflow)
                const matchedActivity = getMatchedActivity(activityId, status, isOverdue, activities)
                if (!matchedActivity) {
                    continue
                }
                
                const ownerActivity = extendActivityWithOwnerNameAndTags(matchedActivity, users, flow, owner)
                
                if (!ownerActivity) {
                    continue
                }
                
                const userFlowDataStat = _.isFunction(userFlowDataStatFunc) && userFlowDataStatFunc(resultNode, ownerActivity, flow)
                
                let resultStatNode = resultNode.children.filter(item => item.userName === ownerActivity.userName)
                
                const userHasStat = resultStatNode.length > 0
                if (userHasStat) {
                    const currResultStatNode = resultStatNode[0]
                    // 避免一人在同一流程中干多个活重复计算
                    if (!currResultStatNode.ids.includes(processInstanceId)) {
                        currResultStatNode.ids.push(processInstanceId)
                        currResultStatNode.sum = currResultStatNode.ids.length
                    }
                    
                    // 同一人流程中会出现多次干不同的活，将本人所有该流程中节点工作量的统计去重处理才能保证不漏
                    if (userFlowDataStat && userFlowDataStat.flowData.length > 0) {
                        const currFlowStat = currResultStatNode.userFlowsDataStat.find(item => item.processInstanceId == processInstanceId)
                        if (currFlowStat) {
                            const alreadyStatActivityNames = currFlowStat.flowData.map(item => item.nameCN)
                            for (const actStat of userFlowDataStat.flowData) {
                                if (!alreadyStatActivityNames.includes(actStat.nameCN)) {
                                    currFlowStat.flowData.push(actStat)
                                }
                            }
                        } else {
                            currResultStatNode.userFlowsDataStat.push(userFlowDataStat)
                        }
                    }
                } else {
                    resultStatNode = {
                        userName: ownerActivity.userName,
                        sum: 1,
                        ids: [processInstanceId],
                        userFlowsDataStat: userFlowDataStat ? [userFlowDataStat] : []
                    }
                    resultNode.children.push(resultStatNode)
                }
            }
        }
    }
    return resultNode
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
 * 根据配置的流程数据规则过滤流程
 *
 * @param flows
 * @param flowDetailsRules
 * @returns {*}
 */
const filterFlowsByFlowDetailsRules = (flows, flowDetailsRules) => {
    let result = _.cloneDeep(flows)
    
    if (flowDetailsRules) {
        for (const detailsRule of flowDetailsRules) {
            if (detailsRule.condition === conditionConst.condition.AND) {
                result = result.filter(flow => {
                    return operatorConst.opFunctions[detailsRule.opCode](flow.data[detailsRule.fieldId], detailsRule.value)
                })
            } else {
                const orFlows = _.cloneDeep(flows).filter(flow => {
                    return operatorConst.opFunctions[detailsRule.opCode](flow.data[detailsRule.fieldId], detailsRule.value)
                })
                result = result.concat(orFlows)
            }
        }
    }
    
    return algorithmUtil.removeJsonArrDuplicateItems(result, "processInstanceId")
}

/**
 * 获取匹配的审核节点
 *
 * @param activityId
 * @param status
 * @param activities
 * @returns {*|null}
 */
const getMatchedActivity = (activityId, status, isOverdue, activities) => {
    
    for (const activity of activities) {
        // 发起的节点id对应的表单流程id不一致
        activityId = activityIdMappingConst[activityId] || activityId
        if (activity.activityId === activityId && status.includes(activity.type) && isOverdue === activity.isOverdue) {
            return activity
        }
    }
    return null
}

/**
 * 用userName和tags扩展审核节点信息
 *
 * @param activity
 * @param users
 * @param flow
 * @param ownerRule
 * @returns {{activity, userName: string, tags: *}|null}
 */
const extendActivityWithOwnerNameAndTags = (activity, users, flow, ownerRule) => {
    let ownerName = "未分配"
    let {from, id, defaultUserName} = ownerRule
    // 外包的流程可能会存在未选择外包人的情况
    if (from.toUpperCase() === ownerFrom.FORM) {
        let tmpOwnerName = flow.data[id] && flow.data[id].length > 0 && flow.data[id]
        // 如果是数组的格式，转成以“,”连接的字符串
        if (tmpOwnerName instanceof Array) {
            tmpOwnerName = tmpOwnerName.join(",")
        }
        if (tmpOwnerName) {
            ownerName = tmpOwnerName
        } else if (defaultUserName) {
            ownerName = defaultUserName
        }
    } else {
        const processReviewId = activityIdMappingConst[id] || id
        const reviewItems = flow.overallprocessflow.filter(item => item.activityId === processReviewId)
        ownerName = reviewItems.length > 0 ? reviewItems[0].operatorName : defaultUserName
    }
    
    const user = users.find(user => user.nickname === ownerName || user.userName === ownerName)
    
    if (user) {
        return {userName: ownerName, tags: user.tags, activity: activity}
    }
    return null
}

const filterFlows = async (formIds, startDoneDate, endDoneDate) => {
    let combinedFlows = await flowCommonService.getCombinedFlowsOfHistoryAndToday(startDoneDate, endDoneDate, formIds)
    combinedFlows = flowCommonService.removeTargetStatusFlows(combinedFlows, flowStatusConst.TERMINATED)
    combinedFlows = flowCommonService.removeDoneActivitiesNotInDoneDateRangeExceptStartNode(combinedFlows, startDoneDate, endDoneDate, true)
    combinedFlows = flowCommonService.removeRedirectActivity(combinedFlows)
    return combinedFlows
}

const getRequiredUsers = async (userNames, userIsDeptLeader, deptIds, userFilterFunc) => {
    let requiredUsers = await userRepo.getUsersWithTagsByUsernames(userNames) || []
    if (userIsDeptLeader) {
        const relatedOtherUsers = await getRelatedOtherUsers(deptIds)
        requiredUsers = requiredUsers.concat(relatedOtherUsers)
    }
    if (_.isFunction(userFilterFunc)) {
        requiredUsers = userFilterFunc(requiredUsers)
    }
    return requiredUsers
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
        const deptResignUsers = await userRepo.getDeptResignUsers([deptId])
        const deptResignedUsers = deptResignUsers.map(item => {
            item.nickname = `${item.nickname}[已离职]`
            return item
        })
        otherUsers = otherUsers.concat(deptResignedUsers)
    }
    return otherUsers
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

/**
 * 标准统计： 将流程按照statusConfigs的规则统计到statusResult中
 *
 * @param flows
 * @param statusConfigs
 * @param statusResult
 * @returns {*}
 */
const standardStat = (flows, statusConfigs, statusResult) => {
    for (const statusConfig of statusConfigs) {
        const {nameCN, rules} = statusConfig
        const actionName = getPureActionName(nameCN) || "合计"
        for (const formRule of rules) {
            statusResult = statFlowsToActionByFormRule(flows, formRule, actionName, statusResult)
        }
    }
    return statusResult
}

/**
 * 对流程进行汇总
 *
 * @param flows
 * @param coreActionConfig
 * @param userStatResult
 * @returns {*[]}
 */
const convertToFlowStatResult = (isStandardStat, flows, coreActionConfig, userStatResult) => {
    
    const statusStatFlowResult = initResultTemplate(userStatResult)
    
    const statusKeyTexts = ["待", "中", "完"]
    for (const actionResult of statusStatFlowResult) {
        // 从配置 coreActionConfig 中找到类似‘全套-待xxx’中的rules
        for (let i = 0; i < actionResult.children.length; i++) {
            let statusResult = actionResult.children[i]
            const statusKeyText = statusKeyTexts.filter(key => statusResult.nameCN.includes(key))[0]
            // 找到同名的配置, 如：全套、半套、散图、视频
            const targetCoreActionConfig = coreActionConfig.filter(item => item.actionName === actionResult.nameCN)[0]
            // 找到具有想匹配关键词的状态节点(s)：待拍视频、待入美编
            const coreActionSameKeyTextConfig = targetCoreActionConfig.actionStatus.filter(item => item.nameCN.includes(statusKeyText))
            
            if (isStandardStat) {
                statusResult = standardStat(flows, coreActionSameKeyTextConfig, statusResult)
            } else {
                // 待转入和进行中流程的统计，根据配置符合一项计算匹配成功
                if (statusKeyText !== "完") {
                    statusResult = standardStat(flows, coreActionSameKeyTextConfig, statusResult)
                } else {
                    // 已完成流程的统计，仅要看最后的审核节点是否完成即可，对于要统计到逾期和未逾期需要看全部的配置节点
                    // 还要附件上美编的审核节点（审核结束才算真正完成）
                    statusResult = statFlowsToActionByTargetFormActivityIds(flows, actionResult.nameCN, coreActionSameKeyTextConfig, visionFormDoneActivityIds, statusResult)
                }
            }
        }
    }
    return statusStatFlowResult
}

const initResultTemplate = (userStatResult) => {
    const overdueConfigTemplate = [{nameCN: "逾期", nameEN: "overdue", children: []}, {
        nameCN: "未逾期",
        nameEN: "notOverdue",
        children: []
    }]
    const flowStatConfigTemplate = [{
        nameCN: "待转入",
        nameEN: "TODO",
        children: _.cloneDeep(overdueConfigTemplate)
    }, {nameCN: "进行中", nameEN: "DOING", children: _.cloneDeep(overdueConfigTemplate)}, {
        nameCN: "已完成",
        nameEN: "DONE",
        children: _.cloneDeep(overdueConfigTemplate)
    }]
    
    return getFlowSumStructure(_.cloneDeep(userStatResult), flowStatConfigTemplate)
}

/**
 * 去掉文本中不需要的信息
 *
 * @param text
 * @returns {*}
 */
const getPureActionName = (text) => {
    const uselessKeyText = ["待", "拍", "做", "入", "进", "行", "中", "已", "完", "成"]
    for (const key of uselessKeyText) {
        text = text.replace(key, "")
    }
    return text
}

/**
 * 根据表单规则，将flows汇总到 statusResult中匹配的actionName节点
 *
 * @param flows
 * @param formRule
 * @param actionName
 * @param statusResult
 * @returns {*}
 */
const statFlowsToActionByFormRule = (flows, formRule, actionName, statusResult) => {
    let formFlows = flows.filter(flow => flow.formUuid === formRule.formId)
    if (formRule.flowDetailsRules) {
        for (const detailsRule of formRule.flowDetailsRules) {
            formFlows = formFlows.filter(flow => {
                if (flow.data[detailsRule.fieldId]) {
                    return operatorConst.opFunctions[detailsRule.opCode](flow.data[detailsRule.fieldId], detailsRule.value)
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
            const {from: fromNode, to: toNode} = flowNodeRule
            
            const fromNodes = activities.filter(item => item.activityId === fromNode.id && fromNode.status.includes(item.type))
            const toNodes = activities.filter(item => item.activityId === toNode.id && toNode.status.includes(item.type))
            
            if (fromNodes.length > 0 && toNodes.length > 0) {
                const needToStatResult = statusResult.children.find(item => item.nameCN === (fromNodes[0].isOverDue ? "逾期" : "未逾期"))
                
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
    return statusResult
}


/**
 * 将包含特定节点的流程统计到statusResult中对应的actionName中
 *
 * @param flows
 * @param actionName
 * @param coreActionSameKeyTextConfig
 * @param visionTargetFormDoneActivityIds
 * @param statusResult
 * @returns {*}
 */
const statFlowsToActionByTargetFormActivityIds = (flows, actionName, coreActionSameKeyTextConfig, visionTargetFormDoneActivityIds, statusResult) => {
    let index = 0
    for (const flow of flows) {
        index = index + 1
        console.log("----", actionName, index)
        if (index === 109) {
            console.log("===")
        }
        
        const targetDoneForm = visionTargetFormDoneActivityIds.find(item => item.formId === flow.formUuid)
        if (!targetDoneForm) {
            continue
        }
        const requiredDoneActivities = flow.overallprocessflow.filter(item => targetDoneForm.doneActivityIds.includes(item.activityId) && item.type === flowReviewTypeConst.HISTORY)
        if (requiredDoneActivities.length === 0) {
            continue
        }
        
        // 要将多个流程的多个工作项配置合并，用于算逾期，存在一个逾期计算逾期
        const rules = _.cloneDeep(coreActionSameKeyTextConfig[0].rules)
        for (let i = 1; i < coreActionSameKeyTextConfig.length; i++) {
            const tmpRules = coreActionSameKeyTextConfig[i].rules
            for (const tmpRule of tmpRules) {
                const existRule = rules.find(item => item.formId === tmpRule.formId)
                if (existRule) {
                    existRule.flowNodeRules = existRule.flowNodeRules.concat(tmpRule.flowNodeRules)
                } else {
                    rules.push(tmpRule)
                }
            }
        }
        
        for (const formRule of rules) {
            if (formRule.formId !== flow.formUuid) {
                continue
            }
            // 判断视觉属性是否相同
            let hasSameVisionAttr = false
            for (const detailsRule of formRule.flowDetailsRules || []) {
                hasSameVisionAttr = opFunctions[detailsRule.opCode](flow.data[detailsRule.fieldId], [actionName])
                if (hasSameVisionAttr) {
                    hasSameVisionAttr = true
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
    return statusResult
}

module.exports = {
    stat,
    filterFlows,
    getRequiredUsers,
    extractInnerAndOutSourcingFormsFromConfig,
    getFlowSumStructure,
    convertToFlowStatResult,
    convertToUserActionResult,
}
