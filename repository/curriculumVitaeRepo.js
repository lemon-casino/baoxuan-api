const {Op} = require('sequelize');
const CurriculumVitaeModel = require('../model/curriculumVitae');

const toPlain = (modelInstance) => {
    if (!modelInstance) {
        return null;
    }
    return modelInstance.get ? modelInstance.get({plain: true}) : modelInstance;
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
        location,
        education,
        seniority,
        salary,
        dateStart,
        dateEnd
    } = filters;

    if (hr) {
        where.hr = {[Op.like]: `%${hr}%`};
    }
    if (name) {
        where.name = {[Op.like]: `%${name}%`};
    }
    if (job) {
        where.job = {[Op.like]: `%${job}%`};
    }
    if (jobSalary) {
        where.jobSalary = {[Op.like]: `%${jobSalary}%`};
    }
    if (latestCorp) {
        where.latestCorp = {[Op.like]: `%${latestCorp}%`};
    }
    if (latestJob) {
        where.latestJob = {[Op.like]: `%${latestJob}%`};
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
    const {page, pageSize} = pagination;
    const where = buildWhereClause(filters);
    const offset = (page - 1) * pageSize;

    const result = await CurriculumVitaeModel.findAndCountAll({
        where,
        order: [
            ['date', 'DESC'],
            ['id', 'DESC']
        ],
        offset,
        limit: pageSize,
        raw: true
    });

    return result;
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

const deleteById = async (id) => {
    return CurriculumVitaeModel.destroy({
        where: {id}
    });
};

module.exports = {
    findAndCountAll,
    create,
    findById,
    updateById,
    deleteById
};
