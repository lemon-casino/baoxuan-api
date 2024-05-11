const Sequelize = require('sequelize');
const sequelize = require('./init');
const renshiRichangModel = sequelize.define('renshi_richang', {

  idf: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue: null,
    primaryKey: false, // 将 primaryKey 设置为 false
    autoIncrement: false,
    comment: "主键id",
    field: "id"
  },
  name: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "姓名",
    field: "name"
  },
  platform: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "平台",
    field: "platform"
  },
  position: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "岗位",
    field: "position"
  },
  jobPosition: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "职位级别",
    field: "job_position"
  },
  haveChecked: {
    type: Sequelize.DOUBLE,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "查看过",
    field: "have_checked"
  },
  haveCommunicated: {
    type: Sequelize.DOUBLE,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "沟通过",
    field: "have_communicated"
  },
  numberOfResumes: {
    type: Sequelize.DOUBLE,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "简历数",
    field: "number_of_resumes"
  },
  matchNumber: {
    type: Sequelize.DOUBLE,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "符合岗位数",
    field: "match_number"
  },
  numberSuccessfulOffers: {
    type: Sequelize.DOUBLE,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "邀约成功数",
    field: "number_successful_offers"
  },
  numberPreliminaryApplicants: {
    type: Sequelize.DOUBLE,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "初试人数",
    field: "number_preliminary_applicants"
  },
  numberOfReExaminations: {
    type: Sequelize.DOUBLE,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "复试人数",
    field: "number_of_re_examinations"
  },
  numberOfInterviewPasses: {
    type: Sequelize.DOUBLE,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "面试通过人数",
    field: "number_of_interview_passes"
  },
  offerNumber: {
    type: Sequelize.DOUBLE,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "offer人数",
    field: "offer_number"
  },
  attendance: {
    type: Sequelize.DOUBLE,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "到岗人数",
    field: "attendance"
  },
  oldAndNewTitles: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "新旧标题",
    field: "old_and_new_titles"
  },
  whetherToUseProps: {
    type: Sequelize.TEXT,
    allowNull: true,
    defaultValue: null,
    primaryKey: false,
    autoIncrement: false,
    comment: "是否使用道具",
    field: "whether_to_use_props"
  },
  date: {
    type: Sequelize.TEXT,
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
  tableName: 'renshi_richang' // 指定表名
});

module.exports = renshiRichangModel;
