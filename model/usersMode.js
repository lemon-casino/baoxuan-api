const {
  DataTypes
} = require('sequelize');
module.exports = sequelize => {
  const attributes = {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: true,
      comment: "id唯一字段",
      field: "user_id"
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "用户名",
      field: "username"
    },
    dingdingUserId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "钉钉用户id",
      field: "dingding_user_id"
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "用户密码",
      field: "password"
    },
    nickname: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "用户昵称",
      field: "nickname"
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "用户邮箱\r\n",
      field: "email"
    },
    userPic: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "用户头像",
      field: "user_pic"
    },
    status: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: "0",
      primaryKey: false,
      autoIncrement: false,
      comment: "用户状态： 0为停用、1启用\r\n",
      field: "status"
    },
    createTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      primaryKey: false,
      autoIncrement: false,
      comment: "创建时间",
      field: "create_time"
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
    phone: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "手机号",
      field: "phone"
    },
    sex: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: "0",
      primaryKey: false,
      autoIncrement: false,
      comment: "性别",
      field: "sex"
    },
    describe: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "用户描述: 0是男，1是女",
      field: "describe"
    }
  };
  const options = {
    tableName: "users",
    comment: "",
    indexes: []
  };
  const UsersModel = sequelize.define("usersModel", attributes, options);
  return UsersModel;
};