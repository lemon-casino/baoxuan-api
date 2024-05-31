/**
 * 统计用户的流程数据
 */

const _ = require("lodash")
const commonLogic = require("./commonLogic")
const {flowStatusConst, activityIdMappingConst, flowReviewTypeConst} = require("../../const/flowConst")
const {errorCodes} = require("../../const/errorConst")
const flowFormReviewUtil = require("../../utils/flowFormReviewUtil")
const {opCodes} = require("../../const/operatorConst")
const NotFoundError = require("../../error/http/notFoundError")

/**
 * 获取人的流程统计
 *
 * @param userNames 需要过滤出来的人名， 为空时会统计全公司所有人
 * @param flows 需要统计的流程
 * @param forms 表单的统计配置 [formName:"", ..., children: [{activityName: "",..., children: []}]]
 * @returns {Promise<*[]>}
 */
const get = async (userNames, flows, forms) => {
    const finalResult = []
    const formsReviewCache = {}
    for (const form of forms) {
        const formFlowStatResult = [
            {status: flowStatusConst.RUNNING, name: "进行中", sum: 0, ids: []},
            {status: flowStatusConst.COMPLETE, name: "已完成", sum: 0, ids: []},
            {status: flowStatusConst.TERMINATED, name: "终止", sum: 0, ids: []},
            {status: flowStatusConst.ERROR, name: "异常", sum: 0, ids: []}
        ]
        const formResult = {formId: form.flowFormId, formName: form.flowFormName, children: []}
        // 根据动作配置信息对flow进行统计
        const formFlows = flows.filter(flow => flow.formUuid === form.flowFormId)
        for (const flow of formFlows) {
            const flowReviewItems = flow.reviewId ? await commonLogic.getFormReview(flow.reviewId, formsReviewCache) : []
            const params = await prepareParam(flow, userNames, flowReviewItems)
            let formResultWithActivity = null
            try {
                formResultWithActivity = await preGenerateActivityResult(formResult, flow, userNames)
            } catch (e) {
                if (e.code === errorCodes.notFound) {
                    continue
                }
            }

            await countFlowIntoActivitiesResult(formResultWithActivity, params)
            // 根据流程状态汇总流程
            for (const statusResult of formFlowStatResult) {
                if (statusResult.status === flow.instanceStatus) {
                    statusResult.ids.push(flow.processInstanceId)
                    statusResult.sum = statusResult.ids.length
                }
            }
        }

        const formReviews = form.flowFormReviews[0]?.formReview
        if (formReviews && formReviews.length > 0) {
            sortFormResultAccordingToLatestReviewItems(formResult, formReviews)
        }

        // remove activityIds
        for (let i = 0; i < formResult.children.length; i++) {
            const activityResult = formResult.children[i]
            formResult.children[i] = {activityName: activityResult.activityName, children: activityResult.children}
        }

        // 添加对该表单所对应的所有流程的汇总
        formResult.flowsStat = formFlowStatResult
        finalResult.push(formResult)
    }
    return finalResult
}


/**
 *  将flow统计到activityResult中
 *
 * @param formResult
 * @param params
 * @returns {Promise<void>}
 */
const countFlowIntoActivitiesResult = async (formResult, params) => {
    // 将流程根据节点和状态进行统计
    for (const activityResult of formResult.children) {
        if (params.statKey === "userName") {
            const userActivities = params.originActivities.filter(item => activityResult.activityIds.includes(item.activityId))
            if (userActivities.length === 0) {
                continue
            }
            // 分别汇总到多个人
            for (const userActivity of userActivities) {
                params.activity = userActivity
                params.statValue = userActivity.operatorName
                await countFlowIntoActivityResult(activityResult, params)
            }
        } else {
            // todo: 等开发
            params.currActivity = []
            params.statValue = activityResult.activityName
            await countFlowIntoActivityResult(activityResult, params)
        }
    }
}

// 根据最新的流程表单对节点进行排序，不在其中的节点拍到后面
const sortFormResultAccordingToLatestReviewItems = (formResult, reviewItems) => {
    const longestExecutePath = flowFormReviewUtil.getLongestFormExecutePath(reviewItems)
    if (longestExecutePath[0].activityName = "发起") {
        longestExecutePath[0].activityName = "提交申请"
        longestExecutePath[0].activityId = activityIdMappingConst[longestExecutePath[0].activityId]
    }
    // 根据最新的流程表单节点顺序，为结果中的节点增加order，进行排序
    formResult.children.map(item => {
        const activityIndex = longestExecutePath.findIndex(activity => activity.activityName === item.activityName)
        if (activityIndex > -1) {
            item.order = activityIndex
        } else if (item.activityName === "未知") {
            item.order = 999
        } else {
            item.order = 777
        }
        return item
    })
    formResult.children.sort((curr, next) => curr.order - next.order)
}

/**
 * 生成需要的 params
 *
 * @param flow
 * @param userNames
 * @param flowFormReviews
 * @returns {Promise<{statKey: string, originActivities: *, flowFormReviews}>}
 */
