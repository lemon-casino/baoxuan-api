const Sequelize = require('sequelize');
const moment = require('moment');
const sequelize = require('./init');

const ProcessesModel = sequelize.define('processes', {
        id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                field: 'id',
        },
        processCode: {
                type: Sequelize.STRING(254),
                allowNull: true,
                field: 'process_code',
                comment: '模型的id',
        },
        processId: {
                type: Sequelize.STRING(255),
                allowNull: true,
                field: 'process_id',
                comment: '流程实例id',
        },
        title: {
                type: Sequelize.STRING(255),
                allowNull: true,
                field: 'title',
                comment: '实例的标题',
        },
        version: {
                type: Sequelize.STRING(255),
                allowNull: true,
                field: 'version',
                comment: '流程版本',
        },
        username: {
                type: Sequelize.STRING(255),
                allowNull: true,
                field: 'username',
                comment: '实例创建人',
        },
        dept: {
                type: Sequelize.STRING(255),
                allowNull: true,
                field: 'dept',
                comment: '创建人部门',
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
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                field: 'start_time',
                comment: '开始时间',
                get() {
                        const value = this.getDataValue('startTime');
                        return value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : null;
                },
        },
        endTime: {
                type: Sequelize.DATE,
                allowNull: true,
                field: 'end_time',
                comment: '结束时间',
                get() {
                        const value = this.getDataValue('endTime');
                        return value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : null;
                },
        },
        tenantId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                field: 'tenant_id',
        },
}, {
        tableName: 'processes',
        freezeTableName: true,
        timestamps: false,
});

module.exports = ProcessesModel;
