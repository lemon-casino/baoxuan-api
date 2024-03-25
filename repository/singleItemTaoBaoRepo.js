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
        // batchId 以日期为准精确到天，一天仅会有一次，插入前先清理下（会有重复修改的情况）
        await deleteSingleIteTaoBaoByBatchId(item.batchId)
        return await singleItemTaoBaoModel.create(item)
    } catch (e) {
        await deleteSingleIteTaoBaoByBatchId(item.batchId)
        logger.error(e.message)
        throw new Error(e.message)
        return null
    }
}

const deleteSingleIteTaoBaoByBatchId = async (batchId) => {
    try {
        return await singleItemTaoBaoModel.destroy({
            where: {
                batchId
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
    deleteSingleIteTaoBaoByBatchId
}