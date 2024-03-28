const sequelize = require('../model/init');
const getSingleItemTaoBaoModel = require("../model/singleItemTaobaoModel")
const singleItemTaoBaoModel = getSingleItemTaoBaoModel(sequelize)
const {logger} = require("../utils/log")
const uuidUtil = require("../utils/uuidUtil")
const sequelizeUtil = require("../utils/sequelizeUtil")
const pagingUtil = require("../utils/pagingUtil")
const {taoBaoSingleItemStatusesKeys} = require("../const/singleItemConst")

/**
 * 保存淘宝的单品表数据
 * @param item
 * @returns {Promise<*|null>}
 */
const saveSingleItemTaoBao = async (item) => {
    try {
        await deleteSingleIteTaoBaoByBatchIdAndLinkId(item.batchId, item.linkId)
        item.id = uuidUtil.getId()
        item.createTime = new Date()
        return await singleItemTaoBaoModel.create(item)
    } catch (e) {
        await deleteSingleIteTaoBaoByBatchIdAndLinkId(item.batchId, item.linkId)
        logger.error(e.message)
        logger.error(e.sql)
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
                linkId: linkId.toString()
            }
        })
    } catch (e) {
        throw new Error(e.message)
        logger.error(e.message)
        logger.error(e.sql)
        return null
    }
}

/**
 * 获取淘宝单品表数据
 * @param pageIndex 页码
 * @param pageSize 单页数据量
 * @param operationLeaderNames 运营负责人姓名: 支持多人
 * @param firstLevelProductLine 一级产品线
 * @param secondLevelProductLine 二级产品线
 * @param errorItem 异常项目
 * @param linkType 链接类型
 * @param linkStatus 链接状态
 * @param timeRange 时间区间
 * @returns {Promise<{pageCount: *, data: *, pageIndex: *, pageSize: *}|null>}
 */
const getTaoBaoSingleItems = async (pageIndex,
                                    pageSize,
                                    operationLeaderNames,
                                    firstLevelProductLine,
                                    secondLevelProductLine,
                                    errorItem,
                                    linkType,
                                    linkStatus,
                                    fightingLinkIds,
                                    timeRange) => {
    try {
        if (pageIndex < 0 || pageSize < 0) {
            throw new Error("分页参数无效")
        }

        const where = {}
        where.productLineLeader = {$in: operationLeaderNames}
        where.date = {$between: timeRange}
        if (linkType) {
            where.linkType = linkType
        }
        if (errorItem.field) {
            where[errorItem.field] = {[errorItem.operator]: errorItem.value}
        }
        if (linkStatus) {
            if (linkStatus === taoBaoSingleItemStatusesKeys.fighting) {
                where.linkId = {$in: fightingLinkIds}
            } else {
                where.linkId = {$notIn: fightingLinkIds}
            }
        }

        const satisfiedCount = await singleItemTaoBaoModel.count({
            where
        })
        let data = await singleItemTaoBaoModel.findAll({
            offset: pageIndex * pageSize,
            limit: pageSize,
            where,
            order: [["linkId", "asc"],["date", "asc"]]
        })
        data = sequelizeUtil.extractDataValues(data)
        const result = pagingUtil.paging(Math.ceil(satisfiedCount / pageSize), satisfiedCount, data)
        return result

    } catch (e) {
        logger.error(e.message)
        logger.error(e.sql)
        throw new Error(e.message)
        return null
    }
}

/**
 * 获取单品数据
 * @param productionLineLeader 产品线负责人
 * @param linkType 链接类型
 * @param timeRange 时间范围
 * @returns {Promise<*>}
 */
const getSingleItemByProductionLineLeaderLinkTypeTimeRange = async (productionLineLeader, linkType, timeRange) => {
    try {
        const singleItems = await singleItemTaoBaoModel.findAll({
            where: {
                productionLineLeader,
                linkType,
                date: {
                    $between: timeRange
                }
            }
        })
        const result = sequelizeUtil.extractDataValues(singleItems)
        return result
    } catch (e) {
        logger.error(e.message)
        logger.error(e.sql)
        return null
    }
}

/**
 * 获取单品表中的链接属性
 * @returns {Promise<*[]>}
 */
const getLinkTypes = async () => {
    try {
        const result = await singleItemTaoBaoModel.findAll({
            group: 'link_type',
            attributes: ['link_type']
        })
        const data = sequelizeUtil.extractDataValues(result)
        return data
    } catch (e) {
        throw new Error(e.message)
        logger.error(e.message)
        logger.error(e.sql)
        return null
    }
}


module.exports = {
    saveSingleItemTaoBao,
    deleteSingleIteTaoBaoByBatchIdAndLinkId,
    getSingleItemByProductionLineLeaderLinkTypeTimeRange,
    getTaoBaoSingleItems,
    getLinkTypes
}