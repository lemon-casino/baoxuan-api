const departmentFlowFormActivityRepo = require("../repository/departmentFlowFormActivityRepo")

const getDeptFlowFormActivities = async (deptFlowFormId) => {
    const result = await departmentFlowFormActivityRepo.getDeptFlowFormActivities(deptFlowFormId)
    return result
}

const saveDepartmentFlowFormActivity = async (deptFlowFormId, activityId, activityName) => {
    const data = {
        deptFlowFormId, activityId, activityName
    }
    const result = await departmentFlowFormActivityRepo.saveDeptFlowFormActivity(data)
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