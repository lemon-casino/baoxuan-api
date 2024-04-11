const {
  DataTypes
} = require('sequelize');
module.exports = sequelize => {
  const attributes = {
    id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: false,
      comment: "主键id",
      field: "id"
    },
    batchId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "批次号",
      field: "batch_id"
    },
    shopName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "店名",
      field: "shop_name"
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "统计日期",
      field: "date"
    },
    linkId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "商品ID",
      field: "link_id"
    },
    productLine: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "产品线",
      field: "product_line"
    },
    forShort: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "简称",
      field: "for_short"
    },
    productLineLeader: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "产品线负责人",
      field: "product_line_leader"
    },
    operationLeader: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "运营负责人",
      field: "operation_leader"
    },
    purchaseLeader: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "采购负责人",
      field: "purchase_leader"
    },
    linkType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "链接属性",
      field: "link_type"
    },
    secondaryCategory: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "二级类目",
      field: "secondary_category"
    },
    firstLevelItem: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "一级类目",
      field: "first_level_item"
    },
    shelfDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "创建日期",
      field: "shelf_date"
    },
    listingInformation: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "上架信息",
      field: "listing_information"
    },
    productName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "商品名称",
      field: "product_name"
    },
    pageView: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "浏览量",
      field: "page_view"
    },
    pageViewsSequential: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "浏览量环比",
      field: "page_views_sequential"
    },
    promotionClick: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "推广点击",
      field: "promotion_click"
    },
    promotionClickProportion: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "推广点击占比",
      field: "promotion_click_proportion"
    },
    visitors: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "访客数",
      field: "visitors"
    },
    numberOfVisitorsSequential: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "访客数环比",
      field: "number_of_visitors_sequential"
    },
    freeVisitor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "免费访客",
      field: "free_visitor"
    },
    freeVisitorConversionRate: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "免费访客转化率",
      field: "free_visitor_conversion_rate"
    },
    paymentOrderNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "支付订单数",
      field: "payment_order_number"
    },
    paymentOrderNumberSequential: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "支付订单数环比",
      field: "payment_order_number_sequential"
    },
    paidOrderNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "付费订单数",
      field: "paid_order_number"
    },
    proportionOfPaidOrders: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "付费订单数占比",
      field: "proportion_of_paid_orders"
    },
    freeTrafficOrderNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "免费流量订单数",
      field: "free_traffic_order_number"
    },
    numberOfPaidBuyers: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "支付买家数",
      field: "number_of_paid_buyers"
    },
    numberOfPaidBuyersSequential: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "支付买家数环比",
      field: "number_of_paid_buyers_sequential"
    },
    paymentAmount: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "支付金额",
      field: "payment_amount"
    },
    paymentAmountSequential: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "支付金额环比",
      field: "payment_amount_sequential"
    },
    promotionPayment: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "推广支付",
      field: "promotion_payment"
    },
    proportionPromotionPayment: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "推广支付占比",
      field: "proportion_promotion_payment"
    },
    paymentConversionRate: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "支付转化率",
      field: "payment_conversion_rate"
    },
    sequentialPaymentConversionRate: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "支付转化率环比",
      field: "sequential_payment_conversion_rate"
    },
    successfulRefundAmount: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "成功退款金额",
      field: "successful_refund_amount"
    },
    promotionCost: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "推广花费",
      field: "promotion_cost"
    },
    promoteRatioCostOutputInvestment: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "推广花费产投比",
      field: "promote_ratio_cost_output_investment"
    },
    promotionCostChain: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "推广花费环比",
      field: "promotion_cost_chain"
    },
    shuaDanJinE: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "刷单金额",
      field: "shua_dan_jin_e"
    },
    shuaDanBiShu: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "刷单笔数",
      field: "shua_dan_bi_shu"
    },
    dropValue: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "发货减退金额",
      field: "drop_value"
    },
    shippingLapseCost: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "发货减退成本",
      field: "shipping_lapse_cost"
    },
    postage: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "物流费",
      field: "postage"
    },
    billingCharge: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "账单费用",
      field: "billing_charge"
    },
    profit: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "利润",
      field: "profit"
    },
    profitRate: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "利润率",
      field: "profit_rate"
    },
    kengChanMuBiao: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "坑产目标",
      field: "keng_chan_mu_biao"
    },
    quanZhanBaoGuang: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "全站曝光",
      field: "quan_zhan_bao_guang"
    },
    quanZhanDianJi: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "全站点击",
      field: "quan_zhan_dian_ji"
    },
    quanZhanDianJiLv: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "全站点击率",
      field: "quan_zhan_dian_ji_lv"
    },
    quanZhanDingDan: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "全站订单",
      field: "quan_zhan_ding_dan"
    },
    quanZhanHuaFei: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "全站花费",
      field: "quan_zhan_hua_fei"
    },
    biaoZhunBaoGuang: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "标准曝光",
      field: "biao_zhun_bao_guang"
    },
    biaoZhunDianJi: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "标准点击",
      field: "biao_zhun_dian_ji"
    },
    biaoZhunDianJiLv: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "标准点击率",
      field: "biao_zhun_dian_ji_lv"
    },
    biaoZhunDingDan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "标准订单",
      field: "biao_zhun_ding_dan"
    },
    biaoZhunHuaFei: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "标准花费",
      field: "biao_zhun_hua_fei"
    },
    createTime: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "创建时间",
      field: "create_time"
    }
  };
  const options = {
    tableName: "single_item_pdd",
    comment: "",
    indexes: [{
      name: "suoyin",
      unique: false,
      type: "BTREE",
      fields: ["batch_id", "date"]
    }]
  };
  const SingleItemPddModel = sequelize.define("singleItemPddModel", attributes, options);
  return SingleItemPddModel;
};