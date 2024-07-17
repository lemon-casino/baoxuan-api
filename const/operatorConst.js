const _ = require("lodash")
const regexConst = require("@/const/regexConst")
const ParameterError = require("@/error/parameterError")

const opCodes = {
    Equal: "Equal",
    NotEqual: "NotEqual",
    EqualAny: "EqualAny",
    Contain: "Contain",
    NotContain: "NotContain",
    ContainAny: "ContainAny",
    Bigger: "Bigger",
    BiggerOrEqual: "BiggerOrEqual",
    Lesser: "Lesser"
}

const convertArrayToStrWithDot = (val) => {
    if (_.isArray(val)) {
        val = val.join(",")
    }
    return val
}

const opFunctions = {
    Equal: (src, value) => {
        src = convertArrayToStrWithDot(src)
        return src === value
    },
    NotEqual: (src, value) => {
        src = convertArrayToStrWithDot(src)
        return src !== value
    },
    EqualAny: (src, value) => {
        src = convertArrayToStrWithDot(src)

        if (_.isArray(value)) {
            return value.includes(src)
        }
        return false
    },
    Contain: (src, value) => {
        src = convertArrayToStrWithDot(src)
        if (_.isString(value)) {
            return src.includes(value)
        }
        return false
    },
    NotContain: (src, value) => {
        src = convertArrayToStrWithDot(src)

        if (_.isString(value)) {
            return !src.includes(value)
        }
        return false
    },
    ContainAny: (src, value) => {
        src = convertArrayToStrWithDot(src)

        if (_.isArray(value)) {
            for (const val of value) {
                if (src.includes(val)) {
                    return true
                }
            }
            return false
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