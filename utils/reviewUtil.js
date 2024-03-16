const moment = require("moment")

const unlimitedTime = 9999999

const reviewStatus = {
    "done": "HISTORY",
    "doing": "DOING",
    "todo": "TODO"
}

const extractTimeRequirement = (reviewRequirements, nodeId) => {
    if (!reviewRequirements || !reviewRequirements.length) {
        return unlimitedTime;
    }
    const requiredTime = loopReviewNode(reviewRequirements, nodeId)
    return requiredTime
}

const loopReviewNode = (node, nodeId) => {
    if (node instanceof Array) {
        for (const requirement of node) {
            if (requirement.id === nodeId) {
                return requirement.time
            }
            if (node.children && node.children.length) {
                loopReviewNode(node.children, nodeId)
            }
        }
        return unlimitedTime;
    } else {
        return unlimitedTime
    }
}

const addCostToReviewOfFlow = async (flow, reviewRequirements) => {
    const flowReviewDetails = flow.overallprocessflow
    // 审核信息完整
    if (!flowReviewDetails || !flowReviewDetails.length) {
        return flow
    }

    let lastStep = null;
    // 遍历每个审核节点
    for (const reviewItem of flowReviewDetails) {
        // todo: 全部状态信息不明确，明确后可以设置上所有可以停止的状态，下个判断可以取消
        // 遍历到进行中状态的节点停止：非完成状态
        if ((reviewItem.type === reviewStatus.doing || reviewItem.type === reviewStatus.todo) && lastStep) {
            break;
        }
        // 对于type为history表示已完成且不是第一个的节点进行统计
        if (reviewItem.type === reviewStatus.done && lastStep) {
            const endTime = moment(reviewItem.operateTimeGMT);
            const startTime = moment(lastStep.operateTimeGMT);
            const costOfHours = endTime.diff(startTime, "hours", true).toFixed(2)
            const limitedTime = extractTimeRequirement(reviewRequirements, reviewItem.activityId)
            reviewItem["cost"] = parseFloat(costOfHours);
            reviewItem["limitedTime"] = limitedTime === unlimitedTime.cost ? unlimitedTime.name : limitedTime;
            reviewItem["isOverDue"] = costOfHours > limitedTime;
        }
        lastStep = reviewItem
    }
    return {...flow, overallprocessflow: flowReviewDetails}
}

module.exports = {
    unlimitedTime,
    reviewStatus,
    extractTimeRequirement,
    addCostToReviewOfFlow
}