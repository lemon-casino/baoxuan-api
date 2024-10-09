const models = require('@/model')
const sequelizeUtil = require("@/utils/sequelizeUtil")

const sequelize = require("@/model/init");
const getFlowFormReviewModel = require("@/model/flowFormReviewModel")
const getFlowfromsModel = require("@/model/flowfromsModel")
const getFlowFormDetailsModel = require("@/model/flowFormDetailsModel")
const flowFormDetailsModel = getFlowFormDetailsModel(sequelize)
const flowfromsModel = getFlowfromsModel(sequelize)
const flowformsreviewsModel = getFlowFormReviewModel(sequelize)



flowfromsModel.hasMany(
    flowformsreviewsModel,
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
    const result = await flowfromsModel.findAll({
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
        await flowfromsModel.create(form, {transaction})

        for (const details of detailsArr) {
            await flowFormDetailsModel.create(details, {transaction})
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
        // 更新 flowForm 的信息
        await flowfromsModel.update({
            ...form
        }, {
            where: {
                flowFormId: form.flowFormId
            },
            transaction  // 确保在同一个事务内执行
        });

        // 使用 upsert 方法避免重复插入或更新记录
        for (const details of detailsArr) {
            await flowFormDetailsModel.upsert({
                ...details
            }, { transaction });
        }

        // 使用 upsert 插入或更新 flowformsreviews 表中的记录
        for (const review of form.reviews) {  // 假设 form 包含 reviews 信息
            // 确保不传递 'id' 字段，避免手动设置主键，使用数据库的自动递增功能
            const { id, ...reviewData } = review;
            await flowformsreviewsModel.upsert({
                ...reviewData  // 不传递 id 字段
            }, { transaction });
        }

        // 提交事务
        await transaction.commit();
        return true;
    } catch (e) {
        // 回滚事务
        await transaction.rollback();
        console.error("Transaction failed: ", e.message);
        throw e;
    }
};

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
    const flowForms = await flowfromsModel.findAll({
        include: [{
            model: flowformsreviewsModel,
            as: "flowFormReviews",
            order: [["create_time", "desc"]],
            limit: 1
        }],
        where
    })
    return flowForms.map(item => item.get({plain: true}))
}

const updateFlowForm = async (form) => {
    return flowfromsModel.update(form, {
        where: {flowFormId: form.flowFormId}
    });
}

module.exports = {
    updateFlowForm,
    getFormDetails,
    getAllForms,
    getAllFlowFormsWithReviews,
    updateFormAndAddDetails,
    saveFormAndDetails
}