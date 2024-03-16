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
      comment: null,
      field: "id"
    },
    weight: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "2",
      primaryKey: false,
      autoIncrement: false,
      comment: "商品权重：1重要 2普通",
      field: "weight"
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
    processCode: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "流程编码",
      field: "processCode"
    },
    formUuid: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "实例表单id",
      field: "formUuid"
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "流程标题",
      field: "title"
    },
    approvedResult: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "流程审批结果",
      field: "approvedResult"
    },
    originator: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "流程发起人",
      field: "originator"
    },
    instanceStatus: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "流程状态",
      field: "instanceStatus"
    },
    data: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "流程组件数据",
      field: "data"
    },
    actionExecutor: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "多个执行人",
      field: "actionExecutor"
    },
    createTimeGmt: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "创建时间",
      field: "createTimeGMT"
    },
    modifiedTimeGmt: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "修改时间",
      field: "modifiedTimeGMT"
    },
    overallprocessflow: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "当前流程审核流",
      field: "overallprocessflow"
    },
    version: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "版本",
      field: "version"
    },
    updateTime: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "修改时间",
      field: "update_time"
    },
    createTime: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "创建时间",
      field: "create_time"
    },
    reviewId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "review_id"
    }
  };
  const options = {
    tableName: "processes",
    comment: "",
    indexes: []
  };
  const ProcessesModel = sequelize.define("processesModel", attributes, options);
  return ProcessesModel;
};