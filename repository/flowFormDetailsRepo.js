const sequelize = require('../model/init');
const getFlowFormDetailsModel = require("../model/flowFormDetailsModel")
const flowFormDetailsModel = getFlowFormDetailsModel(sequelize)
const sequelizeUtil = require("../utils/sequelizeUtil")
const flowFormRepo = require("../repository/flowFormRepo")

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
    const formProfile = await flowFormRepo.getAllForms({flowFormId: formId})
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