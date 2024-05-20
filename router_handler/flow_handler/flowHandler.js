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
        joiUtil.validate(
            {
                emergency: {value: emergency, schema: joiUtil.commonJoiSchemas.strRequired},
                ids: {value: ids, schema: joiUtil.commonJoiSchemas.arrayRequired}
            }
        )
        await flowService.updateRunningFlowEmergency(ids, emergency)
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

const getCoreDataByType = async (req, res, next) => {
    try {
        const {deptId, startDate, endDate} = req.query

        joiUtil.validate({
            deptId: {value: deptId, schema: joiUtil.commonJoiSchemas.required}
        })
        let result = []
        if (req.params.type === "action") {
            const userNames = req.query.userNames
            joiUtil.validate({
                userNames: {value: userNames, schema: joiUtil.commonJoiSchemas.strRequired}
            })
            result = await flowService.getCoreActionData(deptId, userNames, startDate, endDate)
        } else {
            // const userId = req.user.id
            const userNames = req.query.userNames
            joiUtil.validate({
                userNames: {value: userNames, schema: joiUtil.commonJoiSchemas.strRequired}
            })
            result = await flowService.getCoreFlowData(deptId, userNames, startDate, endDate)
        }
        res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getFlowsByIds,
    getTodayFlowsByIds,
    updateRunningFlowEmergency,
    getCoreDataByType
}