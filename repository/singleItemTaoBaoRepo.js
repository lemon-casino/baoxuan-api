const Sequelize = require("sequelize")
const sequelize = require('../model/init');
const getSingleItemTaoBaoModel = require("../model/singleItemTaobaoModel")
const singleItemTaoBaoModel = getSingleItemTaoBaoModel(sequelize)
const uuidUtil = require("../utils/uuidUtil")
const sequelizeUtil = require("../utils/sequelizeUtil")
const pagingUtil = require("../utils/pagingUtil")
const {taoBaoSingleItemStatusesKeys} = require("../const/singleItemConst")
const NotFoundError = require("../error/http/notFoundError")

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
        throw e
    }
}

/**
 * 根据batchId和linkId删除数据
 * @param batchId
 * @param linkId
 * @returns {Promise<*|null>}
 */
const deleteSingleIteTaoBaoByBatchIdAndLinkId = async (batchId, linkId) => {
    return await singleItemTaoBaoModel.destroy({
        where: {
            batchId,
            linkId: linkId.toString()
        }
    })
}

/**
 * 获取淘宝单品表数据
 * @param pageIndex 页码
 * @param pageSize 单页数据量
 * @param productLineLeaders 产品线负责人姓名: 支持多人
 * @param firstLevelProductLine 一级产品线
 * @param secondLevelProductLine 二级产品线
 * @param errorItems 异常项目
 * @param linkTypes 链接类型
 * @param linkStatus 链接状态
 * @param timeRange 时间区间
 * @returns {Promise<{pageCount: *, total: *, data: *}>}
 */
const getTaoBaoSingleItems = async (pageIndex,
                                    pageSize,
                                    productLineLeaders,
                                    firstLevelProductLine,
                                    secondLevelProductLine,
                                    errorItems,
                                    linkTypes,
                                    linkHierarchies,
                                    linkStatus,
                                    fightingLinkIds,
                                    timeRange,
                                    clickingAdditionalParams) => {

    let startDateTime, endDateTime;
    const daysInRange = getDaysInRange(timeRange[0], timeRange[1]);

    if (daysInRange === 1) {
        startDateTime = new Date(timeRange[0]);
        endDateTime = new Date(timeRange[0]);
    } else {
        // 相减结果不等于一天，查询时间范围为时间范围的起始时间到结束时间
        startDateTime = new Date(timeRange[0]);
        endDateTime = new Date(timeRange[1]);
    }
    const where = {date: {$between: [startDateTime, endDateTime]}}
    const abnormalWhere = {}
    if (productLineLeaders) {
        if (productLineLeaders.length === 1) {
            where.productLineLeader = productLineLeaders[0]
        } else if (productLineLeaders.length > 1) {
            where.productLineLeader = {$in: productLineLeaders}
        }
    }

    if (linkHierarchies) {
        if (linkHierarchies.length === 1) {
            where.linkHierarchy = linkHierarchies[0]
        } else if (linkHierarchies.length > 1) {
            where.linkHierarchy = {$in: linkHierarchies}
        }
    }

    if (linkTypes) {
        if (linkTypes.length === 1) {
            where.linkType = linkTypes[0]
        } else if (linkTypes.length > 1) {
            where.linkType = {$in: linkTypes}
        }
    }

    if (clickingAdditionalParams) {
        for (const clickingParam of clickingAdditionalParams) {
            if (clickingParam.field && clickingParam.operator && clickingParam.value) {
                where[clickingParam.field] = {[clickingParam.operator]: clickingParam.value}
            }
        }
    }

    if (errorItems) {
        for (const errorItem of errorItems) {
            // console.log("异常的条件",errorItem)
            if (errorItem.sqlValue){
                where[errorItem.field] = {[errorItem.operator]: errorItem.sqlValue}
            }else{
                // console.log("到异常的条件",where)
                // 这个异常 需要进行条件查询
                if(errorItem.field === "profitRate"){
                    abnormalWhere[errorItem.lessThan] = "true"
                    where[errorItem.field] = {[errorItem.operator]: errorItem.value}
                }
                //手淘人数市场占比环比（7天）下降
                if (errorItem.field === "shouTaoPeopleNumMarketRateCircleRate7Day"){
                    where["salesMarketRateCircleRate7Day"] = {"$ne": errorItem.value}
                }
                //坑市场占比环比（7天）下降
                if (errorItem.field === "salesMarketRateCircleRate7Day"){
                    where["shouTaoPeopleNumMarketRateCircleRate7Day"] = {"$gt": errorItem.value}
                }

                //手淘人数市场占比环比（日）下降
                if (errorItem.field === "shouTaoPeopleNumMarketRateCircleRateDay"){
                    where["salesMarketRateCircleRateDay"] = {"$ne": errorItem.value}
                }
                //坑市场占比环比（日天）下降
                if (errorItem.field === "salesMarketRateCircleRateDay"){
                    where["shouTaoPeopleNumMarketRateCircleRateDay"] = {"$gt": errorItem.value}
                }

                where[errorItem.field] = {[errorItem.operator]: errorItem.value}

               // console.log(abnormalWhere)

            }
        }
    }

    if (linkStatus) {
        if (linkStatus === taoBaoSingleItemStatusesKeys.fighting) {
            where.linkId = {$in: fightingLinkIds}
        } else {
            where.linkId = {$notIn: fightingLinkIds}
        }
    }

    // const satisfiedCount = await singleItemTaoBaoModel.count({
    //     where
    // })
    singleItemTaoBaoModel.belongsTo(ABbnormal_TM, {
        foreignKey: 'linkId',
        targetKey: 'linkId'
    });

    let result = await singleItemTaoBaoModel.findAndCountAll({
        attributes: {
            include: [
                [Sequelize.fn('date', Sequelize.col('singleItemTaoBaoModel.date')), 'date'],
                [col('ABbnormal_TM.new_16_30'), 'new_16_30'],
                [col('ABbnormal_TM.new_30_60'), 'new_30_60'],
                [col('ABbnormal_TM.negative_profit_60'), 'negative_profit_60'],
                [col('ABbnormal_TM.old'), 'old']
            ]
        },
        include: [{
            model: ABbnormal_TM,
            attributes: [], // Don't fetch any additional fields from ItemInfoModel
            required: true,
            on: {
                '$singleItemTaoBaoModel.date$': { [Sequelize.Op.eq]: Sequelize.col('ABbnormal_TM.date') },
                '$singleItemTaoBaoModel.link_id$': { [Sequelize.Op.eq]: Sequelize.col('ABbnormal_TM.link_id') }
            },
            where: abnormalWhere
        }],
        offset: pageIndex * pageSize,
        limit: pageSize,
        where,
        order: [["linkId", "asc"], ["date", "asc"]],
        logging:true,
        group: ['singleItemTaoBaoModel.date','singleItemTaoBaoModel.id','ABbnormal_TM.new_16_30','ABbnormal_TM.new_30_60','ABbnormal_TM.negative_profit_60','ABbnormal_TM.old'],
    })
    result.rows = result.rows.map(function (item) {
        return item.get({plain: true})
    })
    console.log(result.count.length)

    // pagingUtil.paging(Math.ceil(result.count / pageSize), result.count, result.rows)  result.count 为总数
    return  pagingUtil.paging(Math.ceil(result.count.length / pageSize), result.count.length, result.rows)
}

/**
 * 获取错误项的数据量
 * @param productLineLeaders
 * @param errorItem
 * @param timeRange
 * @returns {Promise<*>}
 */
const getErrorSingleItemsTotal = async (productLineLeaders,
                                        errorItem,
                                        timeRange) => {
    const items = await getErrorSingleItems(productLineLeaders, errorItem, timeRange)
    return items.length
}

/**
 * 获取异常的单品表数据
 * @param productLineLeaders
 * @param errorItem
 * @param timeRange
 * @returns {Promise<*|*[]>}
 */
const getErrorSingleItems = async (productLineLeaders,
                                   errorItem,
                                   timeRange) => {
    const where = {}
    if (!errorItem.field) {
        return []
    }
    where[errorItem.field] = {[errorItem.operator]: errorItem.value}
    where.productLineLeader = {$in: productLineLeaders}
    where.date = {$between: timeRange}
    const result = await singleItemTaoBaoModel.findAll({where})
    const data = sequelizeUtil.extractDataValues(result)
    return data
}

/**
 * 获取单品数据
 * @param productionLineLeader 产品线负责人
 * @param linkType 链接类型
 * @param timeRange 时间范围
 * @returns {Promise<*>}
 */
const getSingleItemByProductLeaderLinkTypeTimeRange = async (productLineLeader, linkType, timeRange) => {
    const singleItems = await singleItemTaoBaoModel.findAll({
        where: {
            productLineLeader,
            linkType,
            date: {
                $between: timeRange
            }
        }
    })
    const result = sequelizeUtil.extractDataValues(singleItems)
    return result
}


/**
 * 获取单品表详情
 * @param id
 * @returns {Promise<*|[]|null>}
 */
const getSingleItemById = async (id) => {
    const singleItem = await singleItemTaoBaoModel.findAll({
        where: {id}
    })
    if (singleItem && singleItem.length > 0) {
        const result = sequelizeUtil.extractDataValues(singleItem)
        return result[0]
    } else {
        throw new NotFoundError(`${id}所对应的单品信息不存在`)
    }
}

/**
 * 获取单品表中的链接属性
 * @returns {Promise<*[]>}
 */
const getLinkTypes = async () => {
    const result = await singleItemTaoBaoModel.findAll({
        group: 'link_type',
        attributes: ['link_type']
    })
    const data = sequelizeUtil.extractDataValues(result)
    return data
}

/**
 * 获取单品表中的链接层级
 * @returns {Promise<[]|*>}
 */
const getLinkHierarchy = async () => {
    const result = await singleItemTaoBaoModel.findAll({
        group: 'link_hierarchy',
        attributes: ['link_hierarchy']
    })
    let data = sequelizeUtil.extractDataValues(result)
    return data
}

/**
 * 根据产品线负责人汇总数据: 支付金额、推广金额(payAmount)、汇总金额（）
 * @param productLineLeader
 * @returns {Promise<*|[]>}
 */
const sumPaymentByProductLineLeader = async (productLineLeader) => {
    const sumResult = await singleItemTaoBaoModel.findAll({
        attributes: [
            [Sequelize.fn('SUM', Sequelize.col('pay_amount')), 'payAmount'],
            [Sequelize.fn('SUM', Sequelize.col('really_shipment_amount')), 'reallyShipmentAmount'],
            [Sequelize.fn('SUM', Sequelize.col('profit_amount')), 'profitAmount'],
        ],
        where: {
            productLineLeader
        }
    })
    return sequelizeUtil.extractDataValues(sumResult)[0]
}

/**
 * 根据产品线负责人获取单品表数据
 * @returns {Promise<void>}
 */
const getSingleItemsBy = async (where) => {
    const result = await singleItemTaoBaoModel.findAll({
        where
    })
    const data = sequelizeUtil.extractDataValues(result)
    return data
}

/**
 * 获取最新的几条数据
 * @param count
 * @returns {Promise<*|*>}
 */
const getLatestBatchIdRecords = async (count) => {
    let data = await singleItemTaoBaoModel.findAll({
        offset: 0,
        limit: count || 1,
        order: [["batchId", "desc"]]
    })
    data = data.map(function (item) {
        return item.get({plain: true})
    })
    return data
}

module.exports = {
    saveSingleItemTaoBao,
    deleteSingleIteTaoBaoByBatchIdAndLinkId,
    getSingleItemByProductLeaderLinkTypeTimeRange,
    getTaoBaoSingleItems,
    getLinkTypes,
    getSingleItemById,
    getErrorSingleItemsTotal,
    getErrorSingleItems,
    sumPaymentByProductLineLeader,
    getSingleItemsBy,
    getLatestBatchIdRecords,
    getLinkHierarchy
}