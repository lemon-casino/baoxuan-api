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

const saveDeptFlowFormActivity = async (deptFlowFormId, activityId, activityName) => {
    const result = await deptFlowFormActivityModel.create({
        deptFlowFormId, activityId, activityName
    })
    return result
}

module.exports = {
    deleteDeptFlowFormActivity,
    getDeptFlowFormActivities,
    saveDeptFlowFormActivity
}