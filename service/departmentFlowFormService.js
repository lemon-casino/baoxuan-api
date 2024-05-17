const departmentFlowFormRepo = require("../repository/departmentFlowFormRepo")
const departmentRepo = require("../repository/departmentRepo")
const flowFormRepo = require("../repository/flowFormRepo")
const NotFoundError = require("../error/http/notFoundError")

const saveDepartmentFlowForm = async (deptId, formId) => {
    const department = await departmentRepo.getDepartmentDetails(deptId)

    const formDetails = await flowFormRepo.getFormDetails(formId)
    if (!formDetails) {
        throw new NotFoundError(`未在库中找到表单：${formId}的信息`)
    }

    const model = {
        deptId,
        deptName: department.name,
        formId,
        formName: formDetails.flowFormName
    }
    const result = await departmentFlowFormRepo.saveDepartmentFlowForm(model)
    return result
}

const deleteDepartmentFlowForm = async (id) => {
    const result = await departmentFlowFormRepo.deleteDepartmentFlowForm(id)
    return result
}

const getDepartmentFlowForms = async (deptId) => {
    const result = await departmentFlowFormRepo.getDepartmentFlowForms(deptId)
    return result
}

const getDepartmentFlowFormsWithActivities = async (deptId) => {
    const result = await departmentFlowFormRepo.getDepartmentFlowFormsWithActivities(deptId)
    return result
}

module.exports = {
    saveDepartmentFlowForm,
    deleteDepartmentFlowForm,
    getDepartmentFlowForms,
    getDepartmentFlowFormsWithActivities
}