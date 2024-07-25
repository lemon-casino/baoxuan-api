const models = require('@/model')
const deptCoreActionFormRuleModel = models.deptCoreActionFormRuleModel
const sequelizeUtil = require("@/utils/sequelizeUtil")

const saveFormRule = async (model, transaction) => {
    const where = {formId: model.formId, deptCoreActionId: model.deptCoreActionId}
    const savedFormRule = await _getRules(where)
    if (savedFormRule.length === 0) {
        let result = null
        if (transaction) {
            result = await deptCoreActionFormRuleModel.create(model, {transaction})
        } else {
            result = await deptCoreActionFormRuleModel.create(model)
        }
        
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

const getRulesByCoreActionIds = async (coreActionIds) => {
    return (await _getRules({deptCoreActionId: {$in: coreActionIds}}))
}

const _delRule = async (where, transaction) => {
    if (transaction) {
        return (await deptCoreActionFormRuleModel.destroy({where, transaction}))
    }
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

const deleteRuleByFormRuleIds = async (formRuleIds, transaction) => {
    const where = {id: {$in: formRuleIds}}
    return (await _delRule(where, transaction))
}

module.exports = {
    saveFormRule,
    getRulesById,
    getRulesByCoreActionIds,
    getRulesByDeptCoreActionId,
    deleteRuleById,
    deleteRuleByFormId,
    deleteRuleByFormRuleIds
}