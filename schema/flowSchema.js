const joiUtil = require("@/utils/joiUtil")
const Joi = require("joi")
const coreActionStatTypeConst = require("@/const/coreActionStatTypeConst")

const getCoreActionsSchema = {
    statType: Joi.string().valid(coreActionStatTypeConst.StatAction, coreActionStatTypeConst.StatUser),
    tags: joiUtil.commonJoiSchemas.arrayRequired,
    deptIds: joiUtil.commonJoiSchemas.arrayRequired,
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

const getFlowsProcessSchema = {
    id: joiUtil.commonJoiSchemas.strRequired,
    pageSize: joiUtil.commonJoiSchemas.positiveIntegerRequired,
    currentPage: joiUtil.commonJoiSchemas.positiveIntegerRequired
}

const requiredDeptIdsSchema = {
    deptIds: joiUtil.commonJoiSchemas.arrayRequired
}

const requiredIdSchema = {
    id: joiUtil.commonJoiSchemas.strRequired
}

module.exports = {
    getCoreActionsSchema,
    updateRunningFlowEmergencySchema,
    requiredIdsSchema,
    requiredIdSchema,
    getFlowsProcessSchema,
    requiredDeptIdsSchema
}