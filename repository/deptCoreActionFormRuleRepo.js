const models = require('@/model')
const deptCoreActionFormRuleModel = models.deptCoreActionFormRuleModel
const sequelizeUtil = require("@/utils/sequelizeUtil")

const saveFormRule = async (model) => {
    const where = {formId: model.formId, deptCoreActionId: model.deptCoreActionId}
    const savedFormRule = await _getRules(where)
    if (savedFormRule.length === 0) {
        const result = await deptCoreActionFormRuleModel.create(model)
        return sequelizeUtil.extractDataValues(result)
    }
    return savedFormRule[0]
}

const _getRules = async (where) => {
    const result = await deptCoreActionFormRuleModel.findAll({where})
    return sequelizeUtil.extractDataValues(result)
}

const getRulesByDeptCoreActionId = async (deptCoreActionId) => {
    return (await _getRules({deptCoreActionId}))
}

const getRulesById = async (id) => {
    return (await _getRules({id}))
}

const _delRule = async (where) => {
    return (await deptCoreActionFormRuleModel.destroy({where}))
}

const deleteRuleById = async (id) => {
    const where = {id}
    return (await _delRule(where))
}

const deleteRuleByFormId = async (formId) => {
    const where = {formId}
    return (await _delRule(where))
}

module.exports = {
    saveFormRule,
    getRulesById,
    getRulesByDeptCoreActionId,
    deleteRuleById,
    deleteRuleByFormId
}