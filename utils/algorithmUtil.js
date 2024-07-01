const _ = require("lodash")
const joiUtil = require("@/utils/joiUtil")

/**
 * 从不限深度且具有相同结构的json数组中，找到需要的键值匹配的数据项
 *
 * @param jsonArr
 * @param childKey
 * @param requiredKey
 * @param requiredValue
 * @returns {*|null}
 */
const getJsonFromUnionFormattedJsonArr = (jsonArr, childKey, requiredKey, requiredValue) => {
    joiUtil.validate({
        jsonArr: {value: jsonArr, schema: joiUtil.commonJoiSchemas.arrayRequired},
        childKey: {value: childKey, schema: joiUtil.commonJoiSchemas.strRequired},
        key: {value: requiredKey, schema: joiUtil.commonJoiSchemas.strRequired},
        value: {value: requiredValue, schema: joiUtil.commonJoiSchemas.required}
    })

    let result = null
    for (const item of jsonArr) {
        if (item[requiredKey].toString() === requiredValue.toString()) {
            return item
        }
        if (item[childKey] && item[childKey].length > 0) {
            result = getJsonFromUnionFormattedJsonArr(item[childKey], childKey, requiredKey, requiredValue)
            if (result) {
                return result
            }
        }
    }
    return result
}

/**
 * 扁平化匹配的节点数据
 *
 * @param jsonArr
 * @param matchedFunc
 * @returns {*[]}
 */
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
 * 去掉json数组中的重复项
 *
 * @param jsonArr
 * @param key
 */
const removeJsonArrDuplicateItems = (jsonArr, key) => {
    joiUtil.validate({
        jsonArr: {value: jsonArr, schema: joiUtil.commonJoiSchemas.arrayRequired},
        matchedFunc: {value: key, schema: joiUtil.commonJoiSchemas.strRequired}
    })
    const uniqueKeys = {}
    const uniqueArrJson = []
    for (const jsonObj of jsonArr) {
        if (!Object.keys(uniqueKeys).includes(jsonObj[key])) {
            uniqueArrJson.push(jsonObj)
            uniqueKeys[jsonObj[key]] = 1
        }
    }
    return uniqueArrJson
}

module.exports = {
    getJsonFromUnionFormattedJsonArr,
    flatMatchedJsonArr,
    removeJsonArrDuplicateItems
}