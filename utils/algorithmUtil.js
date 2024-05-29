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


const formExecutePaths = (pathNodes, startPath, allPaths) => {
    pathNodes = _.cloneDeep(pathNodes)
    startPath = _.cloneDeep(startPath)
    let lastIsConditionNode = false
    for (let i = 0; i < pathNodes.length; i++) {
        const node = pathNodes[i]
        startPath.children.push({activityId: node.id, activityName: node.title})
        if (node.children && node.children.length > 0) {
            if (node.componentName === "ConditionContainer") {
                lastIsConditionNode = true
                const newStartPath = _.cloneDeep(startPath)
                for (let j = 0; j < node.children.length; j++) {
                    const child = node.children[j]
                    if (j === 0) {
                        console.log("---1---")
                        formExecutePaths([child], startPath, allPaths)
                        console.log("---1---")
                    } else {
                        console.log("---2---")
                        newStartPath.name = uuidUtil.getId()
                        formExecutePaths([child], newStartPath, allPaths)
                        console.log("---2---")
                    }
                }
            } else {
                console.log("---3---")
                formExecutePaths(node.children, startPath, allPaths)
                return allPaths
            }
        }
        if (lastIsConditionNode && i < pathNodes.length - 1) {
            // 对条件后面节点（下一个分支节点前）进行统计，需要将后面的节点统计到所有条件分支分离出的所有path中
            const conditionNodeId = pathNodes[i].id
            const sameParentPaths = allPaths.filter(pathObj => {
                return pathObj.children.filter(item => item.activityId === conditionNodeId).length > 0
            })

            // 到下一分支节点前的中间节点
            let nextConditionNodeIndex = pathNodes.length

            for (let j = i + 1; j < pathNodes.length; j++) {
                if (pathNodes[j].componentName === "ConditionContainer") {
                    nextConditionNodeIndex = j
                    break
                }
            }
            // const allLeftPathNodes = pathNodes.slice(i + 1)

            for (const path of sameParentPaths) {
                console.log("---4---")
                formExecutePaths(pathNodes.slice(i + 1, nextConditionNodeIndex), path, allPaths)
                console.log("---4---")
            }
            return allPaths
        }
        lastIsConditionNode = false
    }
    const stockedPaths = allPaths.filter(item => item.name === startPath.name)
    if (stockedPaths.length === 0) {
        allPaths.push(startPath)
    } else {
        stockedPaths[0].children = startPath.children
    }

    return allPaths
}

module.exports = {
    getJsonFromUnionFormattedJsonArr,
    flatMatchedJsonArr,
    formExecutePaths
}