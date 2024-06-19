const {
  DataTypes
} = require('sequelize');
module.exports = sequelize => {
  const attributes = {
    processCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: false,
      comment: null,
      field: "process_code"
    },
    flowTitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "flow_title"
    },
    newProcess: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "new_process"
    },
    attendanceType: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "attendance_type"
    },
    modifiedTime: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "modified_time"
    },
    iconName: {
      type: DataTypes.STRING(30),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "icon_name"
    },
    iconUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "icon_url"
    }
  };
  const options = {
    tableName: "oa_process_template",
    comment: "",
    indexes: []
  };
  const OaProcessTemplateModel = sequelize.define("oaProcessTemplateModel", attributes, options);
  return OaProcessTemplateModel;
};