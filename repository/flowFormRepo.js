const models = require('../model')
const sequelizeUtil = require("../utils/sequelizeUtil")

models.flowfromsModel.hasMany(
    models.flowformsreviewsModel,
    {
        foreignKey: 'form_id',
        as: "flowFormReviews"
    }
)

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
    const result = await models.flowfromsModel.findAll({
        where,
        order: [["status", "asc"]]
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
        await models.flowfromsModel.create(form, {transaction})

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
        await models.flowfromsModel.update({
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

/**
 * 获取流程表单和最新的审核流程
 * @param formIds 为空时获取全部
 * @returns {Promise<<Model[]>>}
 */
const getAllFlowFormsWithReviews = async (formIds) => {
    const where = {}
    if (formIds && formIds.length > 0) {
        where.flowFormId = {$in: formIds}
    }
    const flowForms = await models.flowfromsModel.findAll({
        include: [{
            model: models.flowformsreviewsModel,
            as: "flowFormReviews",
            order: [["create_time", "desc"]],
            limit: 1
        }],
        where
    })
    return flowForms.map(item => item.get({plain: true}))
}

module.exports = {
    getFormDetails,
    getAllForms,
    getAllFlowFormsWithReviews,
    updateFormAndAddDetails,
    saveFormAndDetails
}