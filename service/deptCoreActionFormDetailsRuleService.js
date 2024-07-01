const deptCoreActionFormDetailsRuleRepo = require("@/repository/deptCoreActionFormDetailsRuleRepo")
const flowFormDetailsRepo = require("@/repository/flowFormDetailsRepo")

const getFormDetailsRule = async (formId, formRuleId) => {
    const formDifferentVersionDetails = await flowFormDetailsRepo.getFormDifferentVersionsDetails(formId)
    const formDetailsRules = await deptCoreActionFormDetailsRuleRepo.getFormDetailsRule(formRuleId)
    for (const formDetailsRule of formDetailsRules) {
        const currVersionDetails = formDifferentVersionDetails.find(item => item.title === `表单版本${formDetailsRule.version}`)
        if (currVersionDetails) {
            const activity = currVersionDetails.details.find(item => item.activityId === formDetailsRule.activityId)
            if (activity) {
                activity.opCode = formDetailsRule.opCode
                activity.value = formDetailsRule.value
                activity.formDetailRuleId = formDetailsRule.id
            }
        }
    }
    return formDifferentVersionDetails
}

const saveFormDetailsRule = async (model) => {
    const ruledDetails = await deptCoreActionFormDetailsRuleRepo.getFormDetailsRuleByWhere({
        deptCoreActionFormRuleId: model.deptCoreActionFormRuleId,
        fieldId: model.fieldId
    })
    if (ruledDetails.length === 0) {
        return (await deptCoreActionFormDetailsRuleRepo.saveFormDetailsRule(model))
    }
    return ruledDetails[0]
}

const deleteFormDetailsRule = async (id) => {
    return (await deptCoreActionFormDetailsRuleRepo.deleteFormDetailsRule(id))
}

const updateFormDetailsRule = async (model) => {
    return (await deptCoreActionFormDetailsRuleRepo.updateFormDetailsRule(model))
}

module.exports = {
    getFormDetailsRule,
    saveFormDetailsRule,
    deleteFormDetailsRule,
    updateFormDetailsRule
}