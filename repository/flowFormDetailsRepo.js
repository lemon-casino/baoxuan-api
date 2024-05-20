const models = require('../model')
const sequelizeUtil = require("../utils/sequelizeUtil")

const saveFormDetails = async (details, transaction) => {
    const result = await models.flowFormDetailsModel.create(details, {transaction})
    return result
}

const getFormDetailsByFormId = async (formId) => {
    const formDetails = await models.flowFormDetailsModel.findAll({
        where: {
            formId
        }
    })
    return sequelizeUtil.extractDataValues(formDetails);
}

const getFormLatestDetailsByFormId = async (formId) => {
    const formProfile = await models.flowfromsModel.findAll(
        {
            where: {
                flowFormId: formId
            },
            order: [["detailsVersion", "desc"]]
        }
    )
    if (formProfile.length > 0) {
        const formDetails = await models.flowFormDetailsModel.findAll({
            where: {
                formId,
                version: formProfile[0].detailsVersion
            }
        })
        return sequelizeUtil.extractDataValues(formDetails);
    }
    return []
}

module.exports = {
    saveFormDetails,
    getFormDetailsByFormId,
    getFormLatestDetailsByFormId
}