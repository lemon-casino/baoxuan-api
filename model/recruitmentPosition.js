const Sequelize = require('sequelize');
const moment = require('moment');
const sequelize = require('./init');

const RecruitmentPositionModel = sequelize.define('recruitment_positions', {
        id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                field: 'id',
        },
        processId: {
                type: Sequelize.STRING(255),
                allowNull: false,
                field: 'process_id',
                comment: '流程实例id',
        },
        processCode: {
                type: Sequelize.STRING(254),
                allowNull: true,
                field: 'process_code',
                comment: '流程模型id',
        },
        version: {
                type: Sequelize.STRING(255),
                allowNull: true,
                field: 'version',
                comment: '流程版本',
        },
        department: {
                type: Sequelize.STRING(255),
                allowNull: true,
                field: 'department',
                comment: '部门',
        },
        jobTitle: {
                type: Sequelize.STRING(255),
                allowNull: true,
                field: 'job_title',
                comment: '招聘岗位',
        },
        headcount: {
                type: Sequelize.STRING(64),
                allowNull: true,
                field: 'headcount',
                comment: '招聘人数',
        },
        owner: {
                type: Sequelize.STRING(255),
                allowNull: true,
                field: 'owner',
                comment: '招聘负责人',
        },
        educationRequirement: {
                type: Sequelize.STRING(255),
                allowNull: true,
                field: 'education_requirement',
                comment: '学历要求',
        },
        experienceRequirement: {
                type: Sequelize.STRING(255),
                allowNull: true,
                field: 'experience_requirement',
                comment: '工作经验',
        },
        jobContent: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'job_content',
                comment: '工作内容',
        },
        status: {
                type: Sequelize.TINYINT,
                allowNull: true,
                field: 'status',
                comment: '流程状态：-1未开始，1进行中，2审批通过，3审批不通过，4已取消',
        },
        startTime: {
                type: Sequelize.DATE,
                allowNull: true,
                field: 'start_time',
                comment: '流程开始时间',
                get() {
                        const value = this.getDataValue('startTime');
                        return value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : null;
                },
        },
        endTime: {
                type: Sequelize.DATE,
                allowNull: true,
                field: 'end_time',
                comment: '流程结束时间',
                get() {
                        const value = this.getDataValue('endTime');
                        return value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : null;
                },
        },
}, {
        tableName: 'recruitment_positions',
        freezeTableName: true,
        timestamps: false,
        indexes: [
                {
                        unique: true,
                        fields: ['process_id'],
                },
        ],
});

module.exports = RecruitmentPositionModel;
