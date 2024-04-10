const processReviewRepo = require("../repository/processReviewRepo")

const getProcessReviewsByProcessId = async (processId) => {
    return await processReviewRepo.getProcessReviewsByProcessId(processId)
}

const saveProcessReview = async (processReviews) => {
    return await processReviewRepo.saveProcessReview(processReviews)
}

const saveBatchProcessReviews = async (processReviews) => {
    return await processReviewRepo.saveBatchProcessReviews(processReviews)
}

const updateProcessReviewCostInfo = async (id, execution) => {
    return await processReviewRepo.updateProcessReviewCostInfo(id, execution)
}

module.exports = {
    getProcessReviewsByProcessId,
    saveProcessReview,
    updateProcessReviewCostInfo,
    saveBatchProcessReviews
}