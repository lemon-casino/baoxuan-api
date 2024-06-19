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
    deptId: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "dept_id"
    },
    deptName: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "dept_name"
    },
    formId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "form_id"
    },
    formName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "form_name"
    },
    isCore: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0,
      primaryKey: false,
      autoIncrement: false,
      comment: ";是否是核心流程",
      field: "is_core"
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: "1",
      primaryKey: false,
      autoIncrement: false,
      comment: ";1:部门统计审核节点配置  2:配置部门核心流程",
      field: "type"
    }
  };
  const options = {
    tableName: "dept_flow_form",
    comment: "",
    indexes: []
  };
  const DeptFlowFormModel = sequelize.define("deptFlowFormModel", attributes, options);
  return DeptFlowFormModel;
};