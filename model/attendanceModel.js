const {
  DataTypes
} = require('sequelize');
module.exports = sequelize => {
  const attributes = {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: false,
      comment: null,
      field: "id"
    },
    sourceType: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "数据来源：  ATM：考勤机打卡（指纹/人脸打卡）  BEACON：IBeacon  DING_ATM：钉钉考勤机（考勤机蓝牙打卡）  USER：用户打卡  BOSS：老板改签  APPROVE：审批系统  SYSTEM：考勤系统  AUTO_CHECK：自动打卡",
      field: "source_type"
    },
    baseCheckTime: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "计算迟到和早退，基准时间",
      field: "base_check_time"
    },
    userCheckTime: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "计算迟到和早退，基准时间",
      field: "user_check_time"
    },
    procInstId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "关联的审批实例ID，当该字段非空时，表示打卡记录与请假、加班等审批有关",
      field: "proc_inst_id"
    },
    approveId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "关联的审批ID，当该字段非空时，表示打卡记录与请假、加班等审批有关",
      field: "approve_id"
    },
    locationResult: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "位置结果：  Normal：范围内  Outside：范围外  NotSigned：未打卡",
      field: "location_result"
    },
    timeResult: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "打卡结果：  Normal：正常  Early：早退  Late：迟到  SeriousLate：严重迟到  Absenteeism：旷工迟到  NotSigned：未打卡",
      field: "time_result"
    },
    checkType: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "考勤类型：  OnDuty：上班  OffDuty：下班",
      field: "check_type"
    },
    userId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "打卡人的userId",
      field: "user_id"
    },
    workDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "工作日",
      field: "work_date"
    },
    recordId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: ";打卡记录ID",
      field: "record_id"
    },
    planId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: ";排班ID",
      field: "plan_id"
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "考勤组ID",
      field: "group_id"
    }
  };
  const options = {
    tableName: "attendance",
    comment: "",
    indexes: []
  };
  const AttendanceModel = sequelize.define("attendanceModel", attributes, options);
  return AttendanceModel;
};