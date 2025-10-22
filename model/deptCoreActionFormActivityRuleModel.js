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
    deptCoreActionFormRuleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "dept_core_action_form_rule_id"
    },
    activityId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "activity_id"
    },
    activityName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: ";",
      field: "activity_name"
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "status"
    },
    isOverdue: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0,
      primaryKey: false,
      autoIncrement: false,
      comment: ";",
      field: "is_overdue"
    },
    owner: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "owner"
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: ";",
      field: "version"
    }
  };
  const options = {
    tableName: "dept_core_action_form_activity_rule",
    comment: "",
    indexes: []
  };
  const DeptCoreActionFormActivityRuleModel = sequelize.define("deptCoreActionFormActivityRuleModel", attributes, options);
  return DeptCoreActionFormActivityRuleModel;
};