const models = require('../model')
const deptCoreActionFormActivityRuleModel = models.deptCoreActionFormActivityRuleModel
const sequelizeUtil = require("../utils/sequelizeUtil")

const saveFormActivityRule = async (model) => {
    const result = await deptCoreActionFormActivityRuleModel.create(model)
    return sequelizeUtil.extractDataValues(result)
}

const deleteFormActivityRule = async (id) => {
    return (await deptCoreActionFormActivityRuleModel.destroy({where: {id}}))
}

const updateFormActivityRule = async (model) => {
    return (await deptCoreActionFormActivityRuleModel.update(model, {where: {id: model.id}}))
}

module.exports = {
    updateFormActivityRule,
    saveFormActivityRule,
    deleteFormActivityRule
}