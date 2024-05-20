const {flowStatusConst, flowReviewTypeConst} = require("../const/flowConst")
const dateUtil = require("./dateUtil")

/**
 * 扁平化流程审核节点信息（将有效的domainList信息提出来）
 * @param flow
 * @returns {*}
 */
const flatReviewItems = (flow) => {
    const newFlow = {...flow}
    let newReviewItems = []
    for (const item of newFlow.overallprocessflow) {
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

    newFlow.overallprocessflow = newReviewItems
    return newFlow
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
 *
 * 存在没完成或之前完成的情况
 * @param userId
 * @param flow
 * @param reviewItems
 * @returns {{userJoined: boolean, userFinished: boolean, userTodayFinished: boolean}|boolean}
 */
const isUserHasFinishedTodayFlow = (userId, flow, reviewItems) => {
    let userTodayFinished = false
    const newFlow = flatReviewItems(flow)

    for (const item of newFlow.overallprocessflow) {
        if (reviewItems && reviewItems.length > 0 && !reviewItems.includes(item.activityId)) {
            continue
        }

        if (item.operatorUserId === userId) {
            if (item.type === flowReviewTypeConst.HISTORY) {
                const doneDate = dateUtil.formatGMT2Str(item.operateTimeGMT, "YYYY-MM-DD")
                userTodayFinished = doneDate === dateUtil.format2Str(new Date(), "YYYY-MM-DD")
            } else {
                userTodayFinished = false
            }
        }
    }
    return userTodayFinished
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
 *
 * 上一步必须是正在做，不能跨步计算
 * @param userId
 * @param flow
 * @returns {boolean}
 */
const isUserTodoFlow = (userId, flow, reviewItems) => {
    for (let i = 0; i < flow.overallprocessflow.length; i++) {
        const reviewItem = flow.overallprocessflow[i]
        if (reviewItem.type === flowReviewTypeConst.TODO && i < flow.overallprocessflow.length - 1) {
            const nextNode = flow.overallprocessflow[i + 1]
            if (nextNode.domainList && nextNode.domainList.length > 0) {
                for (const domain of nextNode.domainList) {
                    if (reviewItems && !reviewItems.includes(domain.activityId)) {
                        continue
                    }
                    if (domain.operator === userId) {
                        return true
                    }
                }
            } else {
                if (nextNode.operatorUserId === userId) {
                    if (reviewItems && !reviewItems.includes(nextNode.activityId)) {
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

/**
 * 将ids从底往上汇总
 * node结构每一级需要children节点
 *
 * @param data
 * @returns {*}
 */
const attachIdsAndSum = (data) => {

    const handleItem = (item) => {
        if (item.children) {
            const uniqueIds = {}
            for (const child of item.children) {
                const newChild = attachIdsAndSum(child)
                for (const id of newChild.ids) {
                    uniqueIds[id] = 1
                }
            }
            item.ids = Object.keys(uniqueIds)
        }
        if (item.ids) {
            item.sum = item.ids.length
        } else {
            item.sum = 0
            item.ids = []
        }
        return item
    }

    if (data instanceof Array) {
        for (let item of data) {
            if (item.children) {
                item = handleItem(item)
            }
        }
    } else {
        data = handleItem(data)
    }

    return data
}

/**
 * 获取最新的不重复的审核节点数据
 *
 * @param reviewItems
 * @returns {*[]}
 */
const getLatestUniqueReviewItems = (reviewItems) => {
    const uniqueFieldIds = {}
    for (let i = reviewItems.length - 1; i >= 0; i--) {
        const activityId = reviewItems[i].activityId
        if (!Object.keys(uniqueFieldIds).includes(activityId)) {
            uniqueFieldIds[activityId] = reviewItems[i]
        }
    }

    const newReviewItems = []
    const keys = Object.keys(uniqueFieldIds)
    for (let i = keys.length - 1; i >= 0; i--) {
        newReviewItems.push(uniqueFieldIds[keys[i]])
    }
    return newReviewItems
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
    isUserTerminatedFlow,
    attachIdsAndSum,
    getLatestUniqueReviewItems
}