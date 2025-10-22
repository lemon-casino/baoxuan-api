const {
  DataTypes
} = require('sequelize');
module.exports = sequelize => {
  const attributes = {
    id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: false,
      comment: "key",
      field: "id"
    },
    processInstanceId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "流程id",
      field: "process_instance_id"
    },
    orderIndex: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "在当前流程中的排序;",
      field: "order_index"
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "大小",
      field: "size"
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "类型：history、forcast...",
      field: "type"
    },
    action: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "动作",
      field: "action"
    },
    dataId: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "数据id",
      field: "data_id"
    },
    remark: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "备注",
      field: "remark"
    },
    taskId: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "任务id",
      field: "task_id"
    },
    showName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "显示名称",
      field: "show_name"
    },
    actionExit: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "格式化的action",
      field: "action_exit"
    },
    activityId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "节点id",
      field: "activity_id"
    },
    operatorName: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "操作人",
      field: "operator_name"
    },
    doneTime: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "完成时间",
      field: "done_time"
    },
    operatorUserId: {
      type: DataTypes.STRING(30),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "操作人id",
      field: "operator_user_id"
    },
    taskHoldTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "任务挂起时间",
      field: "task_hold_time"
    },
    operatorPhotoUrl: {
      type: DataTypes.STRING(300),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "操作人头像",
      field: "operator_photo_url"
    },
    operatorDisplayName: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "操作人名称",
      field: "operator_display_name"
    },
    cost: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "耗时",
      field: "cost"
    },
    limitedTime: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "限定时间",
      field: "limited_time"
    },
    isOverDue: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0,
      primaryKey: false,
      autoIncrement: false,
      comment: "是否逾期",
      field: "is_over_due"
    },
    operateType: {
      type: DataTypes.STRING(30),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "操作类型;",
      field: "operate_type"
    }
  };
  const options = {
    tableName: "process_review",
    comment: "",
    indexes: [{
      name: "process_instance_id",
      unique: false,
      type: "BTREE",
      fields: ["process_instance_id"]
    }]
  };
  const ProcessReviewModel = sequelize.define("processReviewModel", attributes, options);
  return ProcessReviewModel;
};