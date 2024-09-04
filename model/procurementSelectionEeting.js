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
      comment: "主键id",
      field: "id"
    },
    processInstanceId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "实例化ID",
      field: "processInstanceId",
      unique: "processInstanceIdIndex"
    },
    originator: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "发起人",
      field: "originator"
    },
    productName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "产品名称",
      field: "productName"
    },
    vendorName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "供应商名称",
      field: "vendorName"
    },
    selectionAttributes: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "选品属性",
      field: "selectionAttributes"
    },
    duration: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "工期",
      field: "duration"
    },
    productAttributes: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "产品属性",
      field: "productAttributes"
    },
    patentOwnership: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "专利归属",
      field: "patentOwnership"
    },
    optimizationSuggestions: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "优化建议",
      field: "optimizationSuggestions"
    },
    pushProductLine: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "推品产品线",
      field: "pushProductLine"
    },
    creationTime: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "创建时间",
      field: "creationTime"
    },
    updated: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "更新时间",
      field: "updated"
    },
    completionTime: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "完成-结束时间",
      field: "completionTime"
    },
    designDefinition: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "设计款定义",
      field: "designDefinition"
    },
    headOfOperations: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "运营负责人",
      field: "headOfOperations"
    },
    headOfThePlatform: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "平台负责人",
      field: "headOfThePlatform"
    },
    platform: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "平台",
      field: "platform"
    },
    marketAnalysis: {
      type: DataTypes.CHAR(4),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "市场分析",
      field: "marketAnalysis"
    },
    selectionDataSource: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "选品数据来源",
      field: "selectionDataSource"
    },
    costIsSelected: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "成本选中",
      field: "costIsSelected"
    },
    estimatedSales: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "预估销量",
      field: "estimatedSales"
    },
    reasonForRejection: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "拒绝原因",
      field: "reasonForRejection"
    },
    moq: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "起订量",
      field: "moq"
    },
    preEncoded: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "预编码",
      field: "preEncoded"
    },
    headOfTmallOperations: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "天猫运营负责人",
      field: "headOfTmallOperations"
    },
    counterElectTheHeadOfOperations: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "反选运营负责人",
      field: "counterElectTheHeadOfOperations"
    },
    headOfJdComOperations: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "京东运营负责人",
      field: "headOfJDComOperations"
    },
    headOfTmallSupermarketOperations: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "天猫超市运营负责人",
      field: "headOfTmallSupermarketOperations"
    },
    headOfOperationsAtAmoyFactory: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "淘工厂运营负责人",
      field: "headOfOperationsAtAmoyFactory"
    },
    gainHeadOfOperationsAtVipshop: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "得物、唯品会运营负责人",
      field: "gainHeadOfOperationsAtVipshop"
    },
    tmallVerticalStoreXiaohongshuOperationLeader: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "天猫垂类店、小红书运营负责人",
      field: "tmallVerticalStoreXiaohongshuOperationLeader"
    },
    headOfOperationsAtCoupang: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "Coupang运营负责人",
      field: "headOfOperationsAtCoupang"
    },
    douyinHeadOfKuaishouOperations: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "抖音、快手运营负责人",
      field: "douyinHeadOfKuaishouOperations"
    },
    headOfOperationsOf1688: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "1688运营负责人",
      field: "headOfOperationsOf1688"
    },
    whetherTmallIsSelected: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "天猫运营成本是否选中",
      field: "whetherTmallIsSelected"
    },
    whetherJdIsSelected: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "京东运营成本是否选中",
      field: "whetherJDIsSelected"
    },
    pinduoduoIsSelected: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "拼多多运营成本是否选中",
      field: "pinduoduoIsSelected"
    },
    whetherTmallSupermarketIsSelected: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "天猫超市运营成本是否选中",
      field: "whetherTmallSupermarketIsSelected"
    },
    whetherTheTaoFactoryIsSelected: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "radioField_lxn4uin0",
      field: "whetherTheTaoFactoryIsSelected"
    },
    dewuVipshopWillBeSelected: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "淘工厂运营成本是否选中",
      field: "dewuVipshopWillBeSelected"
    },
    tmallVerticalStoreXiaohongshuIsSelected: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "天猫垂类店、小红书运营成本是否选中",
      field: "tmallVerticalStoreXiaohongshuIsSelected"
    },
    whetherOrNotCoupangIsSelected: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "Coupang运营成本是否选中",
      field: "whetherOrNotCoupangIsSelected"
    },
    douyinKuaishouIsSelected: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "抖音、快手运营成本是否选中",
      field: "douyinKuaishouIsSelected"
    },
    uncheckedAlibaba: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "1688运营成本是否选中",
      field: "uncheckedAlibaba"
    },
    whetherToChooseTheJdOperationSample: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "京东运营样品是否选中",
      field: "whetherToChooseTheJDOperationSample"
    },
    whetherTheTmallOperationSampleIsSelected: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "天猫运营样品是否选中",
      field: "whetherTheTmallOperationSampleIsSelected"
    },
    whetherThePinduoduoOperationSampleIsSelected: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "拼多多运营样品是否选中",
      field: "whetherThePinduoduoOperationSampleIsSelected"
    },
    tmallSupermarketOperationSampleIsNotSelected: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "天猫超市运营样品是否选中",
      field: "tmallSupermarketOperationSampleIsNotSelected"
    },
    taoFactorOperationSampleWhetherChoose: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "淘工厂运营样品是否选中",
      field: "TaoFactorOperationSampleWhetherChoose"
    },
    gainsVipshopWhetherToChooseTheOperationSample: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "得物、唯品会运营样品是否选中",
      field: "gainsVipshopWhetherToChooseTheOperationSample"
    },
    tmallVerticalStoreLittleRedBook: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "天猫垂类店、小红书运营样品是否选中",
      field: "tmallVerticalStoreLittleRedBook"
    },
    coupangOperationSampleIsSelected: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "Coupang运营样品是否选中",
      field: "coupangOperationSampleIsSelected"
    },
    tikTokWhetherTheKuaishouOperationSampleIsSelected: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "抖音、快手运营样品是否选中",
      field: "tikTokWhetherTheKuaishouOperationSampleIsSelected"
    },
    whetherOrNotToChooseAnOperationSa: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "1688运营样品是否选中",
      field: "whetherOrNotToChooseAnOperationSa"
    },
    tmallRefused: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "天猫拒绝原因",
      field: "tmallRefused"
    },
    jdComRefused: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "京东拒绝原因",
      field: "jdComRefused"
    },
    pinduoduoRefused: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "拼多多拒绝原因",
      field: "pinduoduoRefused"
    },
    tmallSupermarketRefused: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "天猫超市拒绝原因",
      field: "tmallSupermarketRefused"
    },
    theTaoFactoryRefused: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "淘工厂拒绝原因",
      field: "theTaoFactoryRefused"
    },
    dewuVipshopWillRefuse: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "得物、唯品会拒绝原因",
      field: "dewuVipshopWillRefuse"
    },
    tmallVerticalShopXiaohongshuRefuses: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "天猫垂类店、小红书拒绝原因",
      field: "tmallVerticalShopXiaohongshuRefuses"
    },
    coupangRefuse: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "Coupang拒绝原因",
      field: "coupang_Refuse"
    },
    deniedAlibaba: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "1688拒绝原因",
      field: "deniedAlibaba"
    },
    tmallDevelopmentRejection: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "抖音、快手拒绝原因",
      field: "tmallDevelopmentRejection"
    },
    developmentRejection: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "开发拒绝原因",
      field: "developmentRejection"
    },
    reciprocaltype: {
      type: DataTypes.CHAR(2),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "正推反推类型",
      field: "reciprocaltype"
    }
  };
  const options = {
    tableName: "procurement_selection_eeting",
    comment: "",
    indexes: []
  };
  const ProcurementSelectionEetingModel = sequelize.define("procurementSelectionEetingModel", attributes, options);
  return ProcurementSelectionEetingModel;
};