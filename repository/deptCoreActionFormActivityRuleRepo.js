const models = require('@/model')
const deptCoreActionFormActivityRuleModel = models.deptCoreActionFormActivityRuleModel
const sequelizeUtil = require("@/utils/sequelizeUtil")

const saveFormActivityRule = async (model) => {
    const result = await deptCoreActionFormActivityRuleModel.create(model)
    return sequelizeUtil.extractDataValues(result)
}

const deleteFormActivityRule = async (id) => {
    return (await deptCoreActionFormActivityRuleModel.destroy({where: {id}}))
}

const updateFormActivityRule = async (data) => {
    return (await deptCoreActionFormActivityRuleModel.update(data, {where: {id: data.id}}))
}

const getFormActivityRules = async (formRuleId) => {
    const result = await deptCoreActionFormActivityRuleModel.findAll({
        where: {deptCoreActionFormRuleId: formRuleId}
    })
    return sequelizeUtil.extractDataValues(result)
}

module.exports = {
    getFormActivityRules,
    updateFormActivityRule,
    saveFormActivityRule,
    deleteFormActivityRule
}