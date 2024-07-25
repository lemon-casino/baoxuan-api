const models = require('@/model')
const deptCoreActionModel = models.deptCoreActionModel
const deptCoreActionFormRuleModel = models.deptCoreActionFormRuleModel
const deptCoreActionFormActivityRuleModel = models.deptCoreActionFormActivityRuleModel
const deptCoreActionFormDetailsRuleModel = models.deptCoreActionFormDetailsRuleModel
const flowFormsModel = models.flowfromsModel
const sequelizeUtil = require("@/utils/sequelizeUtil")

deptCoreActionModel.hasMany(deptCoreActionFormRuleModel, {
    foreignKey: "deptCoreActionId", sourceKey: "id", as: "formRules"
})

// deptCoreActionFormRuleModel.hasMany(deptCoreActionFormDetailsRuleModel, {
//     foreignKey: "deptCoreActionFormRuleId",
//     as: "detailsRules"
// })
//
deptCoreActionFormRuleModel.hasMany(deptCoreActionFormActivityRuleModel, {
    sourceKey: "id",
    foreignKey: "deptCoreActionFormRuleId",
    as: "activityRules"
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
    let deptCoreActionForms = await deptCoreActionFormRuleModel.findAll({
        attributes: {
            include: [
                [
                    models.sequelize.literal(`(
                    select count(*) from dept_core_action_form_activity_rule
                                    where dept_core_action_form_rule_id=deptCoreActionFormRuleModel.id
                    )`),
                    "formActivityRulesCount"
                ],
                [
                    models.sequelize.literal(`(
                    select count(*) from dept_core_action_form_details_rule
                                    where dept_core_action_form_rule_id=deptCoreActionFormRuleModel.id
                    )`),
                    "formDetailsRulesCount"
                ]
            ]
        },
        where: {deptCoreActionId: coreActionId}
    })
    
    deptCoreActionForms = sequelizeUtil.extractDataValues(deptCoreActionForms)
    
    for (const form of forms) {
        const ruledForm = deptCoreActionForms.find(item => item.formId === form.flowFormId)
        
        if (!ruledForm || (!ruledForm.formDetailsRulesCount && !ruledForm.formActivityRulesCount)) {
            form.weight = 0
        } else {
            form.formRuleId = ruledForm.id
            form.detailsRulesCount = ruledForm.formDetailsRulesCount || 0
            form.activityRulesCount = ruledForm.formActivityRulesCount || 0
            form.weight = form.detailsRulesCount + form.activityRulesCount
        }
    }
    
    forms = forms.sort((curr, next) => next.weight - curr.weight)
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