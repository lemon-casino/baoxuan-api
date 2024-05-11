const Sequelize = require('sequelize');
const sequelize = require('./init');
const RenshiRichangModel = sequelize.define('resume_result', {
    position: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: "岗位名称",
        field: "position"
    },
    numberResumes: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: "简历数",
        field: "number_resumes"
    },
    keyword: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: "关键词",
        field: "keyword"
    },
    date: {
        type: Sequelize.STRING(100),
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
        comment: "创建日期",
        field: "create_time"
    }
}, {
    tableName: 'resume_result' // 指定表名
});

module.exports = RenshiRichangModel;
