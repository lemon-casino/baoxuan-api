const processReviewRepo = require("../repository/processReviewRepo")

const getProcessReviewsByProcessId = async (processId) => {
    return await processReviewRepo.getProcessReviewsByProcessId(processId)
}

const saveProcessReview = async (processReview) => {
    return await processReviewRepo.saveProcessReview(processReview)
}

const updateProcessReviewCostInfo = async (id, execution) => {
    return await processReviewRepo.saveProcessReview(id, execution)
}

module.exports = {
    getProcessReviewsByProcessId,
    saveProcessReview,
    updateProcessReviewCostInfo
}