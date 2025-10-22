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
    lastWorkDay: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: ";最后工作日",
      field: "last_work_day"
    },
    reasonMemo: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: ";离职原因备注",
      field: "reason_memo"
    },
    preStatus: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: ";离职前工作状态：  1：待入职；  2：试用期；  3：正式。",
      field: "pre_status"
    },
    handoverUserId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: ";离职交接人的userId",
      field: "handover_user_id"
    },
    handoverUserName: {
      type: DataTypes.STRING(30),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: ";",
      field: "handover_user_name"
    },
    resignStatus: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: ";离职状态：  1：待离职。  2：已离职。  3：非待离职或非已离职。  4：已提交离职审批单，审批单暂未通过。",
      field: "resign_status"
    },
    voluntaryReason: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: ";主动原因",
      field: "voluntary_reason"
    },
    passiveReason: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: ";被动原因",
      field: "passive_reason"
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
    },
    isResign: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0,
      primaryKey: false,
      autoIncrement: false,
      comment: "是否离职 0-否 1-是",
      field: "is_resign"
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