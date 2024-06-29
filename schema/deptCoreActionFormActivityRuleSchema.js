const joiUtil = require("../utils/joiUtil")

const saveParamsSchema = {
    deptCoreActionFormRuleId: joiUtil.commonJoiSchemas.numberRequired,
    activityId: joiUtil.commonJoiSchemas.strRequired,
    status: joiUtil.commonJoiSchemas.strRequired,
    owner: joiUtil.commonJoiSchemas.objectRequire,
    version: joiUtil.commonJoiSchemas.numberRequired
}

const updateParamsSchema = {
    id: joiUtil.commonJoiSchemas.numberRequired,
    ...saveParamsSchema
}

module.exports = {
    saveParamsSchema,
    updateParamsSchema
}