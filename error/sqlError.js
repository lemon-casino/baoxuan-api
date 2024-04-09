const {errorCodes} = require("../const/errorConst")

class SQLError extends Error {
    constructor(message, sql) {
        super(message);
        this.name = "sqlError"
        this.code = errorCodes.sqlError
        this.sql = sql
    }
}

module.exports = SQLError