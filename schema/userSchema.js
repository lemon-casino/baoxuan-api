const joiUtil = require("@/utils/joiUtil")

const getPagingUsersSchema = {
    deptIds: joiUtil.commonJoiSchemas.arrayRequired,
    page: joiUtil.commonJoiSchemas.positiveIntegerRequired,
    pageSize: joiUtil.commonJoiSchemas.positiveIntegerRequired
}

module.exports = {
    getPagingUsersSchema
}