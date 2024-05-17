const sequelize = require('../model/init');
const getDeptFlowFormModel = require("../model/deptFlowFormModel")
const deptFlowFormModel = getDeptFlowFormModel(sequelize)
const getDeptFlowFormActivityModel = require("../model/deptFlowFormActivityModel")
const deptFlowFormActivityModel = getDeptFlowFormActivityModel(sequelize)

deptFlowFormModel.hasMany(deptFlowFormActivityModel,
    {
        foreignKey: 'deptFlowFormId',
        as: "activities"
    }
)

const getDepartmentFlowForms = async (deptId) => {
    const forms = await deptFlowFormModel.findAll({
        where: {deptId}
    })
    return forms
}

const deleteDepartmentFlowForm = async (id) => {
    // 需要同时把 deptFlowFormActivity中的关联数据也删除
    const trans = await sequelize.transaction();
    try {
        await deptFlowFormModel.destroy({
            where: {id},
            transaction: trans
        })

        await deptFlowFormActivityModel.destroy({
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
    const result = await deptFlowFormModel.create(model)
    return result
}

module.exports = {
    saveDepartmentFlowForm,
    deleteDepartmentFlowForm,
    getDepartmentFlowForms
}