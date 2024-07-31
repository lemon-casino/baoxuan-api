const models = require('@/model')
const deptCoreActionFormActivityRuleModel = models.deptCoreActionFormActivityRuleModel
const sequelizeUtil = require("@/utils/sequelizeUtil")

const saveFormActivityRule = async (model) => {
    const result = await deptCoreActionFormActivityRuleModel.create(model)
    return sequelizeUtil.extractDataValues(result)
}

const bulkCreate = async (models, transaction) => {
    if (transaction)
        return (await deptCoreActionFormActivityRuleModel.bulkCreate(models, {transaction}))
    return (await deptCoreActionFormActivityRuleModel.bulkCreate(models))
}

const deleteFormActivityRule = async (id) => {
    return (await deptCoreActionFormActivityRuleModel.destroy({where: {id}}))
}

const deleteFormActivityRuleByFormRuleIds = async (formRuleIds, transaction) => {
    if (transaction) {
        return (await deptCoreActionFormActivityRuleModel.destroy({
            where: {deptCoreActionFormRuleId: {$in: formRuleIds}},
            transaction
        }))
    }
    return (await deptCoreActionFormActivityRuleModel.destroy({
            where: {deptCoreActionFormRuleId: {$in: formRuleIds}},
            transaction
        })
    )
}

const updateFormActivityRule = async (data) => {
    return (await deptCoreActionFormActivityRuleModel.update(data, {where: {id: data.id}}))
}

const getFormActivityRules = async (formRuleId) => {
    return (await getFormActivityRulesByWhere({deptCoreActionFormRuleId: formRuleId}))
}

const getFormActivityRulesByFormRuleIds = async (formRuleIds) => {
    return (await getFormActivityRulesByWhere({deptCoreActionFormRuleId: {$in: formRuleIds}}))
}

const getFormActivityRulesByWhere = async (where) => {
    const result = await deptCoreActionFormActivityRuleModel.findAll({
        where
    })
    return sequelizeUtil.extractDataValues(result)
}

const doesFormRuleHasActivityAndOwnerId = async (formRuleId, activityId, ownerFromId) => {
    const formRuleActivity = await getFormActivityRulesByWhere({
        deptCoreActionFormRuleId: formRuleId,
        activityId,
        "owner.id": ownerFromId
    })
    return formRuleActivity.length > 0
}

module.exports = {
    getFormActivityRules,
    getFormActivityRulesByFormRuleIds,
    updateFormActivityRule,
    bulkCreate,
    saveFormActivityRule,
    deleteFormActivityRule,
    deleteFormActivityRuleByFormRuleIds,
    doesFormRuleHasActivityAndOwnerId
}