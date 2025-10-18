const curriculumVitaeRepo = require('../repository/curriculumVitaeRepo');

const allowedFields = [
    'hr',
    'date',
    'job',
    'jobSalary',
    'name',
    'latestCorp',
    'latestJob',
    'gender',
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
            if (['gender', 'age', 'filesize'].includes(field)) {
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

const create = async (payload) => {
    const normalized = normalizePayload(payload);
    return curriculumVitaeRepo.create(normalized);
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
    const record = await curriculumVitaeRepo.updateById(id, normalized);
    if (!record) {
        const error = new Error('简历记录不存在');
        error.code = 404;
        throw error;
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

module.exports = {
    list,
    create,
    getById,
    update,
    remove
};
