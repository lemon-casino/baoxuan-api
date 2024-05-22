const departmentFlowFormRepo = require("../repository/departmentFlowFormRepo")
const departmentRepo = require("../repository/departmentRepo")
const flowFormRepo = require("../repository/flowFormRepo")
const NotFoundError = require("../error/http/notFoundError")
const SqlError = require("../error/sqlError")
const deptFlowFormConfigConvertor = require("../convertor/deptFlowFormConvertor")

const saveDepartmentFlowForm = async (deptId, formId) => {

    const department = await departmentRepo.getDepartmentDetails(deptId)

    const formDetails = await flowFormRepo.getFormDetails(formId)
    if (!formDetails) {
        throw new NotFoundError(`未在库中找到表单：${formId}的信息`)
    }
    const data = await departmentFlowFormRepo.getDepartmentFlowForms({deptId, formId})
    if (data && data.length > 0) {
        throw new SqlError(`${department.name}下已经添加了${formDetails.flowFormName}`)
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
    const result = await departmentFlowFormRepo.getDepartmentFlowForms({deptId})
    return result
}

const getDeptFlowFormConfig = async (deptId) => {
    const deptForms = await departmentFlowFormRepo.getDeptFlowFormConfig(deptId)
    if (deptForms.length === 0) {
        throw new NotFoundError(`未找到部门：${deptId}的统计流程节点的配置信息`)
    }
    return deptFlowFormConfigConvertor.convert(deptForms)
}

module.exports = {
    saveDepartmentFlowForm,
    deleteDepartmentFlowForm,
    getDepartmentFlowForms,
    getDeptFlowFormConfig
}