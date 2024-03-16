const formReviewRepo = require("../repository/formReviewRepo")

const getFormReviewByFormId = async (formId) => {
    return formReviewRepo.getFormReviewByFormId(formId);
}

module.exports = {getFormReviewByFormId}
