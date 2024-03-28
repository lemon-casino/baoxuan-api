const sequelize = require('../model/init');
const getSingleItemTaoBaoModel = require("../model/singleItemTaobaoModel")
const singleItemTaoBaoModel = getSingleItemTaoBaoModel(sequelize)
const {logger} = require("../utils/log")
const uuidUtil = require("../utils/uuidUtil")
const sequelizeUtil = require("../utils/sequelizeUtil")
const pagingUtil = require("../utils/pagingUtil")
const singleItemConst = require("../const/singleItemConst")
const {taoBaoSingleItemStatusesKeys} = require("../const/singleItemConst")
const flowStatusConst = require("../const/flowStatusConst")
const globalGetter = require("../global/getter")

// 天猫链接打架流程表单id
const tmFightingFlowFormId = "FORM-495A1584CBE84928BB3B1E0D4AA4B56AYN1J"
// todo: 历史数据同步完成后，可以从数据库中获取
// 天猫链接打架流程表单中链接ID的key
const linkIdKeyInTmFightingFlowForm = "textField_lqhp0b0d"

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
                linkId: linkId
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
                                    timeRange) => {
    try {
        const where = {}
        where.productLineLeader = {$in: operationLeaderNames}
        where.date = {$between: timeRange}
        if (linkType) {
            where.linkType = linkType
        }
        if (errorItem.field) {
            where[errorItem.field] = {[errorItem.operator]: errorItem.value}
        }
        // 从正在进行中的打仗流程中的data中找到linkId
        let fightingLinkIds = []
        if (linkStatus) {
            const todayFlows = await globalGetter.getTodayFlows();
            const runningFightingFlows = todayFlows.filter((flow) => {
                return flow.formUuid === tmFightingFlowFormId && flow.instanceStatus === flowStatusConst.RUNNING
            })
            for (const runningFightingFlow of runningFightingFlows) {
                const runningLinkId = runningFightingFlow.data[linkIdKeyInTmFightingFlowForm]
                if (runningLinkId) {
                    fightingLinkIds.push(runningLinkId)
                }
            }
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
            where
        })
        data = sequelizeUtil.extractDataValues(data)
        const result = pagingUtil.paging(Math.ceil(satisfiedCount / pageSize), data)
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
 * @param operationLeader 运营负责人
 * @param linkType 链接类型
 * @param timeRange 时间范围
 * @returns {Promise<*>}
 */
const getSingleItemByOperationLeaderLinkTypeTimeRange = async (operationLeader, linkType, timeRange) => {
    try {
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
    getSingleItemByOperationLeaderLinkTypeTimeRange,
    getTaoBaoSingleItems,
    getLinkTypes
}