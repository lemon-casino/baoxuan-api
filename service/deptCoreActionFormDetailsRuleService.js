const deptCoreActionFormDetailsRuleRepo = require("../repository/deptCoreActionFormDetailsRuleRepo");

const getFormDetailsRule = async (formId) => {
    return (await deptCoreActionFormDetailsRuleRepo.getFormDetailsRule({
            where: {formId}
        })
    )
}

const saveFormDetailsRule = async (model) => {
    return (await deptCoreActionFormDetailsRuleRepo.saveFormDetailsRule(model))
}

const deleteFormDetailsRule = async (id) => {
    return (await deptCoreActionFormDetailsRuleRepo.destroy({
        where: {id}
    }))
}

const updateFormDetailsRule = async (model) => {
    return (await deptCoreActionFormDetailsRuleRepo.update(model, {
        where: {id: model.id}
    }))
}

module.exports = {
    getFormDetailsRule,
    saveFormDetailsRule,
    deleteFormDetailsRule,
    updateFormDetailsRule
}