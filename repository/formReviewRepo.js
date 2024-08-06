const models = require('@/model')
const sequelizeUtil = require("@/utils/sequelizeUtil")
const flowFormsReviewsModel = models.flowformsreviewsModel
const flowFormProcessVersionModel = models.flowFormProcessVersionModel

flowFormsReviewsModel.hasOne(flowFormProcessVersionModel, {
    sourceKey: "versionId",
    foreignKey: "id",
    as: "version"
})

const getFormReviewByFormId = async (formId) => {
    const formReviews = await flowFormsReviewsModel.findAll({
        where: {formId},
        order: [["modifiedTime", "desc"]],
        include: [
            {
                model: flowFormProcessVersionModel,
                as: "version"
            }
        ]
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