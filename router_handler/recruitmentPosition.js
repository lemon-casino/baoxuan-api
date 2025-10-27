const recruitmentPositionService = require('../service/recruitmentPositionService');
const {success} = require('../utils/biResponse');

const listRecruitmentPositions = async (req, res) => {
        try {
                const result = await recruitmentPositionService.listRecruitmentPositions(req.query);
                return res.send(success(result));
        } catch (error) {
                return res.status(500).json({message: error.message});
        }
};

module.exports = {
        listRecruitmentPositions,
};
