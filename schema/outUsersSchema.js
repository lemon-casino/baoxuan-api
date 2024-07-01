const joiUtil = require("../utils/joiUtil")

const updateParamsSchema = {
    userName: joiUtil.commonJoiSchemas.strRequired,
    groupCode: joiUtil.commonJoiSchemas.strRequired,
    groupName: joiUtil.commonJoiSchemas.strRequired
}

module.exports = {
    updateParamsSchema
}