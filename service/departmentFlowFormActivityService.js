const departmentFlowFormActivityRepo = require("../repository/departmentFlowFormActivityRepo")
const formReviewRepo = require("../repository/formReviewRepo")
const SQLError = require("../error/sqlError")
const algorithmUtil = require("../utils/algorithmUtil")

const getDeptFlowFormActivities = async (formId, deptFlowFormId) => {
    const flowFormReviews = await formReviewRepo.getFormReviewByFormId(formId);
    const reviewItems = flowFormReviews[0].formReview

    const deptActivities = await departmentFlowFormActivityRepo.getDeptFlowFormActivities({deptFlowFormId})

    for (const deptActivity of deptActivities) {
        const reviewItem = algorithmUtil.getJsonFromUnionFormattedJsonArr(reviewItems, "children", "id", deptActivity.activityId)
        if (reviewItem) {
            reviewItem.deptFlowFormActivityId = deptActivity.id
            reviewItem.selected = true
        }
    }
    return reviewItems
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