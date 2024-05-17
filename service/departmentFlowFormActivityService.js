const departmentFlowFormActivityRepo = require("../repository/departmentFlowFormActivityRepo")
const SQLError = require("../error/sqlError")

const getDeptFlowFormActivities = async (deptFlowFormId) => {
    const result = await departmentFlowFormActivityRepo.getDeptFlowFormActivities({deptFlowFormId})
    return result
}

const saveDepartmentFlowFormActivity = async (deptFlowFormId, activityId, activityName) => {
    const data = await departmentFlowFormActivityRepo.getDeptFlowFormActivities({deptFlowFormId, activityId})

    if (data && data.length > 0) {
        throw new SQLError(`${activityName}已经添加`)
    }

    const model = {
        deptFlowFormId, activityId, activityName
    }
    const result = await departmentFlowFormActivityRepo.saveDeptFlowFormActivity(model)
    return result
}

const deleteDeptFlowFormActivity = async (id) => {
    const result = await departmentFlowFormActivityRepo.deleteDeptFlowFormActivity(id)
    return result
}

module.exports = {
    getDeptFlowFormActivities,
    saveDepartmentFlowFormActivity,
    deleteDeptFlowFormActivity
}