const models = require('@/model')
const deptCoreActionModel = models.deptCoreActionModel
const deptCoreActionFormRuleModel = models.deptCoreActionFormRuleModel
const flowFormsModel = models.flowfromsModel
const sequelizeUtil = require("@/utils/sequelizeUtil")

deptCoreActionModel.hasMany(deptCoreActionFormRuleModel, {
    foreignKey: "deptCoreActionId", sourceKey: "id", as: "formRules"
})

const getDeptCoreActions = async (deptId) => {
    const result = await deptCoreActionModel.findAll({
        where: {deptId}
    })
    return sequelizeUtil.extractDataValues(result)
}

const getDeptCoreAction = async (id) => {
    const result = await deptCoreActionModel.findOne({
        where: {id}
    })
    return result
}

const save = async (model) => {
    const result = await deptCoreActionModel.create(model)
    return sequelizeUtil.extractDataValues(result)
}

const delDeptCoreAction = async (id) => {
    const result = await deptCoreActionModel.destroy({
        where: {path: {$like: `%-${id}-%`}}
    })
    return result
}

const update = async (model) => {
    const result = await deptCoreActionModel.update(model, {where: {id: model.id}})
    return sequelizeUtil.extractDataValues(result)
}

const getDeptCoreActionsWithRules = async (deptId) => {
    const result = await deptCoreActionModel.findAll({
        include: [{
            model: deptCoreActionFormRuleModel, as: "formRules"
        }], where: {deptId}
    })
    return sequelizeUtil.extractDataValues(result)
}

const getDeptCoreActionForms = async (coreActionId) => {
    let forms = await flowFormsModel.findAll({})
    forms = sequelizeUtil.extractDataValues(forms)
    const deptCoreActionForms = await deptCoreActionFormRuleModel.findAll({
        where: {deptCoreActionId: coreActionId}
    })
    for (const form of forms) {
        const ruledForm = deptCoreActionForms.find(item => item.formId === form.flowFormId)
        if (ruledForm) {
            form.formRuleId = ruledForm.id
        }
    }
    return forms
}

module.exports = {
    update,
    save,
    getDeptCoreActions,
    getDeptCoreActionsWithRules,
    delDeptCoreAction,
    getDeptCoreAction,
    getDeptCoreActionForms
}