const HttpError = require("./httpError")
const {errorCodes, errorMessages} = require("../../const/errorConst")

class ForbiddenError extends HttpError {
    constructor(message) {
        super(message || errorMessages.forbidden);
        this.name = "forbiddenError"
        this.code = errorCodes.forbiddenError
    }
}

module.exports = ForbiddenError