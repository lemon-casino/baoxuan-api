const Sequelize = require('sequelize');
const sequelize = require('./init');  // Ensure the sequelize connection is properly set up
const RenshiRichangModel = sequelize.define('channeng_fenxi_sum', {
  id: {
    type: Sequelize.STRING(100),
    allowNull: false,
    defaultValue: null,
    primaryKey: true,
    autoIncrement: false,
    comment: "主键id",
    field: "id"
  },
  keyword: {
    type: Sequelize.STRING(50),
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "关键词",
    field: "keyword"
  },
  section: {
    type: Sequelize.STRING(50),
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "部门",
    field: "section"
  },
  targetNumberDemand: {
    type: Sequelize.DOUBLE,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "需求目标数",
    field: "target_number_demand"
  },
  targetCompletions: {
    type: Sequelize.DOUBLE,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "目标完成数",
    field: "target_completions"
  },
  rateOfCompletion: {
    type: Sequelize.DOUBLE,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "完成率",
    field: "rate_of_completion"
  },
  matchingResumeVolume: {
    type: Sequelize.DOUBLE,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "匹配简历量",
    field: "matching_resume_volume"
  },
  amountInvitation: {
    type: Sequelize.DOUBLE,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "邀约量",
    field: "amount_invitation"
  },
  areaReach: {
    type: Sequelize.DOUBLE,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "到面量",
    field: "area_reach"
  },
  successRateInvitation: {
    type: Sequelize.DOUBLE,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "邀约成功率",
    field: "success_rate_invitation"
  },
  passTheFirstTest: {
    type: Sequelize.DOUBLE,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "初试通过",
    field: "pass_the_first_test"
  },
  passTheSecondExamination: {
    type: Sequelize.DOUBLE,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "复试通过",
    field: "pass_the_second_examination"
  },
  secondTestPassRate: {
    type: Sequelize.DOUBLE,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "复试通过率",
    field: "second_test_pass_rate"
  },
  startWorkThisMonth: {
    type: Sequelize.DOUBLE,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "本月入职",
    field: "start_work_this_month"
  },
  conversionRate: {
    type: Sequelize.DOUBLE,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "转化率",
    field: "conversion_rate"
  },
  leaveThisMonth: {
    type: Sequelize.DOUBLE,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "本月离职",
    field: "leave_this_month"
  },
  keepThisMonth: {
    type: Sequelize.DOUBLE,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "本月留存",
    field: "keep_this_month"
  },
  retentionRate: {
    type: Sequelize.DOUBLE,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "留存率",
    field: "retention_rate"
  },
  date: {
    type: Sequelize.DATEONLY,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "日期",
    field: "date"
  },
  createTime: {
    type: Sequelize.DATE,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "创建时间",
    field: "create_time"
  }
}, {
  tableName: 'channeng_fenxi_sum'
});

module.exports = RenshiRichangModel;
