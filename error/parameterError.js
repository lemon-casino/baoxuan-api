const {errorCodes} = require("../const/errorConst")

class ParameterError extends Error {
    constructor(message) {
        super(message);
        this.name = "parameterError"
        this.code = errorCodes.parameterError
    }
}

module.exports = ParameterError