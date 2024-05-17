const sequelize = require('../model/init')
const getDeptFlowFormActivityModel = require("../model/deptFlowFormActivityModel")
const deptFlowFormActivityModel = getDeptFlowFormActivityModel(sequelize)

const deleteDeptFlowFormActivity = async (id) => {
    const result = await deptFlowFormActivityModel.destroy({
        where: {id}
    })
    return result > 0
}

const getDeptFlowFormActivities = async (deptFlowFormId) => {
    const res = await deptFlowFormActivityModel.findAll({
        where: {deptFlowFormId}
    })
}

const saveDeptFlowFormActivity = async (data) => {
    const result = await deptFlowFormActivityModel.create(data)
    return result
}

module.exports = {
    deleteDeptFlowFormActivity,
    getDeptFlowFormActivities,
    saveDeptFlowFormActivity
}