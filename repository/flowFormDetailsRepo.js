const sequelize = require('../model/init');
const getFlowFormDetailsModel = require("../model/flowFormDetailsModel")
const flowFormDetailsModel = getFlowFormDetailsModel(sequelize)
const getFlowFormModel = require("../model/flowFormsModel")
const flowFormModel = getFlowFormModel(sequelize)
const sequelizeUtil = require("../utils/sequelizeUtil")

const saveFormDetails = async (details, transaction) => {
    const result = await flowFormDetailsModel.create(details, {transaction})
    return result
}

const getFormDetailsByFormId = async (formId) => {
    const formDetails = await flowFormDetailsModel.findAll({
        where: {
            formId
        }
    })
    return sequelizeUtil.extractDataValues(formDetails);
}

const getFormLatestDetailsByFormId = async (formId) => {
    const formProfile = await flowFormModel.findAll(
        {
            where: {
                flowFormId: formId
            },
            order: [["detailsVersion", "desc"]]
        }
    )
    if (formProfile.length > 0) {
        const formDetails = await flowFormDetailsModel.findAll({
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