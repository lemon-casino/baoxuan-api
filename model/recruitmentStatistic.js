const Sequelize = require('sequelize');
const sequelize = require('./bpmInit');
const RecruitmentStatisticModel = sequelize.define(
        'recruitment_statistics',
        {
                id: {
                        type: Sequelize.INTEGER.UNSIGNED,
                        allowNull: false,
                        autoIncrement: true,
                        primaryKey: true,
                        comment: '主键ID',
                        field: 'id',
                },
                entityType: {
                        type: Sequelize.STRING(64),
                        allowNull: false,
                        field: 'entity_type',
                        comment: '实体类型: curriculum_vitae 或 recruitment_positions',
                },
                entityId: {
                        type: Sequelize.STRING(128),
                        allowNull: true,
                        field: 'entity_id',
                        comment: '实体ID',
                },
                reference: {
                        type: Sequelize.STRING(255),
                        allowNull: true,
                        field: 'reference',
                        comment: '引用标识, 例如联系方式或流程ID',
                },
                changeType: {
                        type: Sequelize.STRING(64),
                        allowNull: false,
                        field: 'change_type',
                        comment: '变化类型, 如 ship/status/department',
                },
                previousShip: {
                        type: Sequelize.INTEGER,
                        allowNull: true,
                        field: 'previous_ship',
                        comment: '变更前的ship',
                },
                ship: {
                        type: Sequelize.INTEGER,
                        allowNull: true,
                        field: 'ship',
                        comment: '变更后的ship',
                },
                previousStatus: {
                        type: Sequelize.INTEGER,
                        allowNull: true,
                        field: 'previous_status',
                        comment: '变更前的岗位状态',
                },
                status: {
                        type: Sequelize.INTEGER,
                        allowNull: true,
                        field: 'status',
                        comment: '变更后的岗位状态',
                },
                previousDepartment: {
                        type: Sequelize.STRING(255),
                        allowNull: true,
                        field: 'previous_department',
                        comment: '变更前的部门',
                },
                department: {
                        type: Sequelize.STRING(255),
                        allowNull: true,
                        field: 'department',
                        comment: '变更后的部门',
                },
                metadata: {
                        type: Sequelize.TEXT,
                        allowNull: true,
                        field: 'metadata',
                        comment: '扩展信息(JSON字符串)',
                },
                recordedAt: {
                        type: Sequelize.DATE,
                        allowNull: false,
                        field: 'recorded_at',
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                        comment: '记录时间',
                },
        },
        {
                tableName: 'recruitment_statistics',
                timestamps: false,
                indexes: [
                        {
                                fields: ['entity_type', 'change_type', 'recorded_at'],
                        },
                        {
                                fields: ['recorded_at'],
                        },
                        {
                                fields: ['ship'],
                        },
                ],
        }
);

module.exports = RecruitmentStatisticModel;
