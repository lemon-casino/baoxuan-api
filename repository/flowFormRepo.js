const sequelize = require('../model/init');
const getFlowFormModel = require("../model/flowFormsModel")
const flowFormModel = getFlowFormModel(sequelize)
const flowFormDetailsRepo = require("./flowFormDetailsRepo")
const {logger} = require("../utils/log")

const getAllForms = async () => {
    const result = await flowFormModel.findAll()
    const flowForms = []
    for (const flowForm of result) {
        flowForms.push(flowForm.dataValues)
    }
    return flowForms
}

/**
 * 保存form信息和详情
 * @param form
 * @param detailsArr
 * @returns {Promise<boolean>}
 */
const saveFormAndDetails = async (form, detailsArr) => {
    const transaction = await sequelize.transaction();
    try {
        await flowFormModel.create(form, {transaction})

        for (const details of detailsArr) {
            await flowFormDetailsRepo.saveFormDetails(details, transaction)
        }
        await transaction.commit()
        return true
    } catch (e) {
        await transaction.rollback()
        throw e
    }
}

/**
 * 更新form并将详情保存入库
 * @param form
 * @param detailsArr
 * @returns {Promise<boolean>}
 */
const updateFormAndAddDetails = async (form, detailsArr) => {
    const transaction = await sequelize.transaction();
    try {
        await flowFormModel.update({
            ...form
        }, {
            where: {
                flowFormId: form.flowFormId
            }
        }, {transaction})

        for (const details of detailsArr) {
            await flowFormDetailsRepo.saveFormDetails(details, transaction)
        }
        await transaction.commit()
        return true
    } catch (e) {
        await transaction.rollback()
        throw e
    }
}

module.exports = {
    getAllForms,
    updateFormAndAddDetails,
    saveFormAndDetails
}