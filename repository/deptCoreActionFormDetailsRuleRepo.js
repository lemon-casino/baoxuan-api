const models = require('../model')
const deptCoreActionFormDetailsRuleModel = models.deptCoreActionFormDetailsRuleModel
const sequelizeUtil = require("../utils/sequelizeUtil")

const getFormDetailsRule = async (formId) => {
    const result = await deptCoreActionFormDetailsRuleModel.findAll({
        where: {formId}
    })
    return sequelizeUtil.extractDataValues(result)
}

const saveFormDetailsRule = async (model) => {
    return (await deptCoreActionFormDetailsRuleModel.create(model))
}

const deleteFormDetailsRule = async (id) => {
    return (await deptCoreActionFormDetailsRuleModel.destroy({
        where: {id}
    }))
}

const updateFormDetailsRule = async (model) => {
    return (await deptCoreActionFormDetailsRuleModel.update(model, {
        where: {id: model.id}
    }))
}

module.exports = {
    getFormDetailsRule,
    saveFormDetailsRule,
    deleteFormDetailsRule,
    updateFormDetailsRule
}