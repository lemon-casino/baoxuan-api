const models = require('../model')
const deptCoreActionModel = models.deptCoreActionModel
const deptCoreActionFormRuleModel = models.deptCoreActionFormRuleModel
const sequelizeUtil = require("../utils/sequelizeUtil")

deptCoreActionModel.hasMany(deptCoreActionFormRuleModel, {
    foreignKey: "deptCoreActionId", sourceKey: "id", as: "formRules"
})

const getDeptCoreActions = async (deptId) => {
    const result = await deptCoreActionModel.findAll({
        where: {deptId}
    })
    return sequelizeUtil.extractDataValues(result)
}

const getDeptCoreActionConfig = async (id) => {
    const result = await deptCoreActionModel.findOne({
        where: {id}
    })
    return result
}

const save = async (model) => {
    const result = await models.deptCoreActionModel.create(model)
    return sequelizeUtil.extractDataValues(result)
}

const delDeptCoreAction = async (id) => {
    const result = await models.deptCoreActionModel.destroy({
        where: {path: {$like: `%-${id}-%`}}
    })
    return result
}

const update = async (model) => {
    const result = await models.deptCoreActionModel.update(model, {where: {id: model.id}})
    return sequelizeUtil.extractDataValues(result)
}

const getDeptCoreActionsWithRules = async (deptId) => {
    const result = await models.deptCoreActionModel.findAll({
        include: [{
            model: deptCoreActionFormRuleModel, as: "formRules"
        }], where: {deptId}
    })
    return sequelizeUtil.extractDataValues(result)
}

module.exports = {
    update, save, getDeptCoreActions, getDeptCoreActionsWithRules, delDeptCoreAction, getDeptCoreActionConfig
}