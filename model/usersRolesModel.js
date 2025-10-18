const {
  DataTypes
} = require('sequelize');
module.exports = sequelize => {
  const attributes = {
    userRoleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: true,
      comment: null,
      field: "user_role_id"
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "角色ID",
      field: "role_id"
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "用户ID",
      field: "user_id"
    },
    createTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      primaryKey: false,
      autoIncrement: false,
      comment: "创建时间",
      field: "create_time"
    }
  };
  const options = {
    tableName: "users_roles",
    comment: "",
    indexes: []
  };
  const UsersRolesModel = sequelize.define("usersRolesModel", attributes, options);
  return UsersRolesModel;
};