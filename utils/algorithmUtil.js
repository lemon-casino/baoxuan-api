const joiUtil = require("../utils/joiUtil")

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
        if (item.children && item.length > 0) {
            matchedNodes = matchedNodes.concat(flatMatchedJsonArr(item.children, matchedFunc))
        }
        if (matchedFunc(item)) {
            matchedNodes.push(item)
        }
    }
    return matchedNodes
}

module.exports = {
    getJsonFromUnionFormattedJsonArr,
    flatMatchedJsonArr
}