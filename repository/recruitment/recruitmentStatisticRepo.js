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
};
