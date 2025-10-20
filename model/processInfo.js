const Sequelize = require('sequelize');
const moment = require('moment');
const sequelize = require('./init');

const ProcessInfoModel = sequelize.define('process_info', {
        id: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                field: 'id',
        },
        processId: {
                type: Sequelize.STRING(255),
                allowNull: true,
                field: 'process_id',
                comment: '流程实例id',
        },
        title: {
                type: Sequelize.STRING(1024),
                allowNull: true,
                field: 'title',
                comment: '字段名',
        },
        field: {
                type: Sequelize.STRING(255),
                allowNull: true,
                field: 'field',
                comment: '字段id',
        },
        type: {
                type: Sequelize.STRING(255),
                allowNull: true,
                field: 'type',
                comment: '字段类型',
        },
        content: {
                type: Sequelize.TEXT,
                allowNull: true,
                field: 'content',
                comment: '字段内容',
        },
        createTime: {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                field: 'create_time',
                comment: '创建时间',
                get() {
                        const value = this.getDataValue('createTime');
                        return value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : null;
                },
        },
        updateTime: {
                type: Sequelize.DATE,
                allowNull: true,
                field: 'update_time',
                comment: '更新时间',
                get() {
                        const value = this.getDataValue('updateTime');
                        return value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : null;
                },
        },
        tenantId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                field: 'tenant_id',
                comment: '租户id',
        },
}, {
        tableName: 'process_info',
        freezeTableName: true,
        timestamps: false,
});

module.exports = ProcessInfoModel;
