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
      comment: "主键",
      field: "id"
    },
    userid: {
      type: DataTypes.CHAR(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "用户ID",
      field: "userid"
    },
    attribute: {
      type: DataTypes.CHAR(16),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "类型 ",
      field: "attribute"
    },
    conversionDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "转正日期",
      field: "conversion_date"
    },
    whether: {
      type: DataTypes.ENUM('1', '2'),
      allowNull: true,
      defaultValue: "1",
      primaryKey: false,
      autoIncrement: false,
      comment: "默认 1 是通知  2是不通知 ",
      field: "whether"
    },
    number: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "通知次数",
      field: "number"
    },
    dingding: {
      type: DataTypes.CHAR(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "dingdingID",
      field: "dingding"
    },
    supervisors: {
      type: DataTypes.CHAR(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "上级主管",
      field: "supervisors"
    }
  };
  const options = {
    tableName: "confirmationnotice",
    comment: "",
    indexes: []
  };
  const ConfirmationnoticeModel = sequelize.define("confirmationnoticeModel", attributes, options);
  return ConfirmationnoticeModel;
};