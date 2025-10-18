const {
  DataTypes
} = require('sequelize');
module.exports = sequelize => {
  const attributes = {
    deptId: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: false,
      comment: null,
      field: "dept_id"
    },
    deptName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "dept_name"
    },
    parentId: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "parent_id"
    }
  };
  const options = {
    tableName: "depts",
    comment: "",
    indexes: []
  };
  const DeptsModel = sequelize.define("deptsModel", attributes, options);
  return DeptsModel;
};