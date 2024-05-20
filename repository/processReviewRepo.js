const models = require('../model')
const uuidUtil = require("../utils/uuidUtil")

const getProcessReviewsByProcessId = async (processId) => {
    const result = await models.processReviewModel.findAll({
        where: {processId}
    })
    return result
}

const saveProcessReview = async (processReview, transaction) => {
    processReview.id = uuidUtil.getId()
    if (transaction) {
        const result = await models.processReviewModel.create(processReview, {transaction})
        return result
    }
    const result = await models.processReviewModel.create(processReview)
    return result
}

const saveBatchProcessReviews = async (processReviews) => {
    const transaction = await models.sequelize.transaction();
    try {
        let index = 0
        for (const processReview of processReviews) {
            processReview.id = uuidUtil.getId()
            processReview.orderIndex = index
            await models.processReviewModel.create(processReview)
            index = index + 1
        }
        transaction.commit()
        return true
    } catch (e) {
        await transaction.rollback()
        throw e
    }
}

const updateProcessReviewCostInfo = async (id, execution) => {
    const result = await models.processReviewModel.update(execution, {
        where: {id: id}
    })
    return result;
}

module.exports = {
    getProcessReviewsByProcessId,
    saveProcessReview,
    updateProcessReviewCostInfo,
    saveBatchProcessReviews
}