const {errorCodes} = require("@/const/errorConst")

class HttpError extends Error {
    constructor(message) {
        super(message);
        this.name = "httpError"
        this.code = errorCodes.commonError
    }
}

module.exports =  HttpError