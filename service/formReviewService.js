const formReviewRepo = require("../repository/formReviewRepo")
const departmentFlowFormActivityRepo = require("../repository/departmentFlowFormActivityRepo")
const algorithmUtil = require("../utils/algorithmUtil")

const getFormReviewByFormId = async (formId) => {
    return formReviewRepo.getFormReviewByFormId(formId);
}

const getDeptFlowFormActivities = async (formId, deptFlowFormId) => {
    const flowFormReviews = await getFormReviewByFormId(formId)

    const deptActivities = await departmentFlowFormActivityRepo.getDeptFlowFormActivities({deptFlowFormId})
    const reviewItems = flowFormReviews[0]

    for (const deptActivity of deptActivities) {
        const reviewItem = algorithmUtil.recursionJsonArr(reviewItems, "children", "id", deptActivity.activityId)
        if (reviewItem) {
            reviewItem.selected = true
        }
    }
    return reviewItems
}

module.exports = {
    getFormReviewByFormId,
    getDeptFlowFormActivities
}
