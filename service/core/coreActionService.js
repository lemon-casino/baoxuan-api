const _ = require("lodash")
const flowRepo = require("../../repository/flowRepo")
const userRepo = require("../../repository/userRepo")
const redisRepo = require("../../repository/redisRepo")
const flowCommonService = require("../common/flowCommonService")
const {flowStatusConst, flowReviewTypeConst} = require("../../const/flowConst")
const {opFunctions} = require("../../const/operatorConst")
const whiteList = require("../../config/whiteList")
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

// 将对人的统计汇总成工作量的统计(按照核心动作名对基于人的统计的汇总)
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
    const overdueConfigTemplate = [
        {nameCN: "逾期", nameEN: "overdue", children: []},
        {nameCN: "未逾期", nameEN: "notOverdue", children: []}
    ]
    const flowStatConfigTemplate = [
        {nameCN: "待转入", nameEN: "TODO", children: _.cloneDeep(overdueConfigTemplate)},
        {nameCN: "进行中", nameEN: "DOING", children: _.cloneDeep(overdueConfigTemplate)},
        {nameCN: "已完成", nameEN: "DONE", children: _.cloneDeep(overdueConfigTemplate)}
    ]

    const statusKeyText = ["待", "中", "完"]
    const visionDoneMap = [
        {
            formName: "运营新品流程",
            formId: "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3",
            doneActivityIds: ["node_ockpz6phx73"]
        }, {
            formName: "运营拍摄流程",
            formId: "FORM-HT866U9170EBJIC28EBJC7Q078ZA3WEPPMIIL1",
            doneActivityIds: ["node_oclvkpzz4g1", "node_oclvkqswtb4", "node_oclvkpzz4g3", "node_oclvkqswtbc", "node_oclvkpzz4g4"]
        }, {
            formName: "天猫链接上架流程",
            formId: "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1",
            doneActivityIds: ["node_oclm91ca7l9"]
        }, {
            formName: "运营视觉流程（拍摄+美编）",
            formId: "FORM-8418BD7111594D2B82F818ADE042E48B3AM3",
            doneActivityIds: ["node_oclx03jr074d"]
        }, {
            formName: "美编修图任务",
            formId: "FORM-009E1B0856894539A60F355C5CE859EDTQYC",
            doneActivityIds: ["node_oclx422jq8o"]
        }, {
            formName: "美编任务运营发布",
            formId: "FORM-WV866IC1JU8B99PU77CDKBMZ4N5K251FLKIILS",
            doneActivityIds: ["node_oclvghx5li1", "node_oclvt49cil4", "node_oclw7dfsbp4", "node_oclvghx5li7", "node_oclvghx5li8", "node_oclw7dfsbp7", "node_oclvghx5li9", "node_oclvghx5lia", "node_oclwhrd6j63"]
        }, {
            formName: "外包拍摄视觉流程",
            formId: "FORM-30500E23B9C44712A5EBBC5622D3D1C4TL18",
            doneActivityIds: ["node_oclx49xlb32"]
        }, {
            formName: "外包修图视觉流程",
            formId: "FORM-4D592E41E1C744A3BCD70DB5AC228B01V8GV",
            doneActivityIds: ["node_oclx48iwil1"]
        }]
    const statusStatFlowResult = getFlowSumStructure(_.cloneDeep(userStatResult), flowStatConfigTemplate)
    for (const actionResult of statusStatFlowResult) {
        // 找到同名的配置
        const sameNameActionConfig = coreActionConfig.filter(item => item.actionName === actionResult.nameCN)[0]
        // 从配置 coreActionConfig 中找到类似‘全套-待xxx’中的rules
        for (const statusResult of actionResult.children) {
            const keyText = statusKeyText.filter(key => statusResult.nameCN.includes(key))[0]
            // 找到具有想匹配关键词的状态节点(s)
            const sameKeyTextStatusesConfig = sameNameActionConfig.actionStatus.filter(item => item.nameCN.includes(keyText))
            // 分别根据其中的配置，统计流程并放到逾期下对应的摄影或美编节点下
            for (const statusConfig of sameKeyTextStatusesConfig) {
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
                const actionName = keyText === "完" ? "合计" : getPureActionName(nameCN)

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
                        // if (keyText === "完") {
                        //     const tmpOverdueStatResult = statusResult.children.find(item => item.nameCN === "未逾期")
                        //     const visionDoneAct = visionDoneMap.find(item => item.formId === flow.formUuid)
                        //     const tmpVisionDoneActs = activities.filter(item => visionDoneAct.doneActivityIds.includes(item.activityId) && item.type === flowReviewTypeConst.HISTORY)
                        //     if (tmpVisionDoneActs.length > 0) {
                        //         if (tmpOverdueStatResult.children.length === 0) {
                        //             tmpOverdueStatResult.children.push({
                        //                 nameCN: "合计", ids: [flow.processInstanceId]
                        //             })
                        //         } else {
                        //             if (!tmpOverdueStatResult.children[0].ids.includes(flow.processInstanceId)) {
                        //                 tmpOverdueStatResult.children[0].ids.push(flow.processInstanceId)
                        //             }
                        //         }
                        //     }
                        //     continue
                        // }

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