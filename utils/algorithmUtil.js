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

// paths: 二位数组
const formExecutePaths = (activities, lastActivityId, paths = []) => {

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

        if (activity.title.includes("发起人等于任意一个李梦灵, 胡晓东, 崔竹, 郭晓龙, 刘玉鹤, 陈盈佳")) {
            console.log('----')
        }

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
            paths = formExecutePaths(activity.children, activity.id, paths)
        }
        // 具体的分支节点
        else if (activity.componentName === "ParallelNode" || activity.componentName === "ConditionNode") {
            // for (const subActivity of) {
            // 节点已经在遍历到上一级节点ConditionContainer时，统计过了
            paths = formExecutePaths(activity.children, activity.id, paths)
            // countActivity(
            //     {activityId: subActivity.id, activityName: subActivity.title},
            //     activity.id,
            //     paths
            // )
            // }
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


    // --------------------------------------------------------------------


    // const stockPath = (path, allPaths) => {
    //     const stockedPaths = allPaths.filter(item => item.name === path.name)
    //     if (stockedPaths.length === 0) {
    //         allPaths.push(path)
    //     } else {
    //         stockedPaths[0].children = path.children
    //     }
    // }
    // const findPathsWithNodeId = (nodeId, allPaths) => {
    //     return allPaths.filter(pathObj => {
    //         return pathObj.children.filter(item => item.id === nodeId).length > 0
    //     })
    // }

    // 从allPaths中获取最新的startPath
    // const namedPaths = allPaths.filter(item => item.name === startPath.name)
    // if (namedPaths.length > 0) {
    //     startPath = namedPaths[0]
    // }

    // 定义全新的对象，隔离互相见的影响
    // activities = _.cloneDeep(activities)
    // lastActivityId = _.cloneDeep(lastActivityId)
    // for (let i = 0; i < activities.length; i++) {
    //
    //
    //     const node = activities[i]
    //
    //     lastActivityId.children.push({activityId: node.id, activityName: node.title})
    //     stockPath(lastActivityId, paths)
    //
    //
    //     if (node.componentName === "ConditionContainer") {
    //         // 获取前面相关的所有的path
    //         const relatedPaths = findPathsWithNodeId(node.id)
    //         for (const relatedPath of relatedPaths) {
    //             const newStartPath = _.cloneDeep(relatedPath)
    //             for (let j = 0; j < node.children.length; j++) {
    //                 const child = node.children[j]
    //                 if (j === 0) {
    //                     formExecutePaths([child], relatedPath, paths)
    //                 } else {
    //                     newStartPath.name = uuidUtil.getId()
    //                     formExecutePaths([child], newStartPath, paths)
    //                 }
    //             }
    //         }
    //
    //         // let sameParentPaths = [startPath]
    //         // // 根据上一节点找到直接关联的所有已存在的路径
    //         // const lastNodeOperateNodeId = pathNodes[i - 1].id
    //         // sameParentPaths = sameParentPaths.concat(allPaths.filter(pathObj => {
    //         //     return pathObj.children.filter(item => item.activityId === lastNodeOperateNodeId).length > 0
    //         // }))
    //         // for (const path of sameParentPaths) {
    //         //     // lastIsConditionNode = true
    //         //     const newStartPath = _.cloneDeep(path)
    //         //     for (let j = 0; j < node.children.length; j++) {
    //         //         const child = node.children[j]
    //         //         if (j === 0) {
    //         //             console.log("---1---")
    //         //             oneToManyFormExecutePaths([child], path, allPaths)
    //         //             console.log("---1---")
    //         //         } else {
    //         //             console.log("---2---")
    //         //             newStartPath.name = uuidUtil.getId()
    //         //             oneToManyFormExecutePaths([child], newStartPath, allPaths)
    //         //             console.log("---2---")
    //         //         }
    //         //     }
    //         // }
    //     } else if (node.componentName === "ParallelNode" || node.componentName === "ConditionNode") {
    //         formExecutePaths(node.children, lastActivityId, paths)
    //     } else {
    //         // 其他类型节点，找到所有包含了其上一节点的path，将其分别汇总进去
    //         const containLastIdPaths = findPathsWithNodeId(activities[i - 1].id)
    //         for (const lastPath of containLastIdPaths) {
    //             formExecutePaths([], lastActivityId, paths)
    //         }
    //     }
    //
    //
    //     // 非分支节点，直接将节点添加到当前path(startPath)中
    //     // else {
    //     //     console.log("---3---")
    //     //     oneToManyFormExecutePaths(node.children, startPath, allPaths)
    //     //     return allPaths
    //     // }
    //
    //
    //     // 处理子节点
    //     // 多节点
    //     if (node.children && node.children.length > 0) {
    //         // 分支节点需要生成新的path
    //
    //     }
    //
    //     // 上一节点为分支节点，且还有后续非分支节点，则将其添加到全部直接前面path中
    //     if (activities[i - 1].componentName === "ConditionContainer") {
    //         // 对条件后面节点（下一个分支节点前）进行统计，需要将后面的节点统计到所有条件分支分离出的所有path中
    //         const conditionNodeId = activities[i].id
    //         const sameParentPaths = paths.filter(pathObj => {
    //             return pathObj.children.filter(item => item.activityId === conditionNodeId).length > 0
    //         })
    //
    //         // 到下一分支节点前的中间节点
    //         let nextConditionNodeIndex = activities.length
    //
    //         for (let j = i + 1; j < activities.length; j++) {
    //             if (activities[j].componentName === "ConditionContainer") {
    //                 nextConditionNodeIndex = j
    //                 break
    //             }
    //         }
    //         // const allLeftPathNodes = pathNodes.slice(i + 1)
    //
    //         for (const path of sameParentPaths) {
    //             console.log("---4---")
    //             formExecutePaths(activities.slice(i + 1, nextConditionNodeIndex), path, paths)
    //             console.log("---4---")
    //         }
    //         // return allPaths
    //     }
    // }
    // const stockedPaths = allPaths.filter(item => item.name === startPath.name)
    // if (stockedPaths.length === 0) {
    //     allPaths.push(startPath)
    // } else {
    //     stockedPaths[0].children = startPath.children
    // }

    // return paths
}

module.exports = {
    getJsonFromUnionFormattedJsonArr,
    flatMatchedJsonArr,
    formExecutePaths
}