const {Op} = require('sequelize');
const RecruitmentStatisticModel = require('@/model/recruitmentStatistic');

const normalizeMetadata = (metadata) => {
        if (!metadata) {
                return null;
        }

        try {
                return JSON.stringify(metadata);
        } catch (error) {
                return null;
        }
};

const normalizeRecordedAt = (value) => {
        if (!value) {
                return new Date();
        }

        if (value instanceof Date && !Number.isNaN(value.getTime())) {
                return value;
        }

        if (typeof value === 'number') {
                const date = new Date(value);
                return Number.isNaN(date.getTime()) ? new Date() : date;
        }

        if (typeof value === 'string') {
                const trimmed = value.trim();
                if (!trimmed) {
                        return new Date();
                }

                const sanitized = trimmed
                        .replace(/[年月]/g, '-')
                        .replace(/[日]/g, '')
                        .replace(/[./]/g, '-');
                const parsed = new Date(sanitized);
                if (!Number.isNaN(parsed.getTime())) {
                        return parsed;
                }
        }

        const fallback = new Date(value);
        return Number.isNaN(fallback.getTime()) ? new Date() : fallback;
};

const bulkInsertStatistics = async (records = []) => {
        if (!Array.isArray(records) || records.length === 0) {
                return 0;
        }

        const payload = records.map((record) => ({
                ...record,
                metadata: normalizeMetadata(record.metadata),
                recordedAt: normalizeRecordedAt(record.recordedAt),
        }));

        await RecruitmentStatisticModel.bulkCreate(payload);

        return payload.length;
};

const findExistingShipStatisticEntityIds = async (entityIds = []) => {
        if (!Array.isArray(entityIds) || entityIds.length === 0) {
                return new Set();
        }

        const normalizedIds = Array.from(
                new Set(
                        entityIds
                                .map((entityId) =>
                                        entityId === null || entityId === undefined ? null : String(entityId).trim()
                                )
                                .filter((entityId) => entityId)
                )
        );

        if (normalizedIds.length === 0) {
                return new Set();
        }

        const rows = await RecruitmentStatisticModel.findAll({
                attributes: ['entityId'],
                where: {
                        entityType: 'curriculum_vitae',
                        changeType: 'ship',
                        entityId: {
                                [Op.in]: normalizedIds,
                        },
                },
                group: ['entityId'],
                raw: true,
        });

        return new Set(rows.map((row) => row.entityId));
};

const getCurriculumVitaeShipStatistics = async ({startDate, endDate, ships}) => {
        const sequelize = RecruitmentStatisticModel.sequelize;
        const where = {
                entityType: 'curriculum_vitae',
                changeType: 'ship',
        };

        if (startDate || endDate) {
                where.recordedAt = {};

                if (startDate) {
                        where.recordedAt[Op.gte] = startDate;
                }

                if (endDate) {
                        where.recordedAt[Op.lt] = endDate;
                }
        }

        if (Array.isArray(ships) && ships.length > 0) {
                where.ship = {
                        [Op.in]: ships,
                };
        }

        const rows = await RecruitmentStatisticModel.findAll({
                attributes: [
                        'ship',
                        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                ],
                where,
                group: ['ship'],
                raw: true,
        });

        return rows.map((row) => ({
                ship: typeof row.ship === 'number' ? row.ship : Number(row.ship),
                count: typeof row.count === 'number' ? row.count : Number(row.count),
        }));
};

module.exports = {
        bulkInsertStatistics,
        getCurriculumVitaeShipStatistics,
        findExistingShipStatisticEntityIds,
};
