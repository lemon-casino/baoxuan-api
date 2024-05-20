const models = require('../model')
const uuidUtil = require("../utils/uuidUtil")

/**
 * 保存流程详情（一组）
 * @param detailsArr
 * @returns {Promise<boolean>}
 */
const saveProcessDetailsArr = async (detailsArr) => {
    const transaction = await models.sequelize.transaction();
    try {
        for (const details of detailsArr) {
            details.id = uuidUtil.getId()
            await models.processDetailsModel.create(details, transaction)
        }
        await transaction.commit()
        return true
    } catch (e) {
        await transaction.rollback()
        throw e
    }
}

const saveProcessDetailsArrWithOutTrans = async (detailsArr, transaction) => {
    for (const details of detailsArr) {
        details.id = uuidUtil.getId()
        await models.processDetailsModel.create(details, transaction)
    }
    return true
}


module.exports = {
    saveProcessDetailsArr,
    saveProcessDetailsArrWithOutTrans
}