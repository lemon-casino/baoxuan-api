const _ = require("lodash")
const userRepo = require("@/repository/userRepo");
const outUsersRepo = require("@/repository/outUsersRepo");
const flowCommonService = require("@/service/common/flowCommonService");
const flowUtil = require("@/utils/flowUtil")
const algorithmUtil = require("@/utils/algorithmUtil");
const {activityIdMappingConst, flowStatusConst} = require("@/const/flowConst")
const operatorConst = require("@/const/ruleConst/operatorConst")
const conditionConst = require("@/const/ruleConst/conditionConst")
const visionConst = require("@/const/tmp/visionConst");

const ownerFrom = {"FORM": "FORM", "PROCESS": "PROCESS"}

/**
 * 根据人名和核心动作配置信息统计流程
 *
 * @param users
 * @param currFlows
 * @param coreConfig
 * @param userFlowDataStatFunc
 *        参数： const statVisionUserFlowData = (resultNode, ownerActivity, flow) => {
 *     返回结果：[{ actionName: "", workload: "0", children: [ { fieldId: "", fieldName: "", value: "0" } ] } ]
 *
 * @returns {Promise<*[]>}
 */
const stat = async (users, flows, coreConfig, userFlowDataStatFunc) => {
    // return (await statForHasRulesNode(users, flows, coreConfig, userFlowDataStatFunc, ""))
   
    const rules = collectRulesNode(coreConfig, "")
    const tasks = rules.map(rule => {
        return () => {
            statFlowsByRules(users, flows, userFlowDataStatFunc, rule)
        }
    })
    await Promise.all(tasks.map(task => task()))
    return coreConfig
}

/**
 * 添加一层方法便于递归调用
 *
 * @param users
 * @param flows
 * @param coreConfigs
 * @param userFlowDataStatFunc
 * @returns {Promise<*>}
 */
const statForHasRulesNode = async (users, flows, coreConfigs, userFlowDataStatFunc, parentFullActionName) => {
    for (let actionConfig of coreConfigs) {
        const useLinkCharacter = parentFullActionName ? "-" : ""
        actionConfig.fullActionName = `${parentFullActionName}${useLinkCharacter}${actionConfig.actionName}`
        if (actionConfig.rules && actionConfig.rules.length > 0) {
            actionConfig = await statFlowsByRules(users, flows, userFlowDataStatFunc, actionConfig)
        }
        
        if (actionConfig.children && actionConfig.children.length > 0) {
            coreConfigs.children = await statForHasRulesNode(
                users,
                flows,
                actionConfig.children,
                userFlowDataStatFunc,
                actionConfig.fullActionName
            )
        }
    }
    
    return coreConfigs
}

const collectRulesNode = (coreConfigs, parentFullActionName) => {
    let rules = []
    for (let actionConfig of coreConfigs) {
        const useLinkCharacter = parentFullActionName ? "-" : ""
        actionConfig.fullActionName = `${parentFullActionName}${useLinkCharacter}${actionConfig.actionName}`
        if (actionConfig.rules && actionConfig.rules.length > 0) {
            rules.push(actionConfig)
        }
        
        if (actionConfig.children && actionConfig.children.length > 0) {
            const tmpRules = collectRulesNode(actionConfig.children, actionConfig.fullActionName)
            rules = rules.concat(tmpRules)
        }
    }
    return rules
}

/**
 * 根据 rule 统计流程数据
 * 将结果放到resultNode中返回
 *
 * @param resultNode
 * @param rules
 * @param requiredFlows
 * @param userFlowDataStatFunc
 * @param users
 * @returns {Promise<*>}
 */
const statFlowsByRules = (users, flows, userFlowDataStatFunc, resultNode) => {
    for (const rule of resultNode.rules) {
        // llx: _.cloneDeep(flows)
        let requiredFlows = flows.filter((flow) => flow.formUuid === rule.formId)
        requiredFlows = filterFlowsByFlowDetailsRules(requiredFlows, rule.flowDetailsRules)
        
        if (requiredFlows.length === 0) {
            continue
        }
        
        for (const flowNodeRule of rule.flowNodeRules) {
            const {activityId, status, isOverdue, owner} = flowNodeRule
            
            // 根据节点配置对流程进行汇总
            for (const flow of requiredFlows) {
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
                
                const userFlowDataStat = userFlowDataStatFunc && userFlowDataStatFunc(resultNode, ownerActivity, flow)
                
                const haveMatchedData = userFlowDataStat && userFlowDataStat.length > 0
                let wrappedUserFlowDataStat = null
                
                if (haveMatchedData) {
                    wrappedUserFlowDataStat = {
                        processInstanceId: flow.processInstanceId,
                        flowData: userFlowDataStat
                    }
                }
                
                let resultStatNode = resultNode.children.filter(item => item.actionName === ownerActivity.actionName)
                const userHasStat = resultStatNode.length > 0
                if (userHasStat) {
                    const currResultStatNode = resultStatNode[0]
                    // 避免一人在同一流程中干多个活重复计算
                    if (!currResultStatNode.ids.includes(processInstanceId)) {
                        currResultStatNode.ids.push(processInstanceId)
                        currResultStatNode.sum = currResultStatNode.ids.length
                    }
                    
                    // 同一人流程中会出现多次干不同的活，将本人所有该流程中节点工作量的统计去重处理才能保证不漏
                    if (haveMatchedData) {
                        const currFlowStat = currResultStatNode.userFlowsDataStat.find(item => item.processInstanceId == processInstanceId)
                        if (currFlowStat) {
                            const alreadyStatActivityNames = currFlowStat.flowData.map(item => item.actionName)
                            for (const actStat of wrappedUserFlowDataStat.flowData) {
                                if (!alreadyStatActivityNames.includes(actStat.actionName)) {
                                    currFlowStat.flowData.push(actStat)
                                }
                            }
                        } else {
                            currResultStatNode.userFlowsDataStat.push(wrappedUserFlowDataStat)
                        }
                    }
                } else {
                    resultStatNode = {
                        actionName: ownerActivity.actionName,
                        sum: 1,
                        ids: [processInstanceId],
                        userFlowsDataStat: wrappedUserFlowDataStat ? [wrappedUserFlowDataStat] : []
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
    //llx:_.cloneDeep(flows)
    let result = flows
    
    if (flowDetailsRules) {
        for (const detailsRule of flowDetailsRules) {
            if (detailsRule.condition === conditionConst.condition.AND) {
                result = result.filter(flow => {
                    return operatorConst.opFunctions[detailsRule.opCode](flow.data[detailsRule.fieldId], detailsRule.value)
                })
            } else {
                //llx:  _.cloneDeep(flows)
                const orFlows = flows.filter(flow => {
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
        
        if (activity.activityId === activityId && status.includes(activity.type)) {
            if (activity.isOverDue !== undefined) {
                if (isOverdue === activity.isOverDue) {
                    return activity
                }
            } else {
                if (isOverdue === false) {
                    return activity
                }
            }
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
 * @returns {{activity, actionName: string, tags: *}|null}
 */
const extendActivityWithOwnerNameAndTags = (activity, users, flow, ownerRule) => {
    let ownerName = "未分配"
    let {from, id, default: defaultUserName} = ownerRule
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
        return {actionName: ownerName, tags: user.tags, activity: activity}
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
                const l1ActionStructure = {actionName: l1Action, children: []}
                for (const l2Action of leve2Actions) {
                    const l2ActionStructure = {
                        actionName: l2Action, children: []
                    }
                    
                    // 找出所有key所对应的逾期所包含的children
                    for (const result of userStatResult) {
                        let ids = []
                        let userFlowsDataStat = []
                        const actionName = result.actionName
                        
                        const sameKeyTextStat = result.children.filter(item => item.actionName.includes(currStatusKeyText))
                        for (const statusActionStat of sameKeyTextStat) {
                            const overdueActionStat = statusActionStat.children.find(item => item.actionName === l2Action)
                            const userActionStat = overdueActionStat.children.filter(item => usernames.includes(item.actionName))
                            if (userActionStat.length > 0) {
                                for (const stat of userActionStat) {
                                    ids = ids.concat(stat.ids)
                                    userFlowsDataStat = userFlowsDataStat.concat(stat.userFlowsDataStat)
                                }
                            }
                        }
                        l2ActionStructure.children.push({
                            actionName: actionName,
                            ids,
                            sum: ids.length,
                            userFlowsDataStat
                        })
                    }
                    l1ActionStructure.children.push(l2ActionStructure)
                }
                result.push(l1ActionStructure)
            }
            return result
        }
        if (!user.username.includes("离职")) {
            const userStatStructure = {
                actionCode: "userActStat", actionName: user.username, children: getActionChildren(user.children)
            }
            userStatArr.push(userStatStructure)
        }
    }
    return userStatArr
}

module.exports = {
    stat,
    filterFlows,
    getRequiredUsers,
    extractInnerAndOutSourcingFormsFromConfig,
    convertToUserActionResult,
    filterFlowsByFlowDetailsRules,
    getMatchedActivity
}
