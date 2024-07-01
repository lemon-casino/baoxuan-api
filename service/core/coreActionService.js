const _ = require("lodash")
const flowRepo = require("../../repository/flowRepo")
const userRepo = require("../../repository/userRepo")
const redisRepo = require("../../repository/redisRepo")
const flowCommonService = require("../common/flowCommonService")
const {flowStatusConst, flowReviewTypeConst} = require("../../const/flowConst")
const {opFunctions} = require("../../const/operatorConst")
const whiteList = require("../../config/whiteList")
const {visionFormDoneActivityIds} = require("../../const/tmp/coreActionsConst")
const departmentCoreActivityStat = require("../../core/statistic/departmentCoreActivityStat")
const flowUtil = require("../../utils/flowUtil")
const algorithmUtil = require("../../utils/algorithmUtil")

const getCoreActions = async (userId, deptId, userNames, startDoneDate, endDoneDate) => {
    const coreActionConfig = await flowRepo.getCoreActionsConfig(deptId)
    const differentForms = extractInnerAndOutSourcingFormsFromConfig(coreActionConfig)
    const configuredFormIds = differentForms.inner.concat(differentForms.outSourcing).map(item => item.formId)

    let combinedFlows = await flowCommonService.getCombinedFlowsOfHistoryAndToday(startDoneDate, endDoneDate, configuredFormIds)
    combinedFlows = flowCommonService.removeTargetStatusFlows(combinedFlows, flowStatusConst.TERMINATED)
    combinedFlows = flowCommonService.removeDoneActivitiesNotInDoneDateRange(combinedFlows, startDoneDate, endDoneDate)

    const deptExtraUserNames = await getExtraUserNamesFromRedisOfOut(userId, deptId)
    userNames = `${userNames},${deptExtraUserNames.join(",")}`

    // 基于人的汇总(最基本的明细统计)
    const userStatResult = await departmentCoreActivityStat.get(userNames, combinedFlows, coreActionConfig)

    const activityStatResult = convertToActivityStat(userStatResult)

    const statusStatFlowResult = convertToStatusStatResult(combinedFlows, coreActionConfig, userStatResult)

    // 对内部的流程进行转化统计
    const innerFormIds = differentForms.inner.map(item => item.formId)
    const innerFlows = combinedFlows.filter(item => innerFormIds.includes(item.formUuid))
    const innerStatusStatFlowResult = convertToStatusStatResult(innerFlows, coreActionConfig, userStatResult)

    // 对外包的流程进行转化统计
    const outSourcingFormIds = differentForms.outSourcing.map(item => item.formId)
    const outSourcingFlows = combinedFlows.filter(item => outSourcingFormIds.includes(item.formUuid))
    const outSourcingStatusStatFlowResult = convertToStatusStatResult(outSourcingFlows, coreActionConfig, userStatResult)

    // 以人为主线统计工作量
    let userNameArr = userNames.includes(",") ? userNames.split(",") : [userNames]
    userNameArr = userNameArr.filter(item => !!item)
    const userStatArr = []
    // 外包人员录入错乱，需要整理
    const mixedOutSourcingUsers = [
        {
            username: "皓峰摄影",
            children: ["德化皓峰", "皓峰摄影", "黄建榉"]
        },
        {
            username: "秒峰摄影",
            children: ["秒峰摄影", "妙峰", "陈辉灿"]
        },
        {
            username: "周俊腾",
            children: ["周", "周俊腾"]
        },
        {
            username: "徐彩玉",
            children: ["语嫣", "徐彩玉"]
        },
        {
            username: "芬芬",
            children: ["芬芬", " 芬 芬"]
        },
        {
            username: "美丽满屋",
            children: ["美丽满屋", "广东美丽满屋"]
        }
    ]

    const users = mixedOutSourcingUsers
    for (const username of userNameArr) {
        let isErrOutSourcingUser = false
        for (const mixedOutSourcingUser of mixedOutSourcingUsers) {
            if (mixedOutSourcingUser.children.includes(username)) {
                isErrOutSourcingUser = true
                break
            }
        }
        if (!isErrOutSourcingUser) {
            users.push({username, children: [username]})
        }
    }

    for (const user of users) {
        const getActionChildren = (usernames) => {
            const statusKeyTexts = ["待", "中", "完"]
            const leve1Actions = ["待转入", "进行中", "已完成"]
            const leve2Actions = ["逾期", "未逾期"]
            const result = []
            for (const l1Action of leve1Actions) {
                // const actionAndStatus = l1Action.split("-")
                // const basicUserStat = userStatResult.find(item => item.actionName === actionAndStatus[0])
                const currStatusKeyText = statusKeyTexts.find(key => l1Action.includes(key))

                const l1ActionStructure = {nameCN: l1Action, nameEN: "", children: []}
                for (const l2Action of leve2Actions) {
                    const l2ActionStructure = {
                        nameCN: l2Action, nameEN: "", children: []
                    }

                    // 找出所有key所对应的逾期所包含的children
                    for (const result of userStatResult) {
                        let ids = []
                        const actionName = result.actionName
                        const sameKeyTextStat = result.children.filter(item => item.nameCN.includes(currStatusKeyText))
                        for (const statusActionStat of sameKeyTextStat) {
                            const overdueActionStat = statusActionStat.children.find(item => item.nameCN === l2Action)
                            const userActionStat = overdueActionStat.children.filter(item => usernames.includes(item.userName))
                            if (userActionStat.length > 0) {
                                for (const stat of userActionStat) {
                                    ids = ids.concat(stat.ids)
                                }
                            }
                        }
                        l2ActionStructure.children.push({userName: actionName, ids, sum: ids.length})
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
                group: deptExtraUserNames.includes(user.username) ? "outSourcing" : "inner",
                actionName: user.username,
                children: getActionChildren(user.children)
            }
            userStatArr.push(userStatStructure)
        }
    }
    for (const userStat of userStatArr) {
        userStatResult.unshift(userStat)
    }
    // 向结果中填充数据
    userStatResult.unshift({
        actionName: "工作量汇总", actionCode: "sumActStat", children: activityStatResult
    })

    userStatResult.unshift({
        actionName: "流程汇总(外包)", actionCode: "sumFlowStat", children: outSourcingStatusStatFlowResult
    })
    userStatResult.unshift({
        actionName: "流程汇总(内部)", actionCode: "sumFlowStat", children: innerStatusStatFlowResult
    })
    userStatResult.unshift({
        actionName: "流程汇总", actionCode: "sumFlowStat", children: statusStatFlowResult
    })

    return flowUtil.statIdsAndSumFromBottom(userStatResult)
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
 *
 *
 * @param userId
 * @param deptId
 * @returns {Promise<*[]>}
 */
const getExtraUserNamesFromRedisOfOut = async (userId, deptId) => {
    // todo: 视觉(482162119)和全流程的统计userNames要加上外包的信息
    //   先单独处理，要不就得把外包的人全部返回视觉的前端，可能还得改http method，
    //   等数据ok稳定后需要整理
    const user = await userRepo.getUserDetails({userId})
    const userDDId = user.dingdingUserId
    // 有条件地为userNames添加外包人信息、离职人员信息
    let canGetDeptOutSourcingUsers = false
    let canGetResignUsers = false
    if (whiteList.pepArr().includes(userDDId)) {
        canGetDeptOutSourcingUsers = true
        canGetResignUsers = true
    } else {
        const redisUsers = await redisRepo.getAllUsersDetail()
        const userTargetDeps = redisUsers.find(u => u.userid === userDDId).leader_in_dept
        const userCurrDept = userTargetDeps.find(item => item.dept_id.toString() === deptId)
        if (userCurrDept && userCurrDept.leader) {
            canGetDeptOutSourcingUsers = true
            canGetResignUsers = true
        }
    }
    let deptResignUsersWithTag = []
    if (canGetResignUsers) {
        const deptResignUsers = await userRepo.getDeptResignUsers(deptId)
        deptResignUsersWithTag = deptResignUsers.map(item => `${item.nickname}[已离职]`)
    }

    let outSourcingUsers = []
    if (canGetDeptOutSourcingUsers) {
        outSourcingUsers = await redisRepo.getOutSourcingUsers(deptId)
    }
    return deptResignUsersWithTag.concat(outSourcingUsers)
}

/**
 * 将对人的统计汇总成工作量的统计(按照核心动作名对基于人的统计的汇总)
 *
 * @param userStatResult
 * @returns {*[]}
 */
const convertToActivityStat = (userStatResult) => {
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
const convertToStatusStatResult = (flows, coreActionConfig, userStatResult) => {
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
                                    return opFunctions[detailsRule.opCode](flow.data[detailsRule.fieldId], detailsRule.value)
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

                                const overdueActivity = activities.filter(item => item.activityId === overdueNode.id && overdueNode.status.includes(item.type))
                                if (overdueActivity.length === 0) {
                                    continue
                                }

                                const needToStatResult = statusResult.children.find(item => item.nameCN === (overdueActivity[0].isOverDue ? "逾期" : "未逾期"))

                                if (fromNodeMatched && toNodeMatched) {
                                    const tmpSubActionResult = needToStatResult.children.find(item => item.nameCN === actionName)
                                    if (tmpSubActionResult) {
                                        tmpSubActionResult.ids.push(flow.processInstanceId)
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
    getCoreActions
}