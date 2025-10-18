const {
  DataTypes
} = require('sequelize');
module.exports = sequelize => {
  const attributes = {
    flowFormId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: false,
      comment: "流程表单id\n",
      field: "flow_form_id"
    },
    flowFormName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "流程表名称",
      field: "flow_form_name"
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "2",
      primaryKey: false,
      autoIncrement: false,
      comment: "流程表单状态 1重要 2普通",
      field: "status"
    },
    createTime: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "create_time"
    },
    updateTime: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "update_time"
    },
    detailsHash: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "详情的hash 用于判断是否做了更改",
      field: "details_hash"
    },
    detailsVersion: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "details_version"
    },
    creator: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "creator"
    },
    deptId: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "dept_id"
    },
    deptName: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "dept_name"
    }
  };
  const options = {
    tableName: "flowfroms",
    comment: "",
    indexes: []
  };
  const FlowfromsModel = sequelize.define("flowfromsModel", attributes, options);
  return FlowfromsModel;
};