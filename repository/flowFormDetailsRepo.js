const sequelize = require('../model/init');
const getFlowFormDetailsModel = require("../model/flowFormDetailsModel")
const flowFormDetailsModel = getFlowFormDetailsModel(sequelize)
const {logger} = require("../utils/log")
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

module.exports = {
    saveFormDetails,
    getFormDetailsByFormId
}