const joiUtil = require("../utils/joiUtil")

const saveParamsSchema = {
    deptCoreActionId: joiUtil.commonJoiSchemas.numberRequired,
    formId: joiUtil.commonJoiSchemas.strRequired,
    formName: joiUtil.commonJoiSchemas.strRequired,
    dataParams: joiUtil.commonJoiSchemas.arrayRequired,
    activityParams: joiUtil.commonJoiSchemas.arrayRequired
}

module.exports = {
    saveParamsSchema
}