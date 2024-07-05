const joiUtil = require("@/utils/joiUtil");

const getCoreActionsSchema = {
    tags: joiUtil.commonJoiSchemas.arrayRequired,
    deptId: joiUtil.commonJoiSchemas.strRequired,
    startDate: joiUtil.commonJoiSchemas.dateRequired,
    endDate: joiUtil.commonJoiSchemas.dateRequired,
    userNames: joiUtil.commonJoiSchemas.arrayRequired
}

const updateRunningFlowEmergencySchema = {
    emergency: joiUtil.commonJoiSchemas.strRequired,
    ids: joiUtil.commonJoiSchemas.arrayRequired
}

const requiredIdsSchema = {
    ids: joiUtil.commonJoiSchemas.arrayRequired
}

module.exports = {
    getCoreActionsSchema,
    updateRunningFlowEmergencySchema,
    requiredIdsSchema
}