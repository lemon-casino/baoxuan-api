const joiUtil = require("@/utils/joiUtil")

const getPagingUsersSchema = {
    deptIds: joiUtil.commonJoiSchemas.arrayRequired,
    page: joiUtil.commonJoiSchemas.positiveIntegerRequired,
    pageSize: joiUtil.commonJoiSchemas.positiveIntegerRequired
}

const undoResignSchema = {
    userId: joiUtil.commonJoiSchemas.strRequired
}

module.exports = {
    getPagingUsersSchema,
    undoResignSchema
}