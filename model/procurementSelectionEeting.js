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
        comment: "流程实例id",
        field: "processInstanceId"
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
    selectionAttributes:{
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "选品属性",
      field: "selectionAttributes"
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