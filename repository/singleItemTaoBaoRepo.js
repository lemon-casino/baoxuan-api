const sequelize = require('../model/init');
const getSingleItemTaoBaoModel = require("../model/singleItemTaobaoModel")
const singleItemTaoBaoModel = getSingleItemTaoBaoModel(sequelize)
const {logger} = require("../utils/log")
const uuidUtil = require("../utils/uuidUtil")
const sequelizeUtil = require("../utils/sequelizeUtil")

/**
 * 保存淘宝的单品表数据
 * @param item
 * @returns {Promise<*|null>}
 */
const saveSingleItemTaoBao = async (item) => {
    try {
        await deleteSingleIteTaoBaoByBatchIdAndLinkId(item.batchId, item.linkId)
        item.id = uuidUtil.getId()
        return await singleItemTaoBaoModel.create(item)
    } catch (e) {
        await deleteSingleIteTaoBaoByBatchIdAndLinkId(item.batchId, item.linkId)
        logger.error(e.message)
        throw new Error(e.message)
        return null
    }
}

/**
 * 根据batchId和linkId删除数据
 * @param batchId
 * @param linkId
 * @returns {Promise<*|null>}
 */
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

/**
 * 获取单品数据
 * @param operationLeader 运营负责人
 * @param linkType 链接类型
 * @param timeRange 时间范围
 * @returns {Promise<*>}
 */
const getSingleItemByOperationLeaderLinkTypeTimeRange = async (operationLeader, linkType, timeRange) => {
    const singleItems = await singleItemTaoBaoModel.findAll({
        where: {
            operationLeader,
            linkType,
            date: {
                $between: timeRange
            }
        }
    })
    const result = sequelizeUtil.extractDataValues(singleItems)
    return result
}

module.exports = {
    saveSingleItemTaoBao,
    deleteSingleIteTaoBaoByBatchIdAndLinkId,
    getSingleItemByOperationLeaderLinkTypeTimeRange
}