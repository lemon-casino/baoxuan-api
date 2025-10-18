const curriculumVitaeService = require('../service/curriculumVitaeService');
const {success} = require('../utils/biResponse');

const handleError = (res, error) => {
    const statusCode = Number(error.code);

    if (Number.isInteger(statusCode) && statusCode >= 400 && statusCode < 600) {
        return res.status(statusCode).json({message: error.message});
    }

    return res.status(500).json({message: error.message || '服务器内部错误'});
};

const listCurriculumVitae = async (req, res) => {
    try {
        const result = await curriculumVitaeService.list(req.query);
        return res.send(success(result));
    } catch (error) {
        return handleError(res, error);
    }
};

const createCurriculumVitae = async (req, res) => {
    try {
        const record = await curriculumVitaeService.create(req.body);
        return res.send(success(record));
    } catch (error) {
        return handleError(res, error);
    }
};

const getCurriculumVitae = async (req, res) => {
    try {
        const record = await curriculumVitaeService.getById(req.params.id);
        return res.send(success(record));
    } catch (error) {
        return handleError(res, error);
    }
};

const updateCurriculumVitae = async (req, res) => {
    try {
        const record = await curriculumVitaeService.update(req.params.id, req.body);
        return res.send(success(record));
    } catch (error) {
        return handleError(res, error);
    }
};

const removeCurriculumVitae = async (req, res) => {
    try {
        await curriculumVitaeService.remove(req.params.id);
        return res.send(success(true));
    } catch (error) {
        return handleError(res, error);
    }
};

const previewCurriculumVitae = async (req, res) => {
    try {
        const {filepath} = req.query;
        const {stream, filename, length, contentType} = await curriculumVitaeService.getPdfPreview(filepath);

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);
        if (length) {
            res.setHeader('Content-Length', length);
        }

        stream.on('error', (error) => {
            res.destroy(error);
        });

        return stream.pipe(res);
    } catch (error) {
        return handleError(res, error);
    }
};

const getCurriculumVitaeFilters = async (req, res) => {
    try {
        const filters = await curriculumVitaeService.getFilters();
        return res.send(success(filters));
    } catch (error) {
        return handleError(res, error);
    }
};

module.exports = {
    listCurriculumVitae,
    createCurriculumVitae,
    getCurriculumVitae,
    updateCurriculumVitae,
    removeCurriculumVitae,
    previewCurriculumVitae,
    getCurriculumVitaeFilters
};
