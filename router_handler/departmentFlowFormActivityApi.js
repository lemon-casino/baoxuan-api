const biResponse = require("../utils/biResponse")
const joiUtil = require("../utils/joiUtil")
const departmentFlowFormActivityService = require('../service/departmentFlowFormActivityService')

const getDeptFlowFormActivities = async (req, res, next) => {
    try {
        const {formId, deptFlowFormId} = req.query
        joiUtil.validate({
            formId: {value: formId, schema: joiUtil.commonJoiSchemas.required},
            deptFlowFormId: {value: deptFlowFormId, schema: joiUtil.commonJoiSchemas.required}
        })
        const data = await departmentFlowFormActivityService.getDeptFlowFormActivities(formId,deptFlowFormId)
        return res.send(biResponse.success(data))
    } catch (e) {
        next(e)
    }
}

const deleteDeptFlowFormActivity = async (req, res, next) => {
    try {
        const {id} = req.query
        joiUtil.validate({id: {value: id, schema: joiUtil.commonJoiSchemas.required}})
        await departmentFlowFormActivityService.deleteDeptFlowFormActivity(id)
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

const saveDepartmentFlowFormActivity = async (req, res, next) => {
    try {
        const {deptFlowFormId, activityId, activityName} = req.body
        joiUtil.validate({
            deptFlowFormId: {value: deptFlowFormId, schema: joiUtil.commonJoiSchemas.required},
            activityId: {value: activityId, schema: joiUtil.commonJoiSchemas.required},
            activityName: {value: activityName, schema: joiUtil.commonJoiSchemas.required}
        })
        const result = await departmentFlowFormActivityService.saveDepartmentFlowFormActivity(deptFlowFormId, activityId, activityName)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getDeptFlowFormActivities,
    saveDepartmentFlowFormActivity,
    deleteDeptFlowFormActivity
}