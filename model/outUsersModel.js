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
    userName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "user_name"
    },
    groupCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: ";外包分组：外包摄影、外包美编",
      field: "group_code"
    },
    groupName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: ";",
      field: "group_name"
    },
    createTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "create_time"
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "enabled"
    },
    deptName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: ";",
      field: "dept_name"
    },
    deptId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: ";",
      field: "dept_id"
    }
  };
  const options = {
    tableName: "out_users",
    comment: "",
    indexes: []
  };
  const OutUsersModel = sequelize.define("outUsersModel", attributes, options);
  return OutUsersModel;
};