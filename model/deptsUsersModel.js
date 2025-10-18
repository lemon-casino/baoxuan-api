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
    userId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: false,
      comment: null,
      field: "user_id"
    }
  };
  const options = {
    tableName: "depts_users",
    comment: "",
    indexes: []
  };
  const DeptsUsersModel = sequelize.define("deptsUsersModel", attributes, options);
  return DeptsUsersModel;
};