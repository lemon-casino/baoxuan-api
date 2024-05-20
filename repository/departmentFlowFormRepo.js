const models = require('../model')

const getDepartmentFlowForms = async (where) => {
    const forms = await models.deptFlowFormModel.findAll({
        where
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

module.exports = {
    saveDepartmentFlowForm,
    deleteDepartmentFlowForm,
    getDepartmentFlowForms
}