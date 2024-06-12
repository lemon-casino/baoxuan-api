const _ = require("lodash");
const getReviewItem = (activityId, reviewItems) => {
    for (const reviewItem of reviewItems) {
        if (activityId === reviewItem.id) {
            return reviewItem
        }
        if (reviewItem.children && reviewItem.children.length > 0) {
            const tmpReviewItem = getReviewItem(activityId, reviewItem.children)
            if (tmpReviewItem) {
                return tmpReviewItem
            }
        }
    }
    return null
}


/**
 * 根据表单流程的所有可能的执行路径
 *
 * @param activities 表单的审核流数据
 * @param lastActivityId 上一节点的id
 * @param paths 所有的执行路径
 * @returns {*[]}
 */
const getFormExecutePaths = (activities, lastActivityId = null, paths = []) => {

    const countActivity = (activity, activityId, paths) => {
        const activityCountInPaths = getActivityPaths(activityId, paths)
        for (const activityCountInPath of activityCountInPaths) {
            activityCountInPath.push(activity)
        }
    }

    const getActivityPaths = (activityId, paths) => {
        return paths.filter(path => path.filter(item => item.activityId === activityId).length > 0)
    }

    for (let i = 0; i < activities.length; i++) {
        const activity = activities[i]
        // 初始化
        if (i === 0 && paths.length === 0) {
            paths.push([{activityId: activity.id, activityName: activity.title}])
            continue
        }
        // 分支容器节点
        if (activity.componentName === "ConditionContainer") {
            // 找到直接上一节点所在的path，跟进
            countActivity(
                {activityId: activity.id, activityName: activity.title},
                lastActivityId || activities[i - 1].id, paths)

            // 预先生成条件分支所需要的节点
            const activityPaths = getActivityPaths(activity.id, paths)
            for (let j = 0; j < activity.children.length; j++) {
                const conditionActivity = activity.children[j]
                if (j === activity.children.length - 1) {
                    for (const activityPath of activityPaths) {
                        activityPath.push({activityId: conditionActivity.id, activityName: conditionActivity.title})
                    }
                    continue
                }
                const newActivityPaths = _.cloneDeep(activityPaths)
                for (const newActivityPath of newActivityPaths) {
                    newActivityPath.push({activityId: conditionActivity.id, activityName: conditionActivity.title})
                }
                paths = paths.concat(newActivityPaths)
            }

            // 遍历分支节点
            paths = getFormExecutePaths(activity.children, activity.id, paths)
        }
        // 具体的分支节点
        else if (activity.componentName === "ParallelNode" || activity.componentName === "ConditionNode") {
            // 节点已经在遍历到上一级节点ConditionContainer时，统计过了
            paths = getFormExecutePaths(activity.children, activity.id, paths)
        }
        // 普通节点
        else {
            // 找到直接上一节点所在的path，跟进
            countActivity(
                {activityId: activity.id, activityName: activity.title},
                lastActivityId || activities[i - 1].id, paths)
        }
    }
    return paths
}

/**
 * 获取表单流程的最长执行路径
 *
 * @param activities
 * @returns {*[]}
 */
const getLongestFormExecutePath = (activities) => {
    const formAllExecutePaths = getFormExecutePaths(activities)
    let longestFormExecutePath = []
    for (const path of formAllExecutePaths) {
        if (path.length > longestFormExecutePath.length) {
            longestFormExecutePath = path
        }
    }
    return longestFormExecutePath
}

/**
 * 根据fieldId获取对应的表单值
 *
 * 表单种定义的fieldId，在钉钉返回实际表单数据时，有时会在field后面添加"_id"或者"_value"
 *
 * @param fieldId
 * @param data
 * @returns {*}
 */
const getFieldValue = (fieldId, data) => {
    return data[fieldId] || data[`${fieldId}_id`] || data[`${fieldId}_value`]
}

module.exports = {
    getFieldValue,
    getReviewItem,
    getFormExecutePaths,
    getLongestFormExecutePath
}