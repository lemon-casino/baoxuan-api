const processService = require('../service/development/processService');
const { success } = require('../utils/biResponse');

const handleError = (res, error) => {
    if (error.code === 404) {
        return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: error.message });
};

const getById = async (req, res) => {
    try {
        const record = await processService.getById(req.query.id);
        return res.send(success(record));
    } catch (error) {
        return handleError(res, error);
    }
};


module.exports = {
    getById
};