const prepareParam = async (flow, userNames, flowFormReviews) => {
    const params = {
        // 最新的表单流程，用于处理待转入查找最近的工作节点
        flowFormReviews: flowFormReviews,
        // 原始的审核流程，判断待转入用
        originActivities: flow.overallprocessflow,
        // 最底层汇总key
        statKey: "userName"
    }
    if (userNames) {
        // 筛选判断人名的fun
        params.funcUserNames = {opCode: opCodes.Contain, value: userNames}
    }
    return params
}

/**
 * 根据流程的审核节点生成activityResult放到 formResult中
 *
 * @param formResult
 * @param flow
 * @param userNames
 * @returns {*}
 */
const preGenerateActivityResult = (formResult, flow, userNames) => {
    // 对于异常的节点自定义为unknown表示
    flow.overallprocessflow = flow.overallprocessflow.map(item => {
        if (!item.activityId) {
            return {...item, activityId: "unKnown", showName: "未知"}
        }
        return item
    })

    // 因为流程经常改动，根据最新的表单流程生成的formResult会有节点信息丢失
    // 补充formResult的信息
    let userActivities = flow.overallprocessflow
    if (userNames) {
        userActivities = userActivities.filter(item => userNames.includes(item.operatorName))
    }

    if (userActivities.length === 0) {
        throw new NotFoundError("未找到相关的审核节点")
    }

    for (const activity of userActivities) {
        const sameActivities = formResult.children.filter(item => item.activityName === activity.showName)
        if (sameActivities.length === 0) {
            formResult.children.push({
                activityIds: [activity.activityId],
                activityName: activity.showName,
                children: _.cloneDeep(overdueMixedStatusStructure)
            })
        } else {
            sameActivities[0].activityIds.push(activity.activityId)
        }
    }
    return formResult
}

// 将根据节点状态，将流程 统计到 activityResult 中
const countFlowIntoActivityResult = async (activityResult, params) => {
    // 查找需要汇总到的匹配状态的activityStatusResult中
    const activityStatusResult = findActivityStatusResult(params, activityResult)
    // 待转入状态可能会不用统计，返回null
    if (activityStatusResult) {
        commonLogic.statFlowToResultNode(params.originActivities[0].processInstanceId, params.statKey, params.statValue, activityStatusResult)
    }
}

/**
 * 找到当前统计的节点所对应的状态Result
 *
 * @param userActivities
 * @param activityResult
 * @param params
 * @returns {*|null}
 */
const findActivityStatusResult = (params, activityResult) => {
    const {activity} = params
    // 第一个节点为forcast， 则其他节点均为forcast
    if (activity.type === flowReviewTypeConst.FORCAST) {
        //  flowFormReviews>1的情况在分支条件下会出现，同样只要判断第一个即可
        // const forecastReviewItem = forecastReviewItems[0]
        const reviewItem = flowFormReviewUtil.getReviewItem(activity.activityId, params.flowFormReviews)
        if (reviewItem && reviewItem.lastTimingNodes && reviewItem.lastTimingNodes.length > 0) {
            // 所有的临近节点状态都为进行中
            let lastNodeIsDoing = true
            for (const nodeId of reviewItem.lastTimingNodes) {
                const isDoing = params.originActivities.filter(
                    item => item.activityId === nodeId && item.type === flowReviewTypeConst.TODO
                ).length > 0

                if (!isDoing) {
                    lastNodeIsDoing = false
                    break
                }
            }

            if (lastNodeIsDoing) {
                const activityForecastResult = activityResult.children.filter(item => item.type === flowReviewTypeConst.FORCAST)
                return activityForecastResult[0]
            }
        }
        return null
    }

    // // 存在一个进行中的节点
    // const todoReviewItems = activity.filter(item => item.type === flowReviewTypeConst.TODO)
    //
    // let activityStatusResult = null
    // let flowReviewType = flowReviewTypeConst.HISTORY
    // if (todoReviewItems.length > 0) {
    //     flowReviewType = flowReviewTypeConst.TODO
    // }
    const activityStatusResult = activityResult.children.filter(item => item.type === activity.type)[0]

    if (!activity.isOverDue) {
        activity.isOverDue = false
    }
    const activityOverdueStatusResult = activityStatusResult.children.filter(item => activity.isOverDue === item.isOverDue)[0]

    return activityOverdueStatusResult
}

const overdueMixedStatusStructure = [
    {name: "待转入", type: flowReviewTypeConst.FORCAST, children: [], excludeUpSum: true},
    {
        name: "进行中",
        type: flowReviewTypeConst.TODO,
        children: [{name: "未逾期", isOverDue: false, children: []}, {name: "逾期", isOverDue: true, children: []}]
    },
    {
        name: "已完成", type: flowReviewTypeConst.HISTORY,
        children: [{name: "未逾期", isOverDue: false, children: []}, {name: "逾期", isOverDue: true, children: []}]
    }
]

module.exports = {get}
