const {
  DataTypes
} = require('sequelize');
module.exports = sequelize => {
  const attributes = {
    code: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "",
      primaryKey: false,
      autoIncrement: false,
      comment: "processInstanceId",
      field: "code"
    },
    productAudits: {
      type: DataTypes.CHAR(2),
      allowNull: true,
      defaultValue: "",
      primaryKey: false,
      autoIncrement: false,
      comment: "产品审核",
      field: "productAudits"
    },
    deferredDing: {
      type: DataTypes.CHAR(2),
      allowNull: true,
      defaultValue: "",
      primaryKey: false,
      autoIncrement: false,
      comment: "三天内通知节点",
      field: "deferredDing"
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      primaryKey: false,
      autoIncrement: false,
      comment: "创建时间",
      field: "created_at"
    },
    dingId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "",
      primaryKey: false,
      autoIncrement: false,
      comment: "钉钉回执的id",
      field: "dingId"
    },
    formUuid: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "formUuid",
      field: "formUuid"
    }
  };
  const options = {
    tableName: "ding_daily_report",
    comment: "",
    indexes: []
  };
  const DingDailyReportModel = sequelize.define("dingDailyReportModel", attributes, options);
  return DingDailyReportModel;
};