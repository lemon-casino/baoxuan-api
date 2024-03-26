const sequelize = require('../model/init');
const getSingleItemTaoBaoModel = require("../model/singleItemTaobaoModel")
const singleItemTaoBaoModel = getSingleItemTaoBaoModel(sequelize)
const {logger} = require("../utils/log")

/**
 * 保存淘宝的单品表数据
 * @param item
 * @returns {Promise<*|null>}
 */
const saveSingleItemTaoBao = async (item) => {
    try {
        await deleteSingleIteTaoBaoByBatchIdAndLinkId(item.batchId, item.linkId)
        return await singleItemTaoBaoModel.create(item)
    } catch (e) {
        await deleteSingleIteTaoBaoByBatchIdAndLinkId(item.batchId, item.linkId)
        logger.error(e.message)
        throw new Error(e.message)
        return null
    }
}

const deleteSingleIteTaoBaoByBatchIdAndLinkId = async (batchId, linkId) => {
    try {
        return await singleItemTaoBaoModel.destroy({
            where: {
                batchId,
                linkId
            }
        })
    } catch (e) {
        throw new Error(e.message)
        logger.error(e.message)
        return null
    }
}

module.exports = {
    saveSingleItemTaoBao,
    deleteSingleIteTaoBaoByBatchIdAndLinkId
}