const _ = require("lodash")
const flowUtil = require("../../utils/flowUtil")
const flowFormReviewUtil = require("../../utils/flowFormReviewUtil")
const {
    flowReviewTypeConst
} = require("../../const/flowConst")
const commonLogic = require("./commonLogic")

const overdueAloneStatusStructure = [
    {name: "待转入", type: flowReviewTypeConst.FORCAST, excludeUpSum: true, children: []},
    {
        name: "进行中",
        type: flowReviewTypeConst.TODO,
        children: []
    },
    {
        name: "已完成", type: flowReviewTypeConst.HISTORY,
        children: []
    },
    {
        name: "已逾期", type: "OVERDUE", excludeUpSum: true, children: [
            {
                name: "进行中",
                type: flowReviewTypeConst.TODO,
                children: []
            },
            {
                name: "已完成", type: flowReviewTypeConst.HISTORY,
                children: []
            }]
    }
]


/**
 * 初始化单个表单的数据
 *
 * @param form
 */
const initSingleFormResult = (form, statusStructure) => {
    const formResult = {...form, children: []}
    // 当前children 的数据包括：部门或者节点
    if (form.children && form.children.length > 0) {
        for (const formChild of form.children) {
            const formChildResult = {...formChild, children: []}
            formChildResult.children = _.cloneDeep(statusStructure)
            formResult.children.push(formChildResult)
        }
    }
    return formResult
}

/**
 * 将流程（flow）按照节点信息（activityConfig）-统计到状态结果（statusResult）的statKey中进行统计
 * flowFormReviews： 待转入判断需要判断临近的工作节点状态
 *
 * @param flow
 * @param activityConfig
 * @param statusResult
 * @param statKey 统计的key：人名-userName、部门-deptName
 * @param flowFormReviews
 * @param firstFilteredReviewItems
 */
const statFlow = (flow, activityConfig, statusResult, statKey, flowFormReviews, firstFilteredReviewItems) => {
    const processInstanceId = flow.processInstanceId
    let statValue = ""
    if (statKey === "activityName") {
        statValue = activityConfig.activityName
    }

    // 如果流程节点中还没有统计的节点信息（可能未开始），则直接跳过
    if (firstFilteredReviewItems.length > 0) {
        // 1.待转入：存在节点的状态为forcast 并且临近的节点(s)的状态为todo
        if (statusResult.type === flowReviewTypeConst.FORCAST) {
            const forecastReviewItems = firstFilteredReviewItems.filter(item => item.type === flowReviewTypeConst.FORCAST)
            if (forecastReviewItems.length > 0) {
                //  flowFormReviews>1的情况在分支条件下会出现，同样只要判断第一个即可
                const forecastReviewItem = forecastReviewItems[0]
                const reviewItem = flowFormReviewUtil.getReviewItem(forecastReviewItem.activityId, flowFormReviews)
                if (reviewItem && reviewItem.lastTimingNodes && reviewItem.lastTimingNodes.length > 0) {
                    // 所有的临近节点状态都为进行中
                    let lastNodeIsDoing = true
                    for (const nodeId of reviewItem.lastTimingNodes) {
                        const isDoing = flow.overallprocessflow.filter(
                            item => item.activityId === nodeId && item.type === flowReviewTypeConst.TODO
                        ).length > 0

                        if (!isDoing) {
                            lastNodeIsDoing = false
                            break
                        }
                    }

                    if (lastNodeIsDoing) {
                        const actionFlowIds = statusResult.children.filter(item => item.activityName === activityConfig.activityName)
                        if (actionFlowIds.length === 0 || !actionFlowIds[0].ids.includes(processInstanceId)) {
                            if (statKey === "userName") {
                                statValue = [...new Set(forecastReviewItems.map(item => item.operatorName))].join("-")
                            }
                            commonLogic.statFlowToResultNode(processInstanceId, statKey, statValue, statusResult)
                        }
                    }
                }
            }
        }
        // 2. 进行中
        else if (statusResult.type === flowReviewTypeConst.TODO) {
            // 存在进行中的节点即算为进行中
            const todoReviewItems = firstFilteredReviewItems.filter(item => item.type === flowReviewTypeConst.TODO)
            if (todoReviewItems.length > 0) {
                if (statKey === "userName") {
                    statValue = [...new Set(firstFilteredReviewItems.map(item => item.operatorName))].join("-")
                }
                commonLogic.statFlowToResultNode(processInstanceId, statKey, statValue, statusResult)
            }
        }
        // 3. 已完成
        else if (statusResult.type === flowReviewTypeConst.HISTORY) {
            // 所有的节点状态都为history时才算完成
            const historyReviewItems = firstFilteredReviewItems.filter(item => item.type === flowReviewTypeConst.HISTORY)
            if (historyReviewItems.length === firstFilteredReviewItems.length) {
                if (statKey === "userName") {
                    statValue = [...new Set(firstFilteredReviewItems.map(item => item.operatorName))].join("-")
                }
                commonLogic.statFlowToResultNode(processInstanceId, statKey, statValue, statusResult)
            }
        }
        // 4.逾期
        else if (statusResult.type === "OVERDUE") {
            const overDueNodes = firstFilteredReviewItems.filter(item => item.isOverDue)
            // 判断是完成还是进行中
            if (overDueNodes.length > 0) {
                // 并行分支的条件下，可能会有一个流程出现两种状态的逾期情况
                const tmpTodoOverdue = overDueNodes.filter(item => item.type === flowReviewTypeConst.TODO)
                if (statKey === "userName") {
                    statValue = [...new Set(overDueNodes.map(item => item.operatorName))].join("-")
                }
                if (tmpTodoOverdue.length > 0) {
                    const todoOverDueResult = statusResult.children.filter(item => item.type === flowReviewTypeConst.TODO)[0]
                    commonLogic.statFlowToResultNode(processInstanceId, statKey, statValue, todoOverDueResult)
                }
                const tmpHistoryOverdue = overDueNodes.filter(item => item.type === flowReviewTypeConst.HISTORY)
                if (tmpHistoryOverdue.length === overDueNodes.length) {
                    const historyOverDueResult = statusResult.children.filter(item => item.type === flowReviewTypeConst.HISTORY)[0]
                    if (statKey === "userName") {

                    }
                    commonLogic.statFlowToResultNode(processInstanceId, statKey, statValue, historyOverDueResult)
                }
            }
        }
    }
}

/**
 * 按部门统计全流程数据
 *
 * @param deptIds
 * @param flows
 * @param formsDepsConfig
 * @returns {Promise<*[]>}
 */
const get = async (deptIds, flows, formsDepsConfig) => {
    const finalResult = []
    const formsReviewCache = {}
    for (const form of formsDepsConfig) {
        const formResult = initSingleFormResult(form, overdueAloneStatusStructure)
        const currFormFlows = flows.filter(flow => flow.formUuid === form.formId)
        for (const flow of currFormFlows) {
            let flowFormReviews = []
            if (flow.reviewId) {
                flowFormReviews = await  commonLogic.getFormReview(flow.reviewId, formsReviewCache)
            }
            for (const formChildResult of formResult.children) {
                for (const statusResult of formChildResult.children) {
                    const childConfig = form.children.filter(dept => dept.deptId === formChildResult.deptId)[0]
                    for (const activityConfig of childConfig.children) {
                        const firstFilteredReviewItems = flowUtil.flatReviewItems(flow).overallprocessflow.filter(
                            item => activityConfig.children.includes(item.activityId)
                        )
                        statFlow(flow, activityConfig, statusResult, "activityName", flowFormReviews, firstFilteredReviewItems)
                    }
                }
            }
        }
        finalResult.push(formResult)
    }
    return finalResult
}


module.exports = {
    get
}