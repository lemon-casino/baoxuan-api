const joiUtil = require("@/utils/joiUtil")
const Joi = require("joi")
const coreActionStatTypeConst = require("../const/coreActionStatTypeConst")
const { statItem3 } = require('../const/newFormConst')

const getCoreActionsSchema = {
    statType: Joi.string().valid(
        coreActionStatTypeConst.StatAction, 
        coreActionStatTypeConst.StatUser,
        coreActionStatTypeConst.StatLeader,
        coreActionStatTypeConst.StatDesigner,
        coreActionStatTypeConst.StatMainDesigner,
        coreActionStatTypeConst.StatPhotographer,
    ),
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
    id: joiUtil.commonJoiSchemas.numberRequired,
    pageSize: joiUtil.commonJoiSchemas.numberCheck,
    currentPage: joiUtil.commonJoiSchemas.numberCheck
}

const getFlowsActionsSchema = {
    id: joiUtil.commonJoiSchemas.numberRequired,
}

const getCoreDetailsSchema = {
    statType: Joi.string().valid(
        coreActionStatTypeConst.StatDesigner,
        coreActionStatTypeConst.StatMainDesigner,
        coreActionStatTypeConst.StatPhotographer,
        coreActionStatTypeConst.StatLeader,
    ),
    action: Joi.string().valid(
        ...statItem3.map((item) => item.code),
    ),
    startDate: joiUtil.commonJoiSchemas.dateRequired,
    endDate: joiUtil.commonJoiSchemas.dateRequired,
    users: joiUtil.commonJoiSchemas.strRequired
}

module.exports = {
    getCoreActionsSchema,
    getCoreDetailsSchema,
    updateRunningFlowEmergencySchema,
    requiredIdsSchema,
    getFlowsProcessSchema,
    getFlowsActionsSchema
}