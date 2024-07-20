const deptCoreActionFormActivityRuleRepo = require("@/repository/deptCoreActionFormActivityRuleRepo")
const formReviewRepo = require("@/repository/formReviewRepo")
const algorithmUtil = require("@/utils/algorithmUtil")
const flowConst = require("@/const/flowConst")

const getFormActivityRules = async (formId, formRuleId) => {
    const diffVersionsFormReviews = await formReviewRepo.getFormReviewByFormId(formId)
    // 将第发起节点的id替换
    for (const item of diffVersionsFormReviews) {
        item.formReview[0].id = flowConst.startActivityId
    }
    const formActivityRules = await deptCoreActionFormActivityRuleRepo.getFormActivityRules(formRuleId)
    // 将formActivityRules信息附加到formReviews
    for (const formActivityRule of formActivityRules) {
        const currVersionFormActivity = diffVersionsFormReviews.find(item => item.id === formActivityRule.version)
        const ruledActivity = algorithmUtil.getJsonFromUnionFormattedJsonArr(currVersionFormActivity.formReview, "children", "id", formActivityRule.activityId)
        if (ruledActivity) {
            ruledActivity.status = formActivityRule.status
            ruledActivity.owner = formActivityRule.owner
            ruledActivity.ruleActivityId = formActivityRule.id
        }
    }

    return {formReviews: diffVersionsFormReviews, activityConditions: formActivityRules}
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