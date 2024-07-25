const models = require('@/model')
const deptCoreActionModel = models.deptCoreActionModel
const deptCoreActionFormRuleModel = models.deptCoreActionFormRuleModel
const flowFormsModel = models.flowfromsModel
const sequelizeUtil = require("@/utils/sequelizeUtil")

deptCoreActionModel.hasMany(deptCoreActionFormRuleModel, {
    foreignKey: "deptCoreActionId", sourceKey: "id", as: "formRules"
})

const getDeptCoreActions = async (deptIds) => {
    const result = await deptCoreActionModel.findAll({
        where: {deptId: {$in: deptIds}}
    })
    return sequelizeUtil.extractDataValues(result)
}

const getCoreAction = async (id) => {
    const result = await deptCoreActionModel.findOne({
        where: {id}
    })
    return result
}

const save = async (model, transaction) => {
    let result = null
    if (transaction) {
        result = await deptCoreActionModel.create(model, {transaction})
    } else {
        result = await deptCoreActionModel.create(model)
    }
    return sequelizeUtil.extractDataValues(result)
}

const delDeptCoreAction = async (id, transaction) => {
    if (transaction) {
        return (await deptCoreActionModel.destroy({
            where: {path: {$like: `%-${id}-%`}},
            transaction
        }))
    }
    return (await deptCoreActionModel.destroy({
        where: {path: {$like: `%-${id}-%`}}
    }))
}

const delDeptCoreActionAloneById = async (id, transaction) => {
    if (transaction) {
        return (await deptCoreActionModel.destroy({
            where: {id},
            transaction
        }))
    }
    return (await deptCoreActionModel.destroy({
        where: {id}
    }))
}


const update = async (model, transaction) => {
    let result = null
    if (transaction) {
        result = await deptCoreActionModel.update(model, {
            where: {id: model.id},
            transaction
        })
    } else {
        result = await deptCoreActionModel.update(model, {where: {id: model.id}})
    }
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
        } else {
            form.formRuleId = -1
        }
    }
    
    forms = forms.sort((curr, next) => next.formRuleId - curr.formRuleId)
    return forms
}

const getDeptCoreActionsAndChildren = async (id) => {
    const result = (await deptCoreActionModel.findAll({
        where: {path: {$like: `%-${id}-%`}},
        order: [["id", "asc"]]
    }))
    return sequelizeUtil.extractDataValues(result)
}

const hasChildActions = async (actionId) => {
    const result = (await deptCoreActionModel.findAll({
        where: {parentId: actionId}
    }))
    
    return result.length > 0
}

module.exports = {
    update,
    save,
    getDeptCoreActions,
    getDeptCoreActionsWithRules,
    delDeptCoreAction,
    delDeptCoreActionAloneById,
    getDeptCoreAction: getCoreAction,
    getDeptCoreActionForms,
    getDeptCoreActionsAndChildren,
    hasChildActions
}