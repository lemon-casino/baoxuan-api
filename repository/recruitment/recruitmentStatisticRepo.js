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

const bulkInsertStatistics = async (records = []) => {
        if (!Array.isArray(records) || records.length === 0) {
                return 0;
        }

        const payload = records.map((record) => ({
                ...record,
                metadata: normalizeMetadata(record.metadata),
                recordedAt: record.recordedAt || new Date(),
        }));

        await RecruitmentStatisticModel.bulkCreate(payload);

        return payload.length;
};

const hasCurriculumVitaeShipStatistic = async ({entityId, reference, ship}) => {
        const normalizedShip = typeof ship === 'number' ? ship : Number(ship);
        if (!Number.isFinite(normalizedShip)) {
                return false;
        }

        const where = {
                entityType: 'curriculum_vitae',
                changeType: 'ship',
                ship: normalizedShip,
        };

        const orConditions = [];
        if (entityId) {
                orConditions.push({entityId: String(entityId)});
        }
        if (reference) {
                orConditions.push({reference});
        }

        if (orConditions.length === 0) {
                return false;
        }

        where[Op.or] = orConditions;

        const existing = await RecruitmentStatisticModel.findOne({
                attributes: ['id'],
                where,
                raw: true,
        });

        return Boolean(existing);
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
        hasCurriculumVitaeShipStatistic,
        getCurriculumVitaeShipStatistics,
};
