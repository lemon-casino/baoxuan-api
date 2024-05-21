const departmentFlowFormRepo = require("../repository/departmentFlowFormRepo")
const departmentRepo = require("../repository/departmentRepo")
const flowFormRepo = require("../repository/flowFormRepo")
const NotFoundError = require("../error/http/notFoundError")
const SqlError = require("../error/sqlError")

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

    const result = []
    for (const deptForm of deptForms) {
        const tmpResult = {
            formName: deptForm.formName,
            formId: deptForm.formId,
            actions: []
        }
        const deptFlowFormActivities = deptForm.deptFlowFormActivities
        // 名称相同的节点需要合并
        const actionNames = {}
        for (const activity of deptFlowFormActivities) {
            let tmpActivity = null
            if (Object.keys(actionNames).includes(activity.activityName)) {
                const action = tmpResult.actions.filter(action => action.name === activity.activityName)
                action[0].nodeIds.push(activity.activityId)
            } else {
                tmpActivity = {name: activity.activityName, nodeIds: [activity.activityId]}
                tmpResult.actions.push(tmpActivity)
            }
            actionNames[activity.activityName] = 1
        }
        result.push(tmpResult)
    }
    return result
}

module.exports = {
    saveDepartmentFlowForm,
    deleteDepartmentFlowForm,
    getDepartmentFlowForms,
    getDeptFlowFormConfig
}