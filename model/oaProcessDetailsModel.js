const {
  DataTypes
} = require('sequelize');
module.exports = sequelize => {
  const attributes = {
    id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: false,
      comment: null,
      field: "id"
    },
    processInstanceId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "process_instance_id"
    },
    comId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "组件ID",
      field: "com_id"
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "组件名称",
      field: "name"
    },
    value: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "标签值",
      field: "value"
    },
    extValue: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "标签扩展值",
      field: "ext_value"
    },
    componentType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "组件类型",
      field: "component_type"
    },
    bizAlias: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "组件别名",
      field: "biz_alias"
    },
    createTime: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "create_time"
    }
  };
  const options = {
    tableName: "oa_process_details",
    comment: "",
    indexes: []
  };
  const OaProcessDetailsModel = sequelize.define("oaProcessDetailsModel", attributes, options);
  return OaProcessDetailsModel;
};