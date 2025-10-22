const {errorCodes} = require("@/const/errorConst")

class UserError extends Error {
    constructor(message) {
        super(message);
        this.name = "userError"
        this.code = errorCodes.userError
    }
}

module.exports = UserError