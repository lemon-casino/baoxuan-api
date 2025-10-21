const {Op} = require('sequelize');
const CurriculumVitaeModel = require('../model/curriculumVitae');

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

	return CurriculumVitaeModel.findAndCountAll({
		where,
		order: [
			["date", "DESC"],
			["id", "DESC"],
		],
		offset,
		limit: pageSize,
		raw: true,
		logging: true,
	})
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

const updateShipByContact = async (contact, ship, name) => {
        if (typeof contact !== 'string' || contact.trim().length === 0 || typeof ship !== 'number') {
                return 0;
        }

        const normalizedContact = contact.trim();
        const trimmedName = typeof name === 'string' ? name.trim() : '';

        const updatePayload = {ship};
        if (trimmedName) {
                updatePayload.name = trimmedName;
        }

        const [affectedRows] = await CurriculumVitaeModel.update(
                updatePayload,
                {
                        where: {
                                contact: {
                                        [Op.like]: `%${normalizedContact}%`
                                }
                        }
                }
        );

        return affectedRows;
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
        getShipCountsByPeriod,
};
