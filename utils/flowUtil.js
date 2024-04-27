const flowStatusConst = require("../const/flowStatusConst")
const flowReviewTypeConst = require("../const/flowReviewTypeConst")
const dateUtil = require("./dateUtil")

/**
 * 扁平化流程审核节点信息（将有效的domainList信息提出来）
 * @param flow
 * @returns {*}
 */
const flatReviewItems = (flow) => {
    let newReviewItems = []
    for (const item of flow.overallprocessflow) {
        if (item.domainList && item.domainList.length > 0) {
            newReviewItems = newReviewItems.concat(
                item.domainList.map(subItem => {
                        // 操作人的id在主线上是operatorUserId，domainList中是operator
                        return {...subItem, operatorUserId: subItem.operator}
                    }
                ))
        } else {
            newReviewItems.push(item)
        }
    }

    flow.overallprocessflow = newReviewItems
    return flow
}

/**
 * 该流程是否是今天完成
 * @param flow
 * @returns {boolean}
 */
const isFinishedTodayFlow = (flow) => {
    const dateFormat = "YYYY-MM-DD"
    return flow.instanceStatus = flowStatusConst.RUNNING &&
        dateUtil.formatGMT2Str(flow.modifiedTimeGMT, dateFormat) === dateUtil.format2Str(new Date(), dateFormat)
}

/**
 * 用户是否在今天完成了流程(可以指定要过滤的节点)
 * @param userId
 * @param flow
 * @returns {boolean}
 */
const isUserHasFinishedTodayFlow = (userId, flow, reviewItems) => {
    let userFinished = false
    const newFlow = flatReviewItems(flow)
    for (const item of newFlow.overallprocessflow) {
        if (reviewItems && reviewItems.length > 0 && !reviewItems.includes(item.activityId)) {
            continue
        }

        if (item.operatorUserId === userId) {
            if (item.type !== flowReviewTypeConst.HISTORY) {
                return false
            }
            // 需要确定本人今天已完成所有相关的工作
            const doneDate = dateUtil.formatGMT2Str(item.operateTimeGMT, "YYYY-MM-DD")
            userFinished = doneDate === dateUtil.format2Str(new Date(), "YYYY-MM-DD")
        }
    }
    return userFinished
}

/**
 * 用户是否正在做该流程(可以指定要过滤的审核节点)
 * @param userId
 * @param flow
 * @returns {boolean}
 */
const isUserDoingFlow = (userId, flow, reviewItems) => {
    const newFlow = flatReviewItems(flow)
    for (const item of newFlow.overallprocessflow) {
        if (reviewItems && reviewItems.length > 0 && !reviewItems.includes(item.activityId)) {
            continue
        }
        if (item.operatorUserId === userId) {
            if (item.type === flowReviewTypeConst.TODO) {
                return true
            }
        }
    }
    return false
}

/**
 * 用户是否准备要做该流程(可以指定要过滤的审核节点)
 * @param userId
 * @param flow
 * @returns {boolean}
 */
const isUserTodoFlow = (userId, flow, reviewItems) => {
    for (let i = 0; i < flow.overallprocessflow.length; i++) {
        const reviewItem = flow.overallprocessflow[i]
        if (reviewItem.type === flowReviewTypeConst.TODO) {
            if (reviewItem.domainList && reviewItem.domainList.length > 0) {
                for (const domain of reviewItem.domainList) {
                    if (reviewItems && !reviewItems.includes(domain.activityId)) {
                        continue
                    }
                    if (domain.operator === userId) {
                        return true
                    }
                }
            } else {
                if (reviewItem.operatorUserId === userId) {
                    if (reviewItems && !reviewItems.includes(reviewItem.activityId)) {
                        continue
                    }
                    return true
                }
            }
        }
    }

    return false
}

/**
 * 用户已做过的节点是否有逾期(可以指定节点判断)
 * @param userId
 * @param flow
 * @param reviewItems
 */
const isUserDoneOverDueFlow = (userId, flow, reviewItems) => {
    const newFlow = flatReviewItems(flow)
    for (const item of newFlow.overallprocessflow) {
        if (reviewItems && reviewItems.length > 0 && !reviewItems.includes(item.activityId)) {
            continue
        }
        if (item.operatorUserId === userId) {
            if (item.type === flowReviewTypeConst.HISTORY && item.isOverDue) {
                return true
            }
        }
    }
    return false
}


/**
 * 用户正在做的节点是否有逾期(可以指定节点判断)
 * @param userId
 * @param flow
 * @param reviewItems
 */
const isUserDoingOverDueFlow = (userId, flow, reviewItems) => {
    const newFlow = flatReviewItems(flow)
    for (const item of newFlow.overallprocessflow) {
        if (reviewItems && reviewItems.length > 0 && !reviewItems.includes(item.activityId)) {
            continue
        }

        if (item.operatorUserId === userId) {
            if (item.type === flowReviewTypeConst.TODO && item.isOverDue) {
                return true
            }
        }
    }
    return false
}

/**
 * 用户是否参与了异常流程(可以指定审核流程节点)
 * @param userId
 * @param flow
 * @param reviewItems
 * @returns {boolean}
 */
const isUserErrorFlow = (userId, flow, reviewItems) => {
    if (flow.instanceStatus !== flowStatusConst.ERROR) {
        return false
    }
    return isUserJoinFlow(userId, flow, reviewItems)
}

/**
 * 用户是否参与了异常流程(可以指定审核流程节点)
 * @param userId
 * @param flow
 * @param reviewItems
 * @returns {boolean}
 */
const isUserTerminatedFlow = (userId, flow, reviewItems) => {
    if (flow.instanceStatus !== flowStatusConst.TERMINATED) {
        return false
    }
    return isUserJoinFlow(userId, flow, reviewItems)
}

/**
 * 判断用户是否参与了流程(可以指定审核流节点)
 * @param userId
 * @param flow
 * @param reviewItems
 */
const isUserJoinFlow = (userId, flow, reviewItems) => {
    const newFlow = flatReviewItems(flow)
    for (const item of newFlow.overallprocessflow) {
        if (reviewItems && reviewItems.length > 0 && !reviewItems.includes(item.activityId)) {
            continue
        }
        if (item.operatorUserId === userId) {
            return true
        }
    }
    return false
}

module.exports = {
    flatReviewItems,
    isUserDoingFlow,
    isUserTodoFlow,
    isUserHasFinishedTodayFlow,
    isFinishedTodayFlow,
    isUserDoingOverDueFlow,
    isUserDoneOverDueFlow,
    isUserErrorFlow,
    isUserTerminatedFlow
}