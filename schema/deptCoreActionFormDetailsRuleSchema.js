const joiUtil = require("@/utils/joiUtil")

const saveParamsSchema = {
    deptCoreActionFormRuleId: joiUtil.commonJoiSchemas.numberRequired,
    fieldId: joiUtil.commonJoiSchemas.strRequired,
    opCode: joiUtil.commonJoiSchemas.strRequired,
    value: joiUtil.commonJoiSchemas.strRequired,
    condition: joiUtil.commonJoiSchemas.strRequired,
    // conditionCode: joiUtil.commonJoiSchemas.strRequired,
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