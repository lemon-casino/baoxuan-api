const deptCoreActionRuleConfigRepo = require("@/repository/deptCoreActionFormRuleRepo")
const sequelizeUtil = require("@/utils/sequelizeUtil")
const ForbiddenError = require("@/error/http/forbiddenError")

const saveFormRule = async (model) => {
    const {formId, deptCoreActionId} = model
    const tmpRules = await deptCoreActionRuleConfigRepo.getRuleByActionIdAndFormId(deptCoreActionId, formId)
    if (tmpRules.length > 0) {
        throw new ForbiddenError("当前动作不能重复添加该表单规则！")
    }
    const result = await deptCoreActionRuleConfigRepo.saveFormRule(model)
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
    saveFormRule,
    getRulesById,
    getRulesByDeptCoreActionId,
    deleteRuleById,
    deleteRuleByFormId
}