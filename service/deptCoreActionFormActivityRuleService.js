const deptCoreActionFormActivityRuleRepo = require("@/repository/deptCoreActionFormActivityRuleRepo")
const formReviewRepo = require("@/repository/formReviewRepo")
const algorithmUtil = require("@/utils/algorithmUtil")

const getFormActivityRules = async (formId, formRuleId) => {
    const formReviews = await formReviewRepo.getFormReviewByFormId(formId)
    const formActivityRules = await deptCoreActionFormActivityRuleRepo.getFormActivityRules(formRuleId)
    const activityConditions = []
    // 将formActivityRules信息附加到formReviews
    for (const formActivityRule of formActivityRules) {
        const currVersionFormActivity = formReviews.find(item => item.id === formActivityRule.version)
        const ruledActivity = algorithmUtil.getJsonFromUnionFormattedJsonArr(currVersionFormActivity.formReview, "children", "id", formActivityRule.activityId)
        if (ruledActivity) {
            ruledActivity.status = formActivityRule.status
            ruledActivity.owner = formActivityRule.owner
            ruledActivity.ruleActivityId = formActivityRule.id
            activityConditions.push(ruledActivity)
        }
    }

    return {formReviews, activityConditions}
}

const saveFormActivityRule = async (data) => {
    return (await deptCoreActionFormActivityRuleRepo.saveFormActivityRule(data))
}

const deleteFormActivityRule = async (id) => {
    return (await deptCoreActionFormActivityRuleRepo.deleteFormActivityRule(id))
}

const updateFormActivityRule = async (data) => {
    return (await deptCoreActionFormActivityRuleRepo.updateFormActivityRule(data))
}

module.exports = {
    getFormActivityRules,
    updateFormActivityRule,
    saveFormActivityRule,
    deleteFormActivityRule
}