const biResponse = require("../../utils/biResponse")
const flowService = require("../../service/flowService")

const getFlowsByIds = async (req, res) => {
    const {ids} = req.query
    if (ids) {
        const idsObj = JSON.parse(ids);
        const flows = await flowService.getFlowsByIds(idsObj)
        return res.send(biResponse.success(flows))
    }

    return res.send(biResponse.serverError())
}

const getTodayFlowsByIds = async (req, res) => {
    const {ids} = req.query
    if (ids) {
        const idsObj = JSON.parse(ids);
        const flows = await flowService.getTodayFlowsByIds(idsObj)
        return res.send(biResponse.success(flows))
    }

    return res.send(biResponse.serverError())
}

module.exports = {
    getFlowsByIds,
    getTodayFlowsByIds
}