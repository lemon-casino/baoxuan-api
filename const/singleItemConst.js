const linkTypeConst = require("../const/linkTypeConst")

const taoBaoSingleItemMap = {
    "batchId": "批次号",
    "productName": "产品名称",
    "linkId": "链接ID",
    "operationLeader": "运营负责人",
    "productLineLeader": "产品线负责人",
    "purchaseLeader": "采购负责人",
    "shopName": "店铺名称",
    "linkType": "链接属性",
    "date": "日期",
    "firstLevelItem": "一级类目",
    "payAmount": "支付金额",
    "shouTaoVisitors": "手淘搜索访客数",
    "shouTaoBuyers": "手淘搜索买家数",
    "shouTaoReallyConversionRate": "手淘真转率",
    "profitAmount": "利润额",
    "profitRate": "利润率",
    "visitors": "访客数",
    "paidBuyers": "支付买家数",
    "sumShoppingCart": "总购物车数",
    "shoppingCartClickAmount": "车点击量",
    "shoppingCartSumClick": "车总点击率",
    "shoppingCartConversion": "车转化",
    "shoppingCartSumAmount": "车总花费",
    "shoppingCatSumRoi": "车总投产比",
    "payConversionRate": "支付转化率",
    "reallyDealRate": "真实成交率",
    "deductionPoint": "扣点",
    "juBaiCost": "聚百花费",
    "clickFarmingAmount": "刷单金额",
    "clickFarmingCount": "刷单金笔数",
    "reallyPaidAmount": "实际支付金额",
    "refund": "退款",
    "reallyShipmentAmount": "实际发货金额",
    "cost": "成本",
    "freight": "运费",
    "shouTaoPeopleNumMarketRate": "手淘人数市场占比",
    "salesMarketRate": "坑产市场占比",
    "shouTaoPeopleNumMarketRateCircleRateDay": "手淘人数市场占比环比（日）",
    "salesMarketRateCircleRateDay": "坑市场占比环比（日）",
    "shouTaoPeopleNumMarketRateCircleRate7day": "手淘人数市场占比环比（7天）",
    "salesMarketRateCircleRate7day": "坑市场占比环比（7天）",
    "shouTaoPeopleNumMarketRateCircleRate30day": "手淘人数市场占比环比（30天）",
    "salesMarketRateCircleRate30day": "坑市场占比环比（30天）",
    "brandFirstBuySumAmount": "品牌新享费用合计",
    "xiaoHongShuRefund": "小红书返款",
    "accuratePeoplePromotionCost": "精准人群推广花费",
    "accuratePeoplePromotionProductionRate": "精准人群推广投产比",
    "wanXiangTaiCost": "万相台花费",
    "wanXiangTaiProductionRate": "万相台投产比",
    "feeRate": "费用比例",
    "cartSumPayment": "车总支付",
    "wanXiangTaiSumPayment": "万相台总支付",
    "accuratePeopleSumPayment": "精准人群总支付"
}

// 费比超过15仅统计老品(格式不好！要兼顾eval调用和数据库的条件判断，数据库的同一个field只能保留一份)
const newItems = linkTypeConst.groups.filter(group => group.group === "new")[0].items
const oldProductFields = newItems.map(item => {
    return {
        field: "linkType", operator: "$notIn", comparator: "!==",
        value: item, sqlValue: newItems
    }
})

const oldItems = linkTypeConst.groups.filter(group => group.group === "old")[0].items
const newProductFields = oldItems.map(item => {
    return {
        field: "linkType", operator: "$notIn", comparator: "!==",
        value: item, sqlValue: oldItems
    }
})
const taoBaoErrorItems = [
    {
        name: "老品利润率低于15%",
        values: [{field: "profitRate", operator: "$lt",lessThan:"old", value: "15", comparator: "<"}]
    },
    {
        name: "新品利润率低于5%",
        values: [{field: "profitRate", operator: "$lt", lessThan:"new_16_30", value: "5", comparator: "<"}]
    },
    {
        name: "新品利润率低于10%",
        values: [{field: "profitRate", operator: "$lt", lessThan:"new_30_60", value: "10", comparator: "<"}]
    },
    {
        name: "累计60天负利润",
        values: [{field: "profitRate", operator: "$lt",lessThan:"negative_profit_60", value: "0", comparator: "<"}]
    },
    // {
    //     name: "手淘人数市场占比环比（7天）下降",
    //     values: [{field: "shouTaoPeopleNumMarketRateCircleRate7Day", operator: "$lt", value: "-20", comparator: "<"}]
    // },
    // {
    //     name: "坑市场占比环比（7天）下降",
    //     values: [{field: "salesMarketRateCircleRate7Day", operator: "$gt", value: "-20", comparator: ">"}]
    // },
    {
        name: "手淘人数市场占比环比（日）下降",
        values: [{field: "shouTaoPeopleNumMarketRateCircleRateDay", operator: "$lt", value: "-20", comparator: "<"}]
    },
    {
        name: "坑市场占比环比（日）",
        values: [{field: "salesMarketRateCircleRateDay", operator: "$lt", value: "-20", comparator: "<"}]
    },
    // {
    //     name: "手淘人数市场占比环比（30天）下降",
    //     values: [{field: "shouTaoPeopleNumMarketRateCircleRate30Day", operator: "$lt", value: "-20", comparator: "<"}]
    // },
    // 坑市场占比环比（日、7天、30天）低于20%
    // {
    //     name: "坑市场占比环比（日）下降",
    //     values: [{field: "salesMarketRateCircleRateDay", operator: "$lt", value: "-20", comparator: "<"}]
    // },

    // {
    //     name: "坑市场占比环比（30天）下降",
    //     values: [{field: "salesMarketRateCircleRate30Day", operator: "$lt", value: "-20", comparator: "<"}]
    // },
    // 投产低于2
    {
        name: "车总投产比低于2",
        values: [{
            field: "shoppingCatSumRoi",
            operator: "$between",
            sqlValue: [0.000001, 1.99999],
            value: 2,
            comparator: "<",
            min: "0.000001",
        }]
    },
    {
        name: "精准人群推广投产比低于2",
        values: [{
            field: "accuratePeoplePromotionProductionRate",
            operator: "$between",
            sqlValue: [0.000001, 1.99999],
            value: 2,
            comparator: "<",
            min: "0.000001"
        }]
    },
    {
        name: "万相台投产比低于2",
        values: [{
            field: "wanXiangTaiProductionRate",
            operator: "$between",
            sqlValue: [0.000001, 1.99999],
            value: 2,
            comparator: "<",
            min: "0.000001"
        }]
    },
    // 新品日搜索流量低于100，上架14天新品搜索目标达成30%以下(还未确定，找一个无法筛选出数据的条件)
    {
        name: "流量未起", values: [{
            field: "feeRate",
            operator: "$eq",
            value: "99999",
            comparator: "==="
        }]
    },
    {
        name: "费比超过15%",
        values: [{
            field: "feeRate",
            operator: "$gt",
            value: "15",
            comparator: ">"
        }].concat(oldProductFields)
    }
]

const taoBaoSingleItemStatuses = [{name: "fighting", value: "打仗"}, {name: "normal", value: "正常"}]
const taoBaoSingleItemStatusesKeys = {"fighting": "fighting", "normal": "normal"}

const profitRateRangeSumTypes = [
    {type: "新品", name: "新品25%及以上", range: [25, 999999]},
    {type: "新品", name: "新品20%-25%", range: [20, 24.999999]},
    {type: "新品", name: "新品15%-20%", range: [15, 19.999999]},
    {type: "新品", name: "新品10%-15%", range: [10, 14.999999]},
    {type: "新品", name: "新品6%-10%", range: [6, 9.999999]},
    {type: "新品", name: "新品0%-6%", range: [0, 5.999999]},
    {type: "新品", name: "新品0%以下", range: [-999999, -0.0000001]},// 0以下
    {type: "老品", name: "老品50%以上", range: [50, 9999999]},
    {type: "老品", name: "老品40%-50%", range: [40, 49.999999]},
    {type: "老品", name: "老品35%-40%", range: [35, 39.999999]},
    {type: "老品", name: "老品30%-35%", range: [30, 34.999999]},
    {type: "老品", name: "老品25%-30%", range: [25, 29.999999]},
    {type: "老品", name: "老品20%-25%", range: [20, 24.999999]},
    {type: "老品", name: "老品15-20%", range: [15, 19.999999]},
    {type: "老品", name: "老品9%-15%", range: [9, 14.999999]},
    {type: "老品", name: "老品9%以下", range: [-999999, 8.999999]}, // 9以下
]

const marketRatioGroup = [
    {type: "salesRateNormal", name: "坑产占比正常", item: {name: "0-9%", range: [0, 8.999999], field: "salesMarketRate"}},
    {type: "salesRateUp", name: "坑产占比提升", item: {name: "50%及以上", range: [50, 999999], field: "salesMarketRate"}},
    {type: "salesRateUp", name: "坑产占比提升", item: {name: "40%-50%", range: [40, 49.999999], field: "salesMarketRate"}},
    {type: "salesRateUp", name: "坑产占比提升", item: {name: "30-40%", range: [30, 39.999999], field: "salesMarketRate"}},
    {type: "salesRateUp", name: "坑产占比提升", item: {name: "20%-30%", range: [20, 29.999999], field: "salesMarketRate"}},
    {type: "salesRateUp", name: "坑产占比提升", item: {name: "9%-20%", range: [9, 19.999999], field: "salesMarketRate"}},
    {type: "salesRateDown", name: "坑产占比下降", item: {name: "-10%-0", range: [-10, -0.000001], field: "salesMarketRate"}},
    {
        type: "salesRateDown",
        name: "坑产占比下降",
        item: {name: "-19%--10%", range: [-19, -10.000001], field: "salesMarketRate"}
    },
    {
        type: "salesRateDown",
        name: "坑产占比下降",
        item: {name: "-29%--19%", range: [-29, -19.000001], field: "salesMarketRate"}
    },
    {
        type: "flowRateNormal",
        name: "流量占比正常",
        item: {name: "0-10%", range: [0, 9.999999], field: "shouTaoPeopleNumMarketRateCircleRate7Day"}
    },
    {
        type: "flowRateUp",
        name: "流量占比提升",
        item: {name: "50%及以上", range: [50, 999999], field: "shouTaoPeopleNumMarketRateCircleRate7Day"}
    },
    {
        type: "flowRateUp",
        name: "流量占比提升",
        item: {name: "40%-50%", range: [40, 49.999999], field: "shouTaoPeopleNumMarketRateCircleRate7Day"}
    },
    {
        type: "flowRateUp",
        name: "流量占比提升",
        item: {name: "30-40%", range: [30, 39.999999], field: "shouTaoPeopleNumMarketRateCircleRate7Day"}
    },
    {
        type: "flowRateUp",
        name: "流量占比提升",
        item: {name: "20%-30%", range: [20, 29.999999], field: "shouTaoPeopleNumMarketRateCircleRate7Day"}
    },
    {
        type: "flowRateUp",
        name: "流量占比提升",
        item: {name: "10%-20%", range: [10, 19.999999], field: "shouTaoPeopleNumMarketRateCircleRate7Day"}
    },
    {
        type: "flowRateDown",
        name: "流量占比下降",
        item: {name: "-10%-0", range: [-10, 0.000001], field: "shouTaoPeopleNumMarketRateCircleRate7Day"}
    },
    {
        type: "flowRateDown",
        name: "流量占比下降",
        item: {name: "-20%--10%", range: [-20, -10.000001], field: "shouTaoPeopleNumMarketRateCircleRate7Day"}
    },
    {
        type: "flowRateDown",
        name: "流量占比下降",
        item: {name: "-29%--20%", range: [-29, -20.000001], field: "shouTaoPeopleNumMarketRateCircleRate7Day"}
    }
]

const fieldsWithPercentageTag = [
    "shoppingCatSumRoi","accuratePeoplePromotionProductionRate", "wanXiangTaiProductionRate"
]

module.exports = {
    taoBaoSingleItemMap,
    taoBaoErrorItems,
    taoBaoSingleItemStatuses,
    taoBaoSingleItemStatusesKeys,
    profitRateRangeSumTypes,
    marketRatioGroup,
    fieldsWithPercentageTag
}