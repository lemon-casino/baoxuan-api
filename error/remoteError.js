const HttpError = require("./http/httpError")
const {errorCodes} = require("../const/errorConst")

class RemoteError extends HttpError {
    constructor(message, stack) {
        super(message)
        this.name = "remoteError"
        this.code = errorCodes.remoteError
        this.stack = stack
    }
}

module.exports = RemoteError