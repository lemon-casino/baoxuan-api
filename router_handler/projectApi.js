const biResponse = require("@/utils/biResponse")
const projectService = require('@/service/projectService')
const projectApi = {}

projectApi.getList = async (req, res, next) => {
    try {
        const result = await projectService.getList()
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

module.exports = projectApi