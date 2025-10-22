const {
  DataTypes
} = require('sequelize');
module.exports = sequelize => {
  const attributes = {
    processInstanceId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: false,
      comment: "id",
      field: "process_instance_id"
    },
    processCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: ";流程表单id",
      field: "process_code"
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "审批实例标题",
      field: "title"
    },
    finishTime: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "结束时间",
      field: "finish_time"
    },
    originatorUserId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "发起人的userId",
      field: "originator_user_id"
    },
    originatorDeptId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "发起人的部门，-1表示根部门",
      field: "originator_dept_id"
    },
    originatorDeptName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "发起人的部门名称",
      field: "originator_dept_name"
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "审批状态 。  RUNNING：审批中 TERMINATED：已撤销 COMPLETED：审批完成",
      field: "status"
    },
    approverUserIds: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "审批人userId",
      field: "approver_user_ids"
    },
    ccUserIds: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "抄送人userId",
      field: "cc_user_ids"
    },
    result: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "审批结果。  agree：同意  refuse：拒绝",
      field: "result"
    },
    businessId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "审批实例业务编号",
      field: "business_id"
    },
    bizAction: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "审批实例业务动作。  MODIFY：表示该审批实例是基于原来的实例修改而来 REVOKE：表示该审批实例是由原来的实例撤销后重新发起的 NONE：表示正常发起",
      field: "biz_action"
    },
    bizData: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "用户自定义业务参数透出",
      field: "biz_data"
    },
    attachedProcessInstanceIds: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "审批附属实例",
      field: "attached_process_instance_ids"
    },
    mainProcessInstanceId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "主流程实例标识",
      field: "main_process_instance_id"
    },
    createTime: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "创建时间",
      field: "create_time"
    },
    stockedTime: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: ";入库时间",
      field: "stocked_time"
    }
  };
  const options = {
    tableName: "oa_process",
    comment: "",
    indexes: []
  };
  const OaProcessModel = sequelize.define("oaProcessModel", attributes, options);
  return OaProcessModel;
};