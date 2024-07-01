const _ = require("lodash")
const regexConst = require("@/const/regexConst")
const ParameterError = require("@/error/parameterError")

const opCodes = {
    Equal: "Equal",
    EqualAny: "EqualAny",
    Contain: "Contain",
    Bigger: "Bigger",
    BiggerOrEqual: "BiggerOrEqual",
    Lesser: "Lesser"
}

const opFunctions = {
    Equal: (src, value) => {
        return src === value
    },
    EqualAny: (src, value) => {
        if (_.isArray(value)) {
            return value.includes(src)
        }
        return false
    },
    Contain: (src, value) => {
        if (_.isString(value)) {
            return src.includes(value)
        }
        return false
    },
    Bigger: (src, value) => {
        parameterIsNumber(src, value)
        return parseFloat(src) > parseFloat(value)
    },
    BiggerOrEqual: (src, value) => {
        parameterIsNumber(src, value)
        return parseFloat(src) >= parseFloat(value)
    },
    Lesser: (src, value) => {
        parameterIsNumber(src, value)
        return parseFloat(src) < parseFloat(value)
    }
}

const parameterIsNumber = (...values) => {
    for (const value of values) {
        if (!regexConst.numberReg.test(value)) {
            throw new ParameterError("参数必须是数字")
        }
    }
}

module.exports = {
    opCodes,
    opFunctions
}