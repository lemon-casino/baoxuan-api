const models = require('@/model')

models.deptFlowFormModel.hasMany(models.deptFlowFormActivityModel,
    {
        foreignKey: 'dept_flow_form_id',
        as: 'deptFlowFormActivities'
    }
)

const getDepartmentFlowForms = async (where) => {
    const forms = await models.deptFlowFormModel.findAll({where})
    return forms.map(item => item.get({plain: true}))
}

const getDeptFlowFormsWithActivities = async (where) => {
    const forms = await models.deptFlowFormModel.findAll({
        where,
        include: [{
            model: models.deptFlowFormActivityModel,
            as: "deptFlowFormActivities"
        }]
    })
    return forms
}

const deleteDepartmentFlowForm = async (id) => {
    // 需要同时把 deptFlowFormActivity中的关联数据也删除
    const trans = await models.sequelize.transaction();
    try {
        await models.deptFlowFormModel.destroy({
            where: {id},
            transaction: trans
        })

        await models.deptFlowFormActivityModel.destroy({
            where: {deptFlowFormId: id},
            transaction: trans
        })
        trans.commit();
        return true;
    } catch (e) {
        trans.rollback()
        throw e
    }
}

const saveDepartmentFlowForm = async (model) => {
    const result = await models.deptFlowFormModel.create(model)
    return result
}

const getDeptFlowFormConfig = async (deptId) => {
    const deptForms = await models.deptFlowFormModel.findAll({
        where: {deptId},
        include: [
            {
                model: models.deptFlowFormActivityModel,
                as: "deptFlowFormActivities"
            }
        ]
    })
    return deptForms
}

const update = async (data, where) => {
    const result = await models.deptFlowFormModel.update(data, {where})
    return result
}

module.exports = {
    saveDepartmentFlowForm,
    deleteDepartmentFlowForm,
    getDepartmentFlowForms,
    getDeptFlowFormConfig,
    getDeptFlowFormsWithActivities,
    update
}