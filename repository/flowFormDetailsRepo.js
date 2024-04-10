const sequelize = require('../model/init');
const getFlowFormDetailsModel = require("../model/flowFormDetailsModel")
const flowFormDetailsModel = getFlowFormDetailsModel(sequelize)
const {logger} = require("../utils/log")
const sequelizeUtil = require("../utils/sequelizeUtil")

const saveFormDetails = async (details, transaction) => {
    try {
        const result = await flowFormDetailsModel.create(details, {transaction})
        return result
    } catch (e) {
        logger.error(e.message)
        return null
    }
}

const getFormDetailsByFormId = async (formId) => {
    try {
        const formDetails = await flowFormDetailsModel.findAll({
            where: {
                formId
            }
        })
        return sequelizeUtil.extractDataValues(formDetails);
    } catch (e) {
        logger.error(e.message)
        throw new Error(e.message)
    }
}

module.exports = {
    saveFormDetails,
    getFormDetailsByFormId
}