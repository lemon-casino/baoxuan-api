const {Op} = require('sequelize');
const CurriculumVitaeModel = require('../model/curriculumVitae');
const { query:querydb1 } = require('../model/bpmDbConn')
const { query:querydb2 } = require('../model/dbConn')
const CONTACT_SPLIT_REGEX = /[\s,;；，、|/\\]+/u;
const MIN_LIKE_TOKEN_LENGTH = 3;
const MIN_DIGIT_TOKEN_LENGTH = 6;

const escapeLikePattern = (value) => value.replace(/([%_\\])/g, '\\$1');

const toDigits = (value) => value.replace(/\D+/g, '');

const buildDigitRegex = (digits) => digits.split('').map((digit) => `${digit}\\D*`).join('');

const supportsRegexp = () => {
	const dialect = CurriculumVitaeModel?.sequelize?.getDialect?.();
	if (!dialect) {
		return false;
	}
	return ['mysql', 'mariadb', 'postgres'].includes(dialect);
};

const extractContactTokens = (rawValue = '') => {
        if (typeof rawValue !== 'string') {
                return [];
        }

	const trimmed = rawValue.trim();
	if (!trimmed) {
		return [];
	}

	const tokens = new Set([trimmed]);
	trimmed.split(CONTACT_SPLIT_REGEX).forEach((part) => {
		const token = part.trim();
		if (token) {
			tokens.add(token);
		}
	});

	return Array.from(tokens);
};

const buildContactMatchers = (contact) => {
	const tokens = extractContactTokens(contact);
	if (tokens.length === 0) {
		return [];
	}

	const likePatterns = new Set();
	const regexPatterns = new Set();

	tokens.forEach((token) => {
		const digits = toDigits(token);
		if (!token.includes('@') && digits.length >= MIN_DIGIT_TOKEN_LENGTH) {
			regexPatterns.add(buildDigitRegex(digits));
		}

		if (token.length >= MIN_LIKE_TOKEN_LENGTH) {
			likePatterns.add(escapeLikePattern(token));
		}
	});

	const normalizedContact = typeof contact === 'string' ? contact.trim() : '';
	if (normalizedContact) {
		likePatterns.add(escapeLikePattern(normalizedContact));
	}

	const matchers = Array.from(likePatterns).map((pattern) => ({
		contact: {
			[Op.like]: `%${pattern}%`
		}
	}));

	if (supportsRegexp()) {
		regexPatterns.forEach((pattern) => {
			matchers.push({
				contact: {
					[Op.regexp]: pattern
				}
			});
		});
	}

	return matchers;
};

const toPlain = (modelInstance) => {
	if (!modelInstance) {
		return null;
	}
	return modelInstance.get ? modelInstance.get({plain: true}) : modelInstance;
};
const normalizeStringList = (value) => {
	if (Array.isArray(value)) {
		return value
			.map((item) => (typeof item === 'string' ? item.trim() : item))
			.filter((item) => typeof item === 'string' && item.length > 0);
	}

	if (typeof value === 'string') {
		const trimmed = value.trim();
		return trimmed ? [trimmed] : [];
	}

	return [];
};
const appendLikeFilter = (where, field, value) => {
	const values = normalizeStringList(value);
	if (values.length === 0) {
		return;
	}

	if (values.length === 1) {
		where[field] = {[Op.like]: `%${values[0]}%`};
		return;
	}

	if (!where[Op.and]) {
		where[Op.and] = [];
	}

	where[Op.and].push({
		[Op.or]: values.map((entry) => ({[field]: {[Op.like]: `%${entry}%`}}))
	});
};

const buildWhereClause = (filters = {}) => {
	const where = {};
	const {
		hr,
		name,
		job,
		jobSalary,
		latestCorp,
		latestJob,
		gender,
		ship,
		location,
		education,
		seniority,
		salary,
		dateStart,
		dateEnd
	} = filters;

	appendLikeFilter(where, 'hr', hr);
	appendLikeFilter(where, 'name', name);
	appendLikeFilter(where, 'job', job);
	if (jobSalary) {
		where.jobSalary = {[Op.like]: `%${jobSalary}%`};
	}
	if (latestCorp) {
		where.latestCorp = {[Op.like]: `%${latestCorp}%`};
	}
	if (latestJob) {
		where.latestJob = {[Op.like]: `%${latestJob}%`};
	}
	if (typeof ship === 'number') {
		where.ship = ship;
	}
	if (typeof gender === 'number') {
		where.gender = gender;
	}
	if (location) {
		where.location = {[Op.like]: `%${location}%`};
	}
	if (education) {
		where.education = {[Op.like]: `%${education}%`};
	}
	if (seniority) {
		where.seniority = {[Op.like]: `%${seniority}%`};
	}
	if (salary) {
		where.salary = {[Op.like]: `%${salary}%`};
	}
	if (dateStart && dateEnd) {
		where.date = {[Op.between]: [dateStart, dateEnd]};
	} else if (dateStart) {
		where.date = {[Op.gte]: dateStart};
	} else if (dateEnd) {
		where.date = {[Op.lte]: dateEnd};
	}

	return where;
};
const findAndCountAll = async (filters, pagination) => {
	const { page, pageSize } = pagination
	const where = buildWhereClause(filters)
	const offset = (page - 1) * pageSize
	let result = {}
	let subsql = `SELECT 
				a.id, a.hr, a.date, a.job, a.job_salary, a.name, 
				a.contact, a.latest_corp, a.latest_job , 
				a.gender, a.age, a.location, a.education, a.seniority, a.salary, 
				a.filename, a.filesize, a.filepath, a.ship,
				ROW_NUMBER() OVER (
					PARTITION BY hr, name, contact 
					ORDER BY date DESC,id DESC
				) as rn
			FROM bi_serve.curriculum_vitae AS a 
			LEFT JOIN bi_serve.recruitment AS b
			ON a.hr = b.hr AND a.name = b.candidate
			WHERE ship = ${where.ship} AND b.hr IS NOT NULL`
	if (where.ship == 8){
		subsql = `SELECT 
				id, hr, date, job, job_salary AS jobSalary, name, 
				contact, latest_corp AS latestCorp, latest_job AS latestJob, 
				gender, age, location, education, seniority, salary, 
				filename, filesize, filepath, ship,
				ROW_NUMBER() OVER (
					PARTITION BY hr, name, contact 
					ORDER BY date DESC,id DESC
				) as rn
			FROM bi_serve.curriculum_vitae `
	} else if(where.ship == 1){
		subsql = `SELECT 
				a.id, a.hr, a.date, a.job, a.job_salary, a.name, 
				a.contact, a.latest_corp, a.latest_job , 
				a.gender, a.age, a.location, a.education, a.seniority, a.salary, 
				a.filename, a.filesize, a.filepath, a.ship,
				ROW_NUMBER() OVER (
					PARTITION BY hr, name, contact 
					ORDER BY date DESC,id DESC
				) as rn
			FROM bi_serve.curriculum_vitae AS a 
			LEFT JOIN bi_serve.recruitment AS b
			ON a.hr = b.hr AND a.name = b.candidate
			WHERE ship != 8 AND b.hr IS NOT NULL`
	}
	let sql = `SELECT * FROM (
			${subsql}
		) ranked
		WHERE rn = 1
		ORDER BY date DESC, id DESC LIMIT ${offset}, ${pageSize}`
	let sql1 = `SELECT count(*) as count FROM (
			${subsql}
		) ranked
		WHERE rn = 1`
	let data = await querydb1(sql)
	let count = await querydb1(sql1)
	result.data = data
	result.count = count
	return result
}
const findContactsByFilters = async (filters = {}) => {
	const where = buildWhereClause(filters);
	const rows = await CurriculumVitaeModel.findAll({
		attributes: ['contact'],
		where,
		raw: true,
	});

	return rows
		.map((row) => row.contact)
		.filter((contact) => typeof contact === 'string' && contact.trim().length > 0);
};

const create = async (payload) => {
        const record = await CurriculumVitaeModel.create(payload);
        return toPlain(record);
};

const findById = async (id) => {
	const record = await CurriculumVitaeModel.findByPk(id);
	return toPlain(record);
};

const updateById = async (id, payload) => {
	const record = await CurriculumVitaeModel.findByPk(id);
	if (!record) {
		return null;
	}
	await record.update(payload);
	return toPlain(record);
};

const updateShipByContact = async (contact, ship, name, options = {}) => {
        if (typeof contact !== 'string' || contact.trim().length === 0 || typeof ship !== 'number') {
                return {
                        matchedCount: 0,
                        affectedRows: 0,
                        changedRecords: [],
		};
	}

	const normalizedContact = contact.trim();
	const trimmedName = typeof name === 'string' ? name.trim() : '';

	const matchers = buildContactMatchers(normalizedContact);
	if (matchers.length === 0) {
		return {
			matchedCount: 0,
			affectedRows: 0,
			changedRecords: [],
		};
	}

        const existingRows = await CurriculumVitaeModel.findAll({
                attributes: ['id', 'ship', 'name', 'allowSync'],
                where: {
                        [Op.or]: matchers,
                },
                raw: true,
        });

        const matchedCount = existingRows.length;
        const updatableRows = existingRows.filter((row) => {
                const {allowSync} = row;
                if (allowSync === undefined || allowSync === null) {
                        return true;
                }

                if (typeof allowSync === 'number') {
                        return allowSync !== 0;
                }

                if (typeof allowSync === 'string') {
                        return allowSync !== '0';
                }

                return allowSync !== false;
        });

        if (matchedCount === 0 || updatableRows.length === 0) {
                return {
                        matchedCount,
                        affectedRows: 0,
                        changedRecords: [],
                };
        }

	const normalizeShipValue = (value) => {
		if (value === null || value === undefined) {
			return null;
		}

		if (typeof value === 'number') {
			return value;
		}

		const numericValue = Number(value);
		return Number.isNaN(numericValue) ? null : numericValue;
	};

        const rowsToUpdate = updatableRows.filter((row) => normalizeShipValue(row.ship) !== ship);
        const requiresNameUpdate = Boolean(
                trimmedName &&
                updatableRows.some((row) => {
                        if (typeof row.name !== 'string') {
                                return true;
                        }

                        return row.name.trim() !== trimmedName;
		})
	);

	const idsToUpdate = Array.from(
		new Set([
                        ...rowsToUpdate.map((row) => row.id),
                        ...(requiresNameUpdate ? updatableRows.map((row) => row.id) : []),
                ])
        ).filter((id) => id !== undefined && id !== null);

        if (idsToUpdate.length === 0) {
                return {
			matchedCount,
			affectedRows: 0,
			changedRecords: [],
		};
	}

        const updatePayload = {ship};
        if (trimmedName) {
                updatePayload.name = trimmedName;
        }

        if (options.lockSync) {
                updatePayload.allowSync = false;
        }

        const [affectedRows] = await CurriculumVitaeModel.update(updatePayload, {
                where: {
                        id: {
                                [Op.in]: idsToUpdate,
                        },
                        allowSync: {
                                [Op.notIn]: [false, 0, '0'],
                        },
                },
        });

        const changedRecords = rowsToUpdate.map((row) => ({
                id: row.id,
		previousShip: normalizeShipValue(row.ship),
	}));

        return {
                matchedCount,
                affectedRows,
                changedRecords,
        };
};

const hasContactMatch = async (contact) => {
        if (typeof contact !== 'string') {
                return false;
        }

        const trimmed = contact.trim();
        if (!trimmed) {
                return false;
        }

        const matchers = buildContactMatchers(trimmed);
        if (matchers.length === 0) {
                return false;
        }

        const count = await CurriculumVitaeModel.count({
                where: {
                        [Op.or]: matchers,
                },
        });

        return count > 0;
};

const SHIP_VALUES = [1, 2, 3, 4, 5, 6, 7, 8];

const getShipCountsByPeriod = async (startDate, endDate) => {
	const {sequelize} = CurriculumVitaeModel;

	const where = {
		ship: {
			[Op.in]: SHIP_VALUES,
		},
	};

	if (startDate || endDate) {
		where.date = {};

		if (startDate) {
			where.date[Op.gte] = startDate;
		}

		if (endDate) {
			where.date[Op.lt] = endDate;
		}
	}

	const rows = await CurriculumVitaeModel.findAll({
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

const deleteById = async (id) => {
	return CurriculumVitaeModel.destroy({
		where: {id}
	});
};

const normalizeSearchValue = (value) => {
	if (Array.isArray(value)) {
		for (const entry of value) {
			if (typeof entry === 'string' && entry.trim().length > 0) {
				return entry.trim();
			}
		}
		return undefined;
	}

	if (typeof value === 'string') {
		const trimmed = value.trim();
		return trimmed.length > 0 ? trimmed : undefined;
	}

	return undefined;
};
const buildDistinctWhere = (field, keyword) => {
	const conditions = [
		{[field]: {[Op.ne]: null}},
		{[field]: {[Op.ne]: ''}}
	];

	if (keyword) {
		conditions.push({[field]: {[Op.like]: `%${keyword}%`}});
	}

	return {[Op.and]: conditions};
};
const getDistinctValues = async (field, keyword) => {
	const {sequelize} = CurriculumVitaeModel;
	const records = await CurriculumVitaeModel.findAll({
		attributes: [[sequelize.fn('DISTINCT', sequelize.col(field)), field]],
		where: buildDistinctWhere(field, normalizeSearchValue(keyword)),
		raw: true
	});

	const uniqueValues = records
		.map((record) => record[field])
		.filter((value) => typeof value === 'string')
		.map((value) => value.trim())
		.filter((value) => value.length > 0);

	return Array.from(new Set(uniqueValues)).sort((a, b) => a.localeCompare(b));
};
const getFilterOptions = async (query = {}) => {
	const [hr, job, name] = await Promise.all([
		getDistinctValues('hr', query.hr),
		getDistinctValues('job', query.job),
		getDistinctValues('name', query.name)
	]);

	return {hr, job, name};
};
module.exports = {
        findAndCountAll,
        create,
        findById,
        updateById,
        deleteById,
        getFilterOptions,
        updateShipByContact,
        hasContactMatch,
        getShipCountsByPeriod,
        extractContactTokens,
};
