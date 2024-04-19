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
    const {ids} = req.body
    if (ids && ids.length > 0) {
        const flows = await flowService.getTodayFlowsByIds(ids)
        return res.send(biResponse.success(flows))
    }

    return res.send(biResponse.serverError())
}

// 更新 Redis 中正在进行中的流程的紧急程度
const updateRunningFlowEmergency = async (req, res, next) => {
    try {
        const {ids, } = req.body

        flowService.updateRunningFlowEmergency()
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getFlowsByIds,
    getTodayFlowsByIds,
    updateRunningFlowEmergency
}