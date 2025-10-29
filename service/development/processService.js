const developmentRepo = require('@/repository/development/developmentRepo')
const processService = {}

processService.getById = async (id) => {
    const result = await developmentRepo.getById(id)
    return result?.length ? result[0] : null
}

module.exports = processService;