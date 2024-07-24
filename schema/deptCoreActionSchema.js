const joiUtil = require("@/utils/joiUtil")

const saveParamsSchema = {
    actionName: joiUtil.commonJoiSchemas.strRequired,
    parentId: joiUtil.commonJoiSchemas.numberRequired,
    deptId: joiUtil.commonJoiSchemas.strRequired,
    deptName: joiUtil.commonJoiSchemas.strRequired
}

const updateParamsSchema = {
    id: joiUtil.commonJoiSchemas.numberRequired,
    ...saveParamsSchema
}

const copyCoreActionRules = {
    srcActionId: joiUtil.commonJoiSchemas.numberRequired,
    targetActionId: joiUtil.commonJoiSchemas.numberRequired
}

module.exports = {
    updateParamsSchema,
    saveParamsSchema,
    copyCoreActionRules
}