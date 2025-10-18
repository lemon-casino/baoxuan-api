const projectInfoRepo = require('@/repository/operation/projectInfoRepo')
const projectService = {}

projectService.getList = async () => {
    let result = await projectInfoRepo.getInfo()
    return result
}

module.exports = projectService