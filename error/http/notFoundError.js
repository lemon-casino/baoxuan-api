const HttpError = require("./httpError")
const {errorCodes, errorMessages} = require("@/const/errorConst")

class NotFoundError extends HttpError {
    constructor(message) {
        super(message || errorMessages.notFound);
        this.name = "notFoundError"
        this.code = errorCodes.notFound
    }
}

module.exports = NotFoundError