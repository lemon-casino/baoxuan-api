const deptCoreActionRuleConfigRepo = require("../repository/deptCoreActionFormRuleRepo")
const sequelizeUtil = require("../utils/sequelizeUtil");

const save = async (model) => {
    const result = await deptCoreActionRuleConfigRepo.save(model)
    return sequelizeUtil.extractDataValues(result)
}

const getRulesByDeptCoreActionId = async (deptCoreActionId) => {
    const result = await deptCoreActionRuleConfigRepo.getRulesByDeptCoreActionId({deptCoreActionId})
    return result
}

const getRulesById = async (id) => {
    const result = await deptCoreActionRuleConfigRepo.getRulesById(id)
    return result
}

const deleteRuleById = async (id) => {
    const result = await deptCoreActionRuleConfigRepo.deleteRuleById(id)
    return result
}

const deleteRuleByFormId = async (formId) => {
    const result = await deptCoreActionRuleConfigRepo.deleteRuleByFormId(formId)
    return result
}

module.exports = {
    save,
    getRulesById,
    getRulesByDeptCoreActionId,
    deleteRuleById,
    deleteRuleByFormId
}