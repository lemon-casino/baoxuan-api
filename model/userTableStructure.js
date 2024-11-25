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
    userId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "用户",
      field: "user_id"
    },
    field: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "字段属性",
      field: "field"
    },
    fixed: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "left  要不要固定",
      field: "fixed"
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "宽度",
      field: "width"
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "title",
      field: "title"
    },
    editRender: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "是否可输入",
      field: "editRender"
    },
    visible: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "1",
      primaryKey: false,
      autoIncrement: false,
      comment: "是否显示",
      field: "visible"
    },
    editRenderVersion: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "版本",
      field: "editRender_version"
    },
    editable: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0",
      primaryKey: false,
      autoIncrement: false,
      comment: "默认表头编辑",
      field: "editable"
    },
    tableType: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "1天猫链接数据 2 天猫链接属性",
      field: "tableType"
    },
    type: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "天猫属性select input",
      field: "type"
    },
    editing: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0",
      primaryKey: false,
      autoIncrement: false,
      comment: "真价值 1为真 0为假",
      field: "editing"
    },
    slots: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "slots"
    },
    sort: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      primaryKey: false,
      autoIncrement: false,
      comment: "排序",
      field: "sort"
    }
  };
  const options = {
    tableName: "user_table_structure",
    comment: "",
    indexes: []
  };
  const UserTableStructureModel = sequelize.define("userTableStructureModel", attributes, options);
  return UserTableStructureModel;
};