const {Op} = require('sequelize');
const RecruitmentPositionModel = require('@/model/recruitmentPosition');
const UPSERT_FIELDS = [
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
];
const normalizeValue = (value) => {
	if (value === undefined || value === null) {
		return null;
	}
	if (value instanceof Date) {
		return value.getTime();
	}
	return value;
};
const hasDifferences = (existing = {}, incoming = {}) =>
	UPSERT_FIELDS.some((field) => normalizeValue(existing[field]) !== normalizeValue(incoming[field]));
const upsertRecruitmentPositions = async (positions) => {
	if (!Array.isArray(positions) || positions.length === 0) {
		return 0;
	}

	const deduped = new Map();
	positions.forEach((item) => {
		if (item && item.processId) {
			deduped.set(item.processId, item);
		}
	});

	if (deduped.size === 0) {
		return 0;
	}

	const processIds = Array.from(deduped.keys());
	const existingRows = await RecruitmentPositionModel.findAll({
		where: {
			processId: {
				[Op.in]: processIds,
			},
		},
	});

	const existingMap = new Map();
	(existingRows || []).forEach((row) => {
		const plain = row.get({plain: true});
		if (plain?.processId) {
			existingMap.set(plain.processId, plain);
		}
	});

	const payload = [];
	deduped.forEach((incoming, processId) => {
		const existing = existingMap.get(processId);
		if (!existing || hasDifferences(existing, incoming)) {
			payload.push(incoming);
		}
	});

	if (payload.length === 0) {
		return 0;
	}

	await RecruitmentPositionModel.bulkCreate(payload, {
		updateOnDuplicate: UPSERT_FIELDS,
	});

	return payload.length;
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
