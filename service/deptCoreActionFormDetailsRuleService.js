const deptCoreActionFormDetailsRuleRepo = require("@/repository/deptCoreActionFormDetailsRuleRepo")
const flowFormDetailsRepo = require("@/repository/flowFormDetailsRepo")

const getFormDetailsRule = async (formId, formRuleId) => {
    const formDiffVersionDetails = await flowFormDetailsRepo.getFormDifferentVersionsDetails(formId)
    const formDetailsRules = await deptCoreActionFormDetailsRuleRepo.getFormDetailsRule(formRuleId)

    const formConditions = []

    for (const formDetailsRule of formDetailsRules) {
        const currVersionDetails = formDiffVersionDetails.find(item => item.title === `表单版本${formDetailsRule.version}`)
        if (currVersionDetails) {
            const fieldItem = currVersionDetails.details.find(item => item.fieldId === formDetailsRule.fieldId)
            if (fieldItem) {
                fieldItem.opCode = formDetailsRule.opCode
                fieldItem.value = formDetailsRule.value
                fieldItem.formDetailRuleId = formDetailsRule.id
                formConditions.push(fieldItem)
            }
        }
    }

    return {formDiffVersionDetailsWithCondition: formDiffVersionDetails, formConditions}
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