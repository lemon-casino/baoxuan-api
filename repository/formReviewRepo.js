const sequelize = require('../model/init');
const getFormReviewModel = require("../model/formReviewModel")
const formReviewModel = getFormReviewModel(sequelize)
const sequelizeUtil = require("../utils/sequelizeUtil")

const getFormReviewByFormId = async (formId) => {
    const formReviews = await formReviewModel.findAll({
        where: {formId},
        order: [["modifiedTime", "desc"]]
    })
    return sequelizeUtil.extractDataValues(formReviews)
}

module.exports = {
    getFormReviewByFormId
}