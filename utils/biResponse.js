const {errorMessages, errorCodes} = require("@/const/errorConst")
const {successCodes, successMessages} = require("@/const/successConst")

const format = (code, message, data) => {
    return {code, message, data}
}

const success = (data) => {
    return format(successCodes.success, successMessages.common, data)
}

const simpleSuccess = (message = successMessages.common) => {
    return format(successCodes.success, message)
}

const serverError = (message = errorMessages.common) => {
    return format(errorCodes.commonError, message)
}

module.exports = {
    format,
    simpleSuccess,
    success,
    serverError
}