const joi = require("joi")
const biResponse = require("../../utils/biResponse")
const flowService = require("../../service/flowService")
const joiUtil = require("../../utils/joiUtil")

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
        const {ids, emergency} = req.body
        joiUtil.validate([
                {emergency: {value: emergency, schema: joi.string().required()}},
                {ids: {value: ids, schema: joi.string().required()}}
            ]
        )
        await flowService.updateRunningFlowEmergency(ids, emergency)
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getFlowsByIds,
    getTodayFlowsByIds,
    updateRunningFlowEmergency
}