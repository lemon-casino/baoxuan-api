const {
  DataTypes
} = require('sequelize');
module.exports = sequelize => {
  const attributes = {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: true,
      comment: "自增ID",
      field: "id"
    },
    code: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "",
      primaryKey: false,
      autoIncrement: false,
      comment: "编码",
      field: "code"
    },
    sku: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "",
      primaryKey: false,
      autoIncrement: false,
      comment: "SKU",
      field: "sku"
    },
    reportTime: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      primaryKey: false,
      autoIncrement: false,
      comment: "时间",
      field: "report_time"
    },
    brand: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "",
      primaryKey: false,
      autoIncrement: false,
      comment: "品牌",
      field: "brand"
    },
    operationsLeader: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "",
      primaryKey: false,
      autoIncrement: false,
      comment: "运营负责人",
      field: "operations_leader"
    },
    listingDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "上架日期",
      field: "listing_date"
    },
    listingInfo: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "上架信息",
      field: "listing_info"
    },
    visitors: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "0",
      primaryKey: false,
      autoIncrement: false,
      comment: "访客数",
      field: "visitors"
    },
    buyers: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "0",
      primaryKey: false,
      autoIncrement: false,
      comment: "成交人数",
      field: "buyers"
    },
    conversionRate: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: "0.00",
      primaryKey: false,
      autoIncrement: false,
      comment: "成交转化率 (%)",
      field: "conversion_rate"
    },
    transactionItems: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "0",
      primaryKey: false,
      autoIncrement: false,
      comment: "成交商品件数",
      field: "transaction_items"
    },
    transactionAmount: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: "0.00",
      primaryKey: false,
      autoIncrement: false,
      comment: "成交金额",
      field: "transaction_amount"
    },
    transactionPerCustomer: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: "0.00",
      primaryKey: false,
      autoIncrement: false,
      comment: "成交客单价",
      field: "transaction_per_customer"
    },
    unitCost: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: "0.00",
      primaryKey: false,
      autoIncrement: false,
      comment: "单位成本",
      field: "unit_cost"
    },
    supplyPrice: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: "0.00",
      primaryKey: false,
      autoIncrement: false,
      comment: "供货价",
      field: "supply_price"
    },
    dailyPromotion: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: "0.00",
      primaryKey: false,
      autoIncrement: false,
      comment: "日常推广",
      field: "daily_promotion"
    },
    scenePromotion: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: "0.00",
      primaryKey: false,
      autoIncrement: false,
      comment: "场景推广",
      field: "scene_promotion"
    },
    jdFastCar: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: "0.00",
      primaryKey: false,
      autoIncrement: false,
      comment: "京东快车推广",
      field: "jd_fast_car"
    },
    totalPromotion: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: "0.00",
      primaryKey: false,
      autoIncrement: false,
      comment: "推广合计",
      field: "total_promotion"
    },
    costRatio: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: "0.00",
      primaryKey: false,
      autoIncrement: false,
      comment: "费比 (%)",
      field: "cost_ratio"
    },
    totalCost: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: "0.00",
      primaryKey: false,
      autoIncrement: false,
      comment: "总成本",
      field: "total_cost"
    },
    totalSupplyPrice: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: "0.00",
      primaryKey: false,
      autoIncrement: false,
      comment: "总供货价",
      field: "total_supply_price"
    },
    grossMarginStandard: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: "0.00",
      primaryKey: false,
      autoIncrement: false,
      comment: "综毛标准 (%)",
      field: "gross_margin_standard"
    },
    actualGrossMargin: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: "0.00",
      primaryKey: false,
      autoIncrement: false,
      comment: "实际综毛 (%)",
      field: "actual_gross_margin"
    },
    requiredGrossMargin: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: "0.00",
      primaryKey: false,
      autoIncrement: false,
      comment: "需补综毛 (%)",
      field: "required_gross_margin"
    },
    taxRate: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: "0.00",
      primaryKey: false,
      autoIncrement: false,
      comment: "税点 (%)",
      field: "tax_rate"
    },
    profit: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: "0.00",
      primaryKey: false,
      autoIncrement: false,
      comment: "利润",
      field: "profit"
    },
    profitMarginSupplyPrice: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: "0.00",
      primaryKey: false,
      autoIncrement: false,
      comment: "利润率（供货价） (%)",
      field: "profit_margin_supply_price"
    },
    profitMarginGmv: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: "0.00",
      primaryKey: false,
      autoIncrement: false,
      comment: "利润率（GMV） (%)",
      field: "profit_margin_gmv"
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      primaryKey: false,
      autoIncrement: false,
      comment: "创建时间",
      field: "created_at"
    }
  };
  const options = {
    tableName: "jd_daily_report",
    comment: "",
    indexes: []
  };
  const JdDailyReportModel = sequelize.define("jdDailyReportModel", attributes, options);
  return JdDailyReportModel;
};