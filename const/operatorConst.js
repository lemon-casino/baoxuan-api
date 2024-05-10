const opCodes = {
    "Equal": "Equal",
    "EqualAny": "EqualAny",
    "Contain": "Contain",
    "Bigger": "Bigger",
    "BiggerOrEqual": "BiggerOrEqual",
    "Lesser": "Lesser"
}

const opFunctions = {
    "Equal": (src, value) => {
        return src === value
    },
    "EqualAny": (src, value) => {
        if (value instanceof Array) {
            return value.includes(src)
        }
        return false
    },
    "Contain": (src, value) => {
        if (value instanceof String) {
            return src.includes(value)
        }
        return false
    }
}


module.exports = {
    opCodes,
    opFunctions
}