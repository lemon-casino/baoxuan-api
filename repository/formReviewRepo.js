const models = require('../model')
const sequelizeUtil = require("../utils/sequelizeUtil")

const getFormReviewByFormId = async (formId) => {
    const formReviews = await models.flowformsreviewsModel.findAll({
        where: {formId},
        order: [["modifiedTime", "desc"]]
    })
    return sequelizeUtil.extractDataValues(formReviews)
}

const getDetailsById = async (id) => {
    const result = await models.flowformsreviewsModel.findByPk(id)
    return sequelizeUtil.extractDataValues(result)
}

module.exports = {
    getFormReviewByFormId,
    getDetailsById
}