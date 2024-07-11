const Sequelize = require("sequelize")
const sequelize = require('../model/init');
const {DataTypes, where, col} = Sequelize;
const getSingleItemTaoBaoModel = require("../model/singleItemTaobaoModel")
const singleItemTaoBaoModel = getSingleItemTaoBaoModel(sequelize)
const uuidUtil = require("../utils/uuidUtil")
const sequelizeUtil = require("../utils/sequelizeUtil")
const pagingUtil = require("../utils/pagingUtil")
const {taoBaoSingleItemStatusesKeys} = require("../const/singleItemConst")
const NotFoundError = require("../error/http/notFoundError")
const moment = require("moment");
const getABnormal_tm = require("../model/ABbnormal_TM");
const ABbnormal_TM = getABnormal_tm(sequelize);
const getAItemInfo = require("../model/ItemInfoModel");
const {QueryTypes, Op} = require("sequelize");
const ItemInfoModel = getAItemInfo(sequelize)
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
 * 更新数据
 * @param item
 * @returns {Promise<*>}
 */
const updateSingleItemTaoBao = async (item) => {
    const result = await singleItemTaoBaoModel.update(item, {
        where: {id: item.id}
    })
    return result
}

/**
 * 根据batchId和linkId删除数据
 * @param batchId
 * @param linkId
 * @returns {Promise<<number>>}
 */
const deleteSingleIteTaoBaoByBatchIdAndLinkId = async (batchId, linkId) => {
    const result = await singleItemTaoBaoModel.destroy({
        where: {
            batchId,
            linkId: linkId.toString()
        }
    })
    return result
}


function getDaysInRange(start, end) {
    // 使用 Moment.js 解析日期字符串
    const startDate = moment(start, 'YYYY-MM-DD HH:mm:ss');
    const endDate = moment(end, 'YYYY-MM-DD HH:mm:ss');

    // 计算日期范围内的天数
    return endDate.diff(startDate, 'days') + 1;
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
 * @param linkHierarchies
 * @param linkStatus 链接状态
 * @param fightingLinkIds
 * @param timeRange 时间区间
 * @param clickingAdditionalParams
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


    let one = timeRange[0];
    let to = timeRange[1]
    let startDateTime = new Date(one);
    let endDateTime = new Date(to);
    const daysInRange = getDaysInRange(one, to);

    const where = {date: {$between: [startDateTime, endDateTime]}}

    if (Array.isArray(errorItems) && errorItems.length > 0) {
        if ((errorItems[0].lessThan === "negative_profit_60")) {
            if (daysInRange === 1) {
                startDateTime.setDate(startDateTime.getDate() - 7);
                endDateTime = new Date(to);
            }
            singleItemTaoBaoModel.belongsTo(ABbnormal_TM, {
                foreignKey: 'linkId',
                targetKey: 'linkId'
            });
            singleItemTaoBaoModel.belongsTo(ItemInfoModel, {
                foreignKey: 'linkId',
                targetKey: 'itemId'
            });

            const query = {
                include: [
                    {
                        model: ABbnormal_TM,
                        required: true,
                        where: {
                            [Op.and]: sequelize.literal("`singleItemTaobaoModel`.`date` = `ABbnormal_TM`.`date`") // 添加这个条件
                        },
                        as: 'ABbnormal_TM',
                        attributes: []  // 只返回这些字段'id', 'new_16_30', 'new_30_60', 'negative_profit_60', 'old'
                    },
                    {
                        model: ItemInfoModel,
                        required: true,
                        where: {
                            listingDate: {
                                [Op.lt]: sequelize.literal('DATE_SUB(CURDATE(), INTERVAL 60 DAY)')
                            }
                        },
                        as: 'ItemInfoModel',
                        attributes: []  // 不返回任何字段
                    }
                ],
                attributes: [
                    [sequelize.fn('GROUP_CONCAT', sequelize.fn('DISTINCT', sequelize.col('singleItemTaobaoModel.id'))), 'id'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.profit_amount')), 'profit_amount'],
                    [sequelize.fn('GROUP_CONCAT', sequelize.fn('DISTINCT', sequelize.col('singleItemTaobaoModel.product_name'))), 'productName'],
                    [sequelize.col('singleItemTaobaoModel.link_id'), 'linkId'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.pay_amount')), 'payAmount'],
                    [sequelize.fn('GROUP_CONCAT', sequelize.fn('DISTINCT', sequelize.col('singleItemTaobaoModel.operation_leader'))), 'operationLeader'],
                    [sequelize.fn('GROUP_CONCAT', sequelize.fn('DISTINCT', sequelize.col('singleItemTaobaoModel.product_line_leader'))), 'productLineLeader'],
                    [sequelize.fn('GROUP_CONCAT', sequelize.fn('DISTINCT', sequelize.col('singleItemTaobaoModel.purchase_leader'))), 'purchaseLeader'],
                    [sequelize.fn('GROUP_CONCAT', sequelize.fn('DISTINCT', sequelize.col('singleItemTaobaoModel.shop_name'))), 'shopName'],
                    [sequelize.fn('GROUP_CONCAT', sequelize.fn('DISTINCT', sequelize.col('singleItemTaobaoModel.link_type'))), 'linkType'],
                    [sequelize.fn('GROUP_CONCAT', sequelize.fn('DISTINCT', sequelize.col('singleItemTaobaoModel.first_level_item'))), 'firstLevelItem'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.shou_tao_visitors')), 'shouTaoVisitors'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.shou_tao_buyers')), 'shouTaoBuyers'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.shou_tao_really_conversion_rate')), 'shouTaoReallyConversionRate'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.profit_rate')), 'profitRate'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.visitors')), 'visitors'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.paid_buyers')), 'paidBuyers'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.sum_shopping_cart')), 'sumShoppingCart'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.shopping_cart_click_amount')), 'shoppingCartClickAmount'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.shopping_cart_sum_click')), 'shoppingCartSumClick'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.shopping_cart_conversion')), 'shoppingCartConversion'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.shopping_cart_sum_amount')), 'shoppingCartSumAmount'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.shopping_cat_sum_roi')), 'shoppingCatSumRoi'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.pay_conversion_rate')), 'payConversionRate'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.really_deal_rate')), 'reallyDealRate'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.deduction_point')), 'deductionPoint'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.ju_bai_cost')), 'juBaiCost'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.click_farming_amount')), 'clickFarmingAmount'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.click_farming_count')), 'clickFarmingCount'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.really_paid_amount')), 'reallyPaidAmount'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.refund')), 'refund'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.really_shipment_amount')), 'reallyShipmentAmount'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.cost')), 'cost'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.freight')), 'freight'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.shou_tao_people_num_market_rate')), 'shouTaoPeopleNumMarketRate'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.sales_market_rate')), 'salesMarketRate'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.shou_tao_people_num_market_rate_circle_rate_day')), 'shouTaoPeopleNumMarketRateCircleRateDay'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.sales_market_rate_circle_rate_day')), 'salesMarketRateCircleRateDay'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.shou_tao_people_num_market_rate_circle_rate_7day')), 'shouTaoPeopleNumMarketRateCircleRate7Day'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.sales_market_rate_circle_rate_7day')), 'salesMarketRateCircleRate7Day'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.shou_tao_people_num_market_rate_circle_rate_30day')), 'shouTaoPeopleNumMarketRateCircleRate30Day'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.sales_market_rate_circle_rate_30day')), 'salesMarketRateCircleRate30Day'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.brand_first_buy_sum_amount')), 'brandFirstBuySumAmount'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.xiao_hong_shu_refund')), 'xiaoHongShuRefund'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.accurate_people_promotion_cost')), 'accuratePeoplePromotionCost'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.accurate_people_promotion_production_rate')), 'accuratePeoplePromotionProductionRate'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.wan_xiang_tai_cost')), 'wanXiangTaiCost'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.wan_xiang_tai_production_rate')), 'wanXiangTaiProductionRate'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.fee_rate')), 'feeRate'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.cart_sum_payment')), 'cartSumPayment'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.accurate_people_sum_payment')), 'accuratePeopleSumPayment'],
                    [sequelize.fn('SUM', sequelize.col('singleItemTaobaoModel.wan_xiang_tai_sum_payment')), 'wanXiangTaiSumPayment'],
                    [sequelize.fn('GROUP_CONCAT', sequelize.fn('DISTINCT', sequelize.col('singleItemTaobaoModel.link_hierarchy'))), 'linkHierarchy'],
                ],

                group: [
                    'singleItemTaobaoModel.link_id',
                ],
                order: [
                    [sequelize.col('singleItemTaobaoModel.link_id'), 'ASC'],
                ],
                where: {
                    link_type: {
                        [Op.in]: ['老品', '新品150', '新品90']
                    },
                    //and singleItemTaobaoModel.batch_id between  '2024-05-10' and '2024-05-16'
                    batch_id: {$between: [startDateTime, endDateTime]},
                    productLineLeader: {
                        [Op.in]: productLineLeaders,
                    }
                },
                having: sequelize.literal("SUM(singleItemTaobaoModel.profit_amount) < 0"),
                offset: pageIndex * pageSize,
                limit: pageSize,
                logging: true,
            };
// 执行查询
            let result = await singleItemTaoBaoModel.findAndCountAll(query)

            // for (let i = 0; i < result.length; i++) {
            //    console.log(result[i])
            // }
            //  console.log('?',result.count)
            return pagingUtil.paging(Math.ceil(result.count.length / pageSize), result.count.length, result.rows)
        }
    }

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
            if (errorItem.sqlValue) {
                where[errorItem.field] = {[errorItem.operator]: errorItem.sqlValue}
            } else {
                // console.log("到异常的条件",where)
                // 这个异常 需要进行条件查询
                if (errorItem.field === "profitRate") {
                    abnormalWhere[errorItem.lessThan] = "true"
                    where[errorItem.field] = {[errorItem.operator]: errorItem.value}
                }
                //手淘人数市场占比环比（7天）下降
                if (errorItem.field === "shouTaoPeopleNumMarketRateCircleRate7Day") {
                    where["salesMarketRateCircleRate7Day"] = {"$ne": errorItem.value}
                }
                //坑市场占比环比（7天）下降
                if (errorItem.field === "salesMarketRateCircleRate7Day") {
                    where["shouTaoPeopleNumMarketRateCircleRate7Day"] = {"$gt": errorItem.value}
                }

                //手淘人数市场占比环比（日）下降
                if (errorItem.field === "shouTaoPeopleNumMarketRateCircleRateDay") {
                    where["salesMarketRateCircleRateDay"] = {"$ne": errorItem.value}
                }
                //坑市场占比环比（日天）下降
                if (errorItem.field === "salesMarketRateCircleRateDay") {
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
                '$singleItemTaoBaoModel.date$': {[Sequelize.Op.eq]: Sequelize.col('ABbnormal_TM.date')},
                '$singleItemTaoBaoModel.link_id$': {[Sequelize.Op.eq]: Sequelize.col('ABbnormal_TM.link_id')}
            },
            where: abnormalWhere
        }],
        offset: pageIndex * pageSize,
        limit: pageSize,
        where,
        // order: [["linkId", "asc"], ["date", "asc"]],
        order: [["date", "asc"]],
        logging: true,
        group: ['singleItemTaoBaoModel.date', 'singleItemTaoBaoModel.id', 'ABbnormal_TM.new_16_30', 'ABbnormal_TM.new_30_60', 'ABbnormal_TM.negative_profit_60', 'ABbnormal_TM.old'],
    })
    result.rows = result.rows.map(function (item) {
        return item.get({plain: true})
    })
    //console.log(result.count.length)

    // pagingUtil.paging(Math.ceil(result.count / pageSize), result.count, result.rows)  result.count 为总数
    return pagingUtil.paging(Math.ceil(result.count.length / pageSize), result.count.length, result.rows)
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


// 异常项累计60天负利润
const getError60SingleIte = async (productLineLeaders, timeRange) => {
    let one = timeRange[0];
    let to = timeRange[1]
    let startDateTime = new Date(one);
    let endDateTime = new Date(to);
    const daysInRange = getDaysInRange(one, to);
    if (daysInRange === 1) {
        startDateTime.setDate(startDateTime.getDate() - 7);
        endDateTime = new Date(to);

    }

    return singleItemTaoBaoModel.sequelize.query(
        `SELECT   link_id AS link_id, product_name
FROM (
  SELECT singleItemTaobaoModel.link_id,singleItemTaobaoModel.product_name
  FROM single_item_taobao AS singleItemTaobaoModel
  INNER JOIN abnormal_tm AS ABbnormal_TM
  ON singleItemTaobaoModel.date = ABbnormal_TM.date
  AND singleItemTaobaoModel.link_id = ABbnormal_TM.link_id
  AND (singleItemTaobaoModel.link_type='老品'  or singleItemTaobaoModel.link_type='新品150' or singleItemTaobaoModel.link_type='新品90')
  INNER JOIN item_info AS ItemInfoModel
  ON singleItemTaobaoModel.link_id = ItemInfoModel.itemId
  AND DATEDIFF(CURRENT_DATE, ItemInfoModel.上架日期) > 60
  WHERE singleItemTaobaoModel.product_line_leader in (:productLineLeaders)
  and singleItemTaobaoModel.batch_id between :startDateTime and :endDateTime
  GROUP BY singleItemTaobaoModel.link_id,singleItemTaobaoModel.product_name
  HAVING SUM(singleItemTaobaoModel.profit_amount) < 0
) AS subquery;`, {
            replacements: {productLineLeaders, startDateTime, endDateTime},
            type: QueryTypes.SELECT,
            logging: false
        }
    );
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
    return sequelizeUtil.extractDataValues(singleItems)
}


/**
 * 获取单品表详情
 * @param id
 * @returns {Promise<*|[]|null>}
 */
const getSingleItemById = async (id) => {
    const singleItem = await singleItemTaoBaoModel.findAll({
        where: {
            id: {
                [Op.in]: id
            }
        },
        logging: false

    })
    if (singleItem && singleItem.length > 0) {
        return sequelizeUtil.extractDataValues(singleItem)
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

// 更新自定义1字段 内容
// const updateCustom1 = async (id, custom1) => {
const updateCustom = async (id, custom) => {

    return singleItemTaoBaoModel.sequelize.query(
        `update  single_item_taobao set user_def_1=:id where link_id in (
select goods_id from  dianshang_operation_attribute where userDef1=:custom
);`, {
            replacements: {id, custom},
            type: QueryTypes.UPDATE,
            logging: false
        }
    );

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
    getLinkHierarchy,
    updateSingleItemTaoBao,
    getError60SingleIte,
    updateCustom
}