const models = require('@/model')
const sequelizeUtil = require("@/utils/sequelizeUtil")
const flowFormsReviewsModel = models.flowformsreviewsModel

const getFormReviewByFormId = async (formId) => {
    const formReviews = await flowFormsReviewsModel.findAll({
        where: {formId},
        order: [["modifiedTime", "desc"]]
    })
    return sequelizeUtil.extractDataValues(formReviews)
}

const getDetailsById = async (id) => {
    const result = await flowFormsReviewsModel.findByPk(id)
    return sequelizeUtil.extractDataValues(result)
}

module.exports = {
    getFormReviewByFormId,
    getDetailsById
}