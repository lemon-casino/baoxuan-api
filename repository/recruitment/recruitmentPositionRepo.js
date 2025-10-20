const {Op} = require('sequelize');
const RecruitmentPositionModel = require('@/model/recruitmentPosition');

const upsertRecruitmentPositions = async (positions) => {
        if (!positions || positions.length === 0) {
                return 0;
        }

        await RecruitmentPositionModel.bulkCreate(positions, {
                updateOnDuplicate: [
                        'processCode',
                        'version',
                        'department',
                        'jobTitle',
                        'headcount',
                        'owner',
                        'educationRequirement',
                        'experienceRequirement',
                        'jobContent',
                        'status',
                        'startTime',
                        'endTime',
                ],
        });

        return positions.length;
};

const buildFilter = ({status, jobTitle, owner}) => {
        const where = {};

        if (Array.isArray(status) && status.length > 0) {
                const normalizedStatus = status
                        .map((item) => Number(item))
                        .filter((value) => Number.isFinite(value));
                if (normalizedStatus.length > 0) {
                        where.status = {
                                [Op.in]: normalizedStatus,
                        };
                }
        } else if (status !== undefined && status !== null && status !== '') {
                const numericStatus = Number(status);
                if (Number.isFinite(numericStatus)) {
                        where.status = numericStatus;
                }
        }

        if (jobTitle) {
                where.jobTitle = {
                        [Op.like]: `%${jobTitle.trim()}%`,
                };
        }

        if (owner) {
                where.owner = {
                        [Op.like]: `%${owner.trim()}%`,
                };
        }

        return where;
};

const listRecruitmentPositions = async ({page = 1, pageSize = 20, status, jobTitle, owner}) => {
        const limit = Math.max(Number(pageSize) || 20, 1);
        const offset = (Math.max(Number(page) || 1, 1) - 1) * limit;

        const where = buildFilter({status, jobTitle, owner});

        const {rows, count} = await RecruitmentPositionModel.findAndCountAll({
                where,
                order: [
                        ['startTime', 'DESC'],
                        ['id', 'DESC'],
                ],
                limit,
                offset,
        });

        return {
                list: rows.map((row) => row.get({plain: true})),
                pagination: {
                        page: Number(page) || 1,
                        pageSize: limit,
                        total: count,
                },
        };
};

module.exports = {
        upsertRecruitmentPositions,
        listRecruitmentPositions,
};
