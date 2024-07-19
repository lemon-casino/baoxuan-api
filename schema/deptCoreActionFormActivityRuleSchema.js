const joiUtil = require("@/utils/joiUtil")
const Joi = require("joi");

const saveParamsSchema = {
    deptCoreActionFormRuleId: joiUtil.commonJoiSchemas.numberRequired,
    activityId: joiUtil.commonJoiSchemas.strRequired,
    status: joiUtil.commonJoiSchemas.strRequired,
    owner: Joi.object({
        from: joiUtil.commonJoiSchemas.strRequired,
        id: joiUtil.commonJoiSchemas.strRequired
    }).required(),
    version: joiUtil.commonJoiSchemas.numberRequired
}

const updateParamsSchema = {
    id: joiUtil.commonJoiSchemas.numberRequired, ...saveParamsSchema
}

module.exports = {
    saveParamsSchema, updateParamsSchema
}