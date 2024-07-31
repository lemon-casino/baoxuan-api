const deptCoreActionFormDetailsRuleRepo = require("@/repository/deptCoreActionFormDetailsRuleRepo")
const flowFormDetailsRepo = require("@/repository/flowFormDetailsRepo")

// 支持多选的field要允许多配置
const multiSelectFieldPrefix = "multiSelectField"

const getUnSettledFormFields = async (formId, formRuleId) => {
    const formDetailsRules = await deptCoreActionFormDetailsRuleRepo.getFormDetailsRule(formRuleId)
    let uniqueUnSettledFields = []
    const tmpUniqueMap = {}
    const formDiffVersionDetails = await flowFormDetailsRepo.getFormDifferentVersionsDetails(formId)
    
    // 根据fieldId和fieldName去掉重复项
    for (const formDetails of formDiffVersionDetails) {
        for (const detail of formDetails.details) {
            
            const key = `${detail.fieldId}-${detail.fieldName}`
            if (!Object.keys(tmpUniqueMap).includes(key)) {
                
                if (key.includes(multiSelectFieldPrefix)) {
                    uniqueUnSettledFields.push(detail)
                    continue
                }
                
                const formDetailsRule = formDetailsRules.find(item => item.fieldId === detail.fieldId && item.fieldName === detail.fieldName)
                if (!formDetailsRule) {
                    uniqueUnSettledFields.push(detail)
                }
                tmpUniqueMap[key] = 1
            }
        }
    }
    
    return uniqueUnSettledFields.sort((curr, next) => curr.fieldName.localeCompare(next.fieldName))
}

const getFormDetailsRules = async (formRuleId) => {
    return (await deptCoreActionFormDetailsRuleRepo.getFormDetailsRule(formRuleId))
}

const saveFormDetailsRule = async (model) => {
    const ruledDetails = await deptCoreActionFormDetailsRuleRepo.getFormDetailsRuleByFormDetailRule(model)
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
    getUnSettledFormFields,
    getFormDetailsRules,
    saveFormDetailsRule,
    deleteFormDetailsRule,
    updateFormDetailsRule
}