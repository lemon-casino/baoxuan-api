const {
  DataTypes
} = require('sequelize');
module.exports = sequelize => {
  const attributes = {
    roleId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: true,
      comment: null,
      field: "role_id"
    },
    roleName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: false,
      comment: "角色名称",
      field: "role_name"
    },
    remark: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "备注",
      field: "remark"
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: "0",
      primaryKey: false,
      autoIncrement: false,
      comment: "状态:0停用1启用",
      field: "status"
    },
    updateTime: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "更新时间",
      field: "update_time"
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
    tableName: "roles",
    comment: "",
    indexes: []
  };
  const RolesModel = sequelize.define("rolesModel", attributes, options);
  return RolesModel;
};