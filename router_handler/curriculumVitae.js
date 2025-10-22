const curriculumVitaeService = require('../service/curriculumVitaeService');
const {success} = require('../utils/biResponse');

const handleError = (res, error) => {
        if (error.code === 404) {
                return res.status(404).json({message: error.message});
        }
        return res.status(500).json({message: error.message});
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

const getCurriculumVitaeFilters = async (req, res) => {
        try {
                const filters = await curriculumVitaeService.getFilters(req.query);
                return res.send(success(filters));
        } catch (error) {
                return handleError(res, error);
        }
};

const getMonthlyShipSummary = async (req, res) => {
        try {
                const summary = await curriculumVitaeService.getMonthlyShipSummary(req.query);
                return res.send(success(summary));
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
        getCurriculumVitaeFilters,
        getMonthlyShipSummary,
};
