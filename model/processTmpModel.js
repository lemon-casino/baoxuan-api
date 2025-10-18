const {
  DataTypes
} = require('sequelize');
module.exports = sequelize => {
  const attributes = {
    processInstanceId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: false,
      comment: "流程实例id",
      field: "process_instance_id"
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
    processCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "流程编码",
      field: "process_code"
    },
    formUuid: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "实例表单id",
      field: "form_uuid"
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
      type: DataTypes.STRING(30),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "流程审批结果",
      field: "approved_result"
    },
    instanceStatus: {
      type: DataTypes.STRING(30),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "流程状态",
      field: "instance_status"
    },
    actionExecutor: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "多个执行人",
      field: "action_executor"
    },
    version: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "版本",
      field: "version"
    },
    operateTime: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "操作时间",
      field: "operate_time"
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
    stockedTime: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "入库时间;",
      field: "stocked_time"
    },
    reviewId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "review_id"
    },
    originatorName: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "originator_name"
    },
    originatorId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "originator_id"
    }
  };
  const options = {
    tableName: "process_tmp",
    comment: "",
    indexes: []
  };
  const ProcessTmpModel = sequelize.define("processTmpModel", attributes, options);
  return ProcessTmpModel;
};