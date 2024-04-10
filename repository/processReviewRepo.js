const sequelize = require('../model/init');
const getProcessReviewModel = require("../model/processReviewModel")
const processReviewModel = getProcessReviewModel(sequelize)
const {logger} = require("../utils/log")
const uuidUtil = require("../utils/uuidUtil")

const getProcessReviewsByProcessId = async (processId) => {
    const result = await processReviewModel.findAll({
        where: {processId}
    })
    return result
}

const saveProcessReview = async (processReview, transaction) => {
    processReview.id = uuidUtil.getId()
    if (transaction) {
        const result = await processReviewModel.create(processReview, {transaction})
        return result
    }
    const result = await processReviewModel.create(processReview)
    return result
}

const saveBatchProcessReviews = async (processReviews) => {
    const transaction = await sequelize.transaction();
    try {
        let index = 0
        for (const processReview of processReviews) {
            processReview.id = uuidUtil.getId()
            processReview.orderIndex = index
            await processReviewModel.create(processReview)
            index = index + 1
        }
        transaction.commit()
        return true
    } catch (e) {
        logger.error(e.message)
        await transaction.rollback()
        return false
    }
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
    updateProcessReviewCostInfo,
    saveBatchProcessReviews
}