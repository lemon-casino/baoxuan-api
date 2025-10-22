const curriculumVitaeRepo = require('../repository/curriculumVitaeRepo');
const recruitmentStatisticRepo = require('../repository/recruitment/recruitmentStatisticRepo');
const {logger} = require('../utils/log');

const DEFAULT_SHIP = 8;

const SHIP_SUMMARY_ITEMS = [
        {label: '新候选人', ship: 1},
        {label: '初选通过', ship: 2},
        {label: '安排面试', ship: 3},
        {label: '面试通过', ship: 4},
        {label: '已发offer', ship: 5},
        {label: '待入职', ship: 6},
        {label: '已淘汰', ship: 7},
        {label: '未初始', ship: 8},
];

const NUMERIC_FIELDS = new Set(['gender', 'age', 'filesize', 'ship']);

const allowedFields = [
        'hr',
        'date',
        'job',
	'jobSalary',
	'name',
	'latestCorp',
	'latestJob',
	'gender',
	'ship',
	'age',
	'location',
	'education',
	'seniority',
	'salary',
	'filename',
	'filesize',
	'filepath'
];

const toNumberOrNull = (value) => {
        if (value === undefined || value === null || value === '') {
                return null;
        }
        const numberValue = Number(value);
        return Number.isNaN(numberValue) ? null : numberValue;
};

const normalizePayload = (payload = {}) => {
	const normalized = {};

	for (const field of allowedFields) {
		if (payload[field] !== undefined) {
			const value = payload[field];
			if (value === '') {
				normalized[field] = null;
				continue;
			}
                        if (NUMERIC_FIELDS.has(field)) {
                                normalized[field] = toNumberOrNull(value);
                                continue;
                        }
			if (field === 'date' && value) {
				const dateValue = new Date(value);
				normalized[field] = Number.isNaN(dateValue.getTime()) ? null : dateValue;
				continue;
			}
			normalized[field] = value;
		}
	}

	return normalized;
};

const normalizeFilters = (filters = {}) => {
	const normalized = {...filters};
	if (normalized.gender !== undefined && normalized.gender !== '') {
		const genderNumber = Number(normalized.gender);
		normalized.gender = Number.isNaN(genderNumber) ? undefined : genderNumber;
	} else {
		normalized.gender = undefined;
	}

	if (normalized.ship !== undefined && normalized.ship !== '') {
		const shipNumber = Number(normalized.ship);
		normalized.ship = Number.isNaN(shipNumber) ? undefined : shipNumber;
	} else {
		normalized.ship = undefined;
	}

	if (normalized.dateStart) {
		const start = new Date(normalized.dateStart);
		normalized.dateStart = Number.isNaN(start.getTime()) ? undefined : start;
	}

	if (normalized.dateEnd) {
		const end = new Date(normalized.dateEnd);
		normalized.dateEnd = Number.isNaN(end.getTime()) ? undefined : end;
	}

	return normalized;
};

const list = async (query = {}) => {
        const page = Math.max(parseInt(query.page, 10) || 1, 1);
        const pageSize = Math.max(parseInt(query.pageSize, 10) || 10, 1);
        const filters = normalizeFilters(query);
        console.log(filters)
        const {count, rows} = await curriculumVitaeRepo.findAndCountAll(filters, {page, pageSize});

	return {
		list: rows,
		pagination: {
			page,
			pageSize,
			total: count
		}
	};
};

const toNumberOrNullSafe = (value) => toNumberOrNull(value);

const recordCurriculumVitaeShipStatistic = async (record, previousShip) => {
        if (!record) {
                return;
        }

        const entityId = record.id ? String(record.id) : null;
        const reference = record.contact || null;
        const currentShip = toNumberOrNullSafe(record.ship);
        const nextShip = currentShip ?? DEFAULT_SHIP;
        const normalizedPrevious = toNumberOrNullSafe(previousShip);

        if (normalizedPrevious === nextShip) {
                return;
        }

        const payload = {
                entityType: 'curriculum_vitae',
                entityId,
                reference,
                changeType: 'ship',
                previousShip: normalizedPrevious,
                ship: nextShip,
                recordedAt: new Date(),
                metadata: {
                        name: record.name || null,
                        hr: record.hr || null,
                        job: record.job || null,
                },
        };

        try {
                await recruitmentStatisticRepo.bulkInsertStatistics([payload]);
        } catch (error) {
                logger.error(
                        `[CurriculumVitaeService] failed to record recruitment statistic for curriculum vitae ${entityId || 'unknown'}: ${error.message}`,
                        error
                );
        }
};

const create = async (payload) => {
        const normalized = normalizePayload(payload);
        if (normalized.ship == null) {
                normalized.ship = DEFAULT_SHIP;
        }

        const record = await curriculumVitaeRepo.create(normalized);

        await recordCurriculumVitaeShipStatistic(record, null);

        return record;
};

const getById = async (id) => {
	const record = await curriculumVitaeRepo.findById(id);
	if (!record) {
		const error = new Error('简历记录不存在');
		error.code = 404;
		throw error;
	}
	return record;
};

const update = async (id, payload) => {
        const normalized = normalizePayload(payload);
        if (Object.keys(normalized).length === 0) {
                return getById(id);
        }

        const existing = await curriculumVitaeRepo.findById(id);
        if (!existing) {
                const error = new Error('简历记录不存在');
                error.code = 404;
                throw error;
        }

        const record = await curriculumVitaeRepo.updateById(id, normalized);
        if (!record) {
                const error = new Error('简历记录不存在');
                error.code = 404;
                throw error;
        }

        if (Object.prototype.hasOwnProperty.call(normalized, 'ship')) {
                await recordCurriculumVitaeShipStatistic(record, existing.ship);
        }

        return record;
};

const remove = async (id) => {
	const deleted = await curriculumVitaeRepo.deleteById(id);
	if (!deleted) {
		const error = new Error('简历记录不存在');
		error.code = 404;
		throw error;
	}
	return true;
};
const getFilters = async (query = {}) => {
        return curriculumVitaeRepo.getFilterOptions(query);
};

const parseMonth = (month) => {
        if (!month || typeof month !== 'string') {
                return null;
        }

        const trimmed = month.trim();
        if (!/^\d{4}-\d{2}$/.test(trimmed)) {
                return null;
        }

        const [yearString, monthString] = trimmed.split('-');
        const year = Number(yearString);
        const monthIndex = Number(monthString) - 1;

        if (Number.isNaN(year) || Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
                return null;
        }

        return new Date(year, monthIndex, 1);
};

const getMonthlyShipSummary = async (query = {}) => {
        const referenceDate = parseMonth(query.month) || new Date();
        const startDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
        const endDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1);

        const rows = await curriculumVitaeRepo.getShipCountsByPeriod(startDate, endDate);
        const counts = new Map(rows.map((row) => [row.ship, row.count]));

        return SHIP_SUMMARY_ITEMS.map((item) => ({
                ...item,
                count: counts.get(item.ship) ?? 0,
        }));
};
module.exports = {
        list,
        create,
        getById,
        update,
        remove,
        getFilters,
        getMonthlyShipSummary,
};