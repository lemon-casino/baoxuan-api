const joiUtil = require("@/utils/joiUtil")

const updateParamsSchema = {
    id: joiUtil.commonJoiSchemas.numberRequired,
    userName: joiUtil.commonJoiSchemas.strRequired,
    groupCode: joiUtil.commonJoiSchemas.strRequired,
    groupName: joiUtil.commonJoiSchemas.strRequired,
    enabled: joiUtil.commonJoiSchemas.booleanRequired
}

module.exports = {
    updateParamsSchema
}