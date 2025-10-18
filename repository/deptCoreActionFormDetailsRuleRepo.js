const models = require('@/model')
const deptCoreActionFormDetailsRuleModel = models.deptCoreActionFormDetailsRuleModel
const sequelizeUtil = require("@/utils/sequelizeUtil")

const getFormDetailsRule = async (formRuleId) => {
    return (await getFormDetailsRuleByWhere({deptCoreActionFormRuleId: formRuleId}))
}

const saveFormDetailsRule = async (model) => {
    return (await deptCoreActionFormDetailsRuleModel.create(model))
}

const bulkCreate = async (models, transaction) => {
    if (transaction)
        return (await deptCoreActionFormDetailsRuleModel.bulkCreate(models, {transaction}))
    return (await deptCoreActionFormDetailsRuleModel.bulkCreate(models))
}

const deleteFormDetailsRule = async (id) => {
    return (await deptCoreActionFormDetailsRuleModel.destroy({
        where: {id}
    }))
}

const deleteFormDetailsRuleByFormRuleIds = async (formRuleIds, transaction) => {
    if (transaction) {
        return (await deptCoreActionFormDetailsRuleModel.destroy({
            where: {deptCoreActionFormRuleId: {$in: formRuleIds}},
            transaction
        }))
    }
    return (await deptCoreActionFormDetailsRuleModel.destroy({
            where: {deptCoreActionFormRuleId: {$in: formRuleIds}},
            transaction
        })
    )
}

const updateFormDetailsRule = async (model) => {
    return (await deptCoreActionFormDetailsRuleModel.update(model, {
        where: {id: model.id}
    }))
}

const getFormDetailsRuleByFormDetailRule = async (formDetailRule) => {
    const {deptCoreActionFormRuleId, fieldId, opCode} = formDetailRule
    return (await getFormDetailsRuleByWhere({deptCoreActionFormRuleId, fieldId, opCode}))
}

const getFormDetailsRuleByFormRuleIds = async (formRuleIds) => {
    return (await getFormDetailsRuleByWhere({deptCoreActionFormRuleId: {$in: formRuleIds}}))
}

const getFormDetailsRuleByWhere = async (where) => {
    const result = await deptCoreActionFormDetailsRuleModel.findAll({
        where,
        order: [["index", "asc"]]
    })
    return sequelizeUtil.extractDataValues(result)
}

module.exports = {
    getFormDetailsRule,
    getFormDetailsRuleByFormRuleIds,
    getFormDetailsRuleByFormDetailRule,
    saveFormDetailsRule,
    bulkCreate,
    deleteFormDetailsRule,
    updateFormDetailsRule,
    deleteFormDetailsRuleByFormRuleIds
}