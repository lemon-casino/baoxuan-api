const biResponse = require("../utils/biResponse")
const joiUtil = require("../utils/joiUtil")
const flowFormService = require('../service/flowFormService')
const departmentFlowFormService = require('../service/departmentFlowFormService')

const getDepartmentFlowForms = async (req, res, next) => {
    try {
        const {deptId} = req.params
        joiUtil.validate({deptId: {value: deptId, schema: joiUtil.commonJoiSchemas.required}})
        const deptFlowForms = await flowFormService.getDeptFlowForms(deptId)
        return res.send(biResponse.success(deptFlowForms))
    } catch (e) {
        next(e)
    }
}

const deleteDepartmentFlowForm = async (req, res, next) => {
    try {
        const {id} = req.params
        joiUtil.validate({id: {value: id, schema: joiUtil.commonJoiSchemas.required}})
        await departmentFlowFormService.deleteDepartmentFlowForm(id)
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

const saveDepartmentFlowForm = async (req, res, next) => {
    try {
        const {deptId, formId} = req.body
        joiUtil.validate({
            deptId: {value: deptId, schema: joiUtil.commonJoiSchemas.required},
            formId: {value: formId, schema: joiUtil.commonJoiSchemas.required}
        })
        const result = await departmentFlowFormService.saveDepartmentFlowForm(deptId, formId)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getDepartmentFlowForms,
    deleteDepartmentFlowForm,
    saveDepartmentFlowForm
}