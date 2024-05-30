const _ = require("lodash")
const joiUtil = require("../utils/joiUtil")
const uuidUtil = require("../utils/uuidUtil")

const getJsonFromUnionFormattedJsonArr = (jsonArr, childKey, key, value) => {
    joiUtil.validate({
        jsonArr: {value: jsonArr, schema: joiUtil.commonJoiSchemas.arrayRequired},
        childKey: {value: childKey, schema: joiUtil.commonJoiSchemas.strRequired},
        key: {value: key, schema: joiUtil.commonJoiSchemas.strRequired},
        value: {value: value, schema: joiUtil.commonJoiSchemas.required}
    })

    let result = null
    for (const item of jsonArr) {
        if (item[key].toString() === value.toString()) {
            return item
        }
        if (item[childKey] && item[childKey].length > 0) {
            result = getJsonFromUnionFormattedJsonArr(item[childKey], childKey, key, value)
            if (result) {
                return result
            }
        }
    }
    return result
}

const flatMatchedJsonArr = (jsonArr, matchedFunc) => {
    joiUtil.validate({
        jsonArr: {value: jsonArr, schema: joiUtil.commonJoiSchemas.arrayRequired},
        matchedFunc: {value: matchedFunc, schema: joiUtil.commonJoiSchemas.funcRequired}
    })
    let matchedNodes = []
    for (const item of jsonArr) {
        if (item.children && item.children.length > 0) {
            matchedNodes = matchedNodes.concat(flatMatchedJsonArr(item.children, matchedFunc))
        }
        if (matchedFunc(item)) {
            matchedNodes.push(item)
        }
    }
    return matchedNodes
}

/**
 * 根据表单流程的所有可能的执行路径
 *
 * @param activities 表单的审核流数据
 * @param lastActivityId 上一节点的id
 * @param paths 所有的执行路径
 * @returns {*[]}
 */
const getFormExecutePaths = (activities, lastActivityId, paths = []) => {

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
                activities[i - 1].id, paths)

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

module.exports = {
    getJsonFromUnionFormattedJsonArr,
    flatMatchedJsonArr,
    getFormExecutePaths
}