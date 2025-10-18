const biResponse = require("@/utils/biResponse")
const joiUtil = require("@/utils/joiUtil")
const flowFormService = require('@/service/flowFormService')
const departmentFlowFormService = require('@/service/departmentFlowFormService')

const getDepartmentFlowForms = async (req, res, next) => {
    try {
        const {deptId, type} = req.query
        joiUtil.validate({
            deptId: {value: deptId, schema: joiUtil.commonJoiSchemas.strRequired},
            type: {value: type, schema: joiUtil.commonJoiSchemas.numberRequired}
        })
        const deptFlowForms = await flowFormService.getDeptFlowForms(deptId, type)
        return res.send(biResponse.success(deptFlowForms))
    } catch (e) {
        next(e)
    }
}

const deleteDepartmentFlowForm = async (req, res, next) => {
    try {
        const {id} = req.query
        joiUtil.validate({id: {value: id, schema: joiUtil.commonJoiSchemas.numberRequired}})
        await departmentFlowFormService.deleteDepartmentFlowForm(id)
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

const saveDepartmentFlowForm = async (req, res, next) => {
    try {
        const {deptId, formId, type, isCore} = req.body
        joiUtil.validate({
            deptId: {value: deptId, schema: joiUtil.commonJoiSchemas.strRequired},
            formId: {value: formId, schema: joiUtil.commonJoiSchemas.strRequired},
            type: {value: type, schema: joiUtil.commonJoiSchemas.numberRequired}
        })
        const result = await departmentFlowFormService.saveDepartmentFlowForm(deptId, formId, type, isCore)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getDepartmentFlowForms, deleteDepartmentFlowForm, saveDepartmentFlowForm
}