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
    "wanXiangTaiProductionRate": "万相台投产比"
}

const taoBaoErrorItems = [
    {name: "利润率低于15%", value: {filed: "profitRate", operator: "$lt", value: "15"}},
    // 手淘人数市场占比环比（日、7天、30天）
    {
        name: "手淘人数市场占比环比（日）下降",
        value: {filed: "shouTaoPeopleNumMarketRateCircleRateDay", operator: "$lt", value: "20"}
    },
    {
        name: "手淘人数市场占比环比（7天）下降",
        value: {filed: "shouTaoPeopleNumMarketRateCircleRate7day", operator: "$lt", value: "20"}
    },
    {
        name: "手淘人数市场占比环比（30天）下降",
        value: {filed: "shouTaoPeopleNumMarketRateCircleRate30day", operator: "$lt", value: "20"}
    },
    // 坑市场占比环比（日、7天、30天）低于20%
    {name: "坑市场占比环比（日）下降", value: {filed: "salesMarketRateCircleRateDay", operator: "$lt", value: "20"}},
    {name: "坑市场占比环比（7天）下降", value: {filed: "salesMarketRateCircleRate7day", operator: "$lt", value: "20"}},
    {name: "坑市场占比环比（30天）下降", value: {filed: "salesMarketRateCircleRate30day", operator: "$lt", value: "20"}},
    // 投产低于2
    {name: "车总投产比低于2", value: {filed: "shoppingCatSumRoi", operator: "$lt", value: "2"}},
    {name: "精准人群推广投产比低于2", value: {filed: "accuratePeoplePromotionProductionRate", operator: "$lt", value: "2"}},
    {name: "万相台投产比低于2", value: {filed: "wanXiangTaiProductionRate", operator: "$lt", value: "2"}},
    // 新品日搜索流量低于100，上架14天新品搜索目标达成30%以下
    {name: "流量未起", value: {filed: "", operator: "", value: ""}},

    {name: "新品负利率", value: {filed: "", operator: "", value: ""}},
    {name: "费比超过15%", value: {filed: "", operator: "", value: ""}}
]

const taoBaoSingleItemStatuses = ["打仗", "正常"]

module.exports = {
    taoBaoSingleItemMap,
    taoBaoErrorItems
}