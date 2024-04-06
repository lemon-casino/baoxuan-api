class SQLError extends Error {
    constructor(message, sql) {
        super(message);
        this.name = "sqlError"
        this.code = 500
        this.statusCode = 502
        this.status = 501
        this.sql = sql
    }
}

module.exports = SQLError