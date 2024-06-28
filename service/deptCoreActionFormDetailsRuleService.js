const deptCoreActionFormDetailsRuleRepo = require("../repository/deptCoreActionFormDetailsRuleRepo");

const getFormDetailsRule = async (formRuleId) => {
    return (await deptCoreActionFormDetailsRuleRepo.getFormDetailsRule(formRuleId))
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