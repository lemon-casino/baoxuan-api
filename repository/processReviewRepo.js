const sequelize = require('../model/init');
const getProcessReviewModel = require("../model/processReviewModel")
const processReviewModel = getProcessReviewModel(sequelize)

const getProcessReviewsByProcessId = async (processId) => {
    const result = await processReviewModel.findAll({
        where: {processId}
    })
    return result
}

const saveProcessReview = async (processReview) => {
    const result = await processReviewModel.create(processReview)
    return result;
}

const updateProcessReviewCostInfo = async (id, execution) => {
    const result = await processReviewModel.update(execution, {
            where: {id: id}
        })
    return result;
}

module.exports = {
    getProcessReviewsByProcessId,
    saveProcessReview,
    updateProcessReviewCostInfo
}