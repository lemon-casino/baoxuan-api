const deptCoreActionFormDetailsRuleRepo = require("@/repository/deptCoreActionFormDetailsRuleRepo")
const flowFormDetailsRepo = require("@/repository/flowFormDetailsRepo")

const getFormDetailsRule = async (formId, formRuleId) => {
    
    const formDetailsRules = await deptCoreActionFormDetailsRuleRepo.getFormDetailsRule(formRuleId)
    
    let uniqueFields = []
    const tmpUniqueMap = {}
    const formDiffVersionDetails = await flowFormDetailsRepo.getFormDifferentVersionsDetails(formId)
    // 根据fieldId和fieldName去掉重复项
    for (const formDetails of formDiffVersionDetails) {
        for (const detail of formDetails.details) {
            const key = `${detail.fieldId}-${detail.fieldName}`
            if (!Object.keys(tmpUniqueMap).includes(key)) {
                const formDetailsRule = formDetailsRules.find(item => item.fieldId === detail.fieldId && item.fieldName === detail.fieldName)
                if (formDetailsRule) {
                    detail.opCode = formDetailsRule.opCode
                    detail.value = formDetailsRule.value
                    detail.formDetailRuleId = formDetailsRule.id
                    detail.condition = formDetailsRule.condition
                    detail.conditionCode = formDetailsRule.conditionCode
                }
                uniqueFields.push(detail)
                tmpUniqueMap[key] = 1
            }
        }
    }
    uniqueFields = uniqueFields.sort((curr, next) => curr.fieldName.localeCompare(next.fieldName))
    
    return {fields: uniqueFields, formConditions: formDetailsRules}
}

const saveFormDetailsRule = async (model) => {
    const ruledDetails = await deptCoreActionFormDetailsRuleRepo.getFormDetailsRuleByFormRuleIdAndFieldId(
        model.deptCoreActionFormRuleId,
        model.fieldId
    )
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