const {
  DataTypes
} = require('sequelize');
module.exports = sequelize => {
  const attributes = {
    roleMenuId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: true,
      comment: "角色菜单联合表id",
      field: "role_menu_id"
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "角色id",
      field: "role_id"
    },
    menuId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "菜单id",
      field: "menu_id"
    },
    createTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "创建时间",
      field: "create_time"
    }
  };
  const options = {
    tableName: "roles_menus",
    comment: "",
    indexes: []
  };
  const RolesMenusModel = sequelize.define("rolesMenusModel", attributes, options);
  return RolesMenusModel;
};