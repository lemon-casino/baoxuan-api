const models = require('../model')
const sequelizeUtil = require("../utils/sequelizeUtil")

/**
 * 获取表单详情
 * @param formId
 * @returns {Promise<*|null>}
 */
const getFormDetails = async (formId) => {
    const tmpForms = await getAllForms({flowFormId: formId})
    if (tmpForms.length > 0)
        return tmpForms[0]
    return null
}

/**
 * 根据条件获取流程表单数据
 * @param where
 * @returns {Promise<[]|*>}
 */
const getAllForms = async (where) => {
    const result = await models.flowFormModel.findAll({
        where
    })
    return sequelizeUtil.extractDataValues(result)
}

/**
 * 保存form信息和详情
 * @param form
 * @param detailsArr
 * @returns {Promise<boolean>}
 */
const saveFormAndDetails = async (form, detailsArr) => {
    const transaction = await models.sequelize.transaction();
    try {
        await models.flowFormModel.create(form, {transaction})

        for (const details of detailsArr) {
            await models.flowFormDetailsModel.create(details, {transaction})
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
    const transaction = await models.sequelize.transaction();
    try {
        await models.flowFormModel.update({
            ...form
        }, {
            where: {
                flowFormId: form.flowFormId
            }
        }, {transaction})

        for (const details of detailsArr) {
            await models.flowFormDetailsModel.create(details, {transaction})
        }
        await transaction.commit()
        return true
    } catch (e) {
        await transaction.rollback()
        throw e
    }
}

module.exports = {
    getFormDetails,
    getAllForms,
    updateFormAndAddDetails,
    saveFormAndDetails
}