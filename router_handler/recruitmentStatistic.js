const recruitmentStatisticService = require('@/service/recruitmentStatisticService');
const {success} = require('@/utils/biResponse');

const handleError = (res, error) => {
        return res.status(500).json({message: error.message});
};

const getCurriculumVitaeShipStatistics = async (req, res) => {
        try {
                const result = await recruitmentStatisticService.getCurriculumVitaeShipStatistics(req.query);
                return res.send(success(result));
        } catch (error) {
                return handleError(res, error);
        }
};

module.exports = {
        getCurriculumVitaeShipStatistics,
};
