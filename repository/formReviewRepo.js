const sequelize = require('../model/init');
const getFormReviewModel = require("../model/formReviewModel")
const formReviewModel = getFormReviewModel(sequelize)

const getFormReviewByFormId = async (formId) => {
    const formReview = formReviewModel.findAll({
        where: {formId}
    })
    return formReview;
}

module.exports = {
    getFormReviewByFormId
}