const models = require('../model')
const deptCoreActionRuleModels = models.deptCoreActionRuleModel
const sequelizeUtil = require("../utils/sequelizeUtil")

const save = async (model) => {
    const result = await deptCoreActionRuleModels.create(model)
    return sequelizeUtil.extractDataValues(result)
}

const _getRules = async (where) => {
    const result = await deptCoreActionRuleModels.findAll({where})
    return sequelizeUtil.extractDataValues(result)
}

const getRulesByDeptCoreActionId = async (deptCoreActionId) => {
    const result = await _getRules({deptCoreActionId})
    return result
}

const getRulesById = async (id) => {
    const result = await _getRules({id})
    return result
}

const _delRule = async (where) => {
    const result = await deptCoreActionRuleModels.destroy({where})
    return result
}

const deleteRuleById = async (id) => {
    const where = {id}
    const result = await _delRule(where)
    return result
}

const deleteRuleByFormId = async (formId) => {
    const where = {formId}
    const result = await _delRule(where)
    return result
}

module.exports = {
    save,
    getRulesById,
    getRulesByDeptCoreActionId,
    deleteRuleById,
    deleteRuleByFormId
}