const joiUtil = require("../../../utils/joiUtil")
const biResponse = require("../../../utils/biResponse")
const flowJoinedService = require("../../../service/flowJoinedService")
const statusMapProcessorHub = require("./statusMapProcessorHub")

const deptJoinedStatusProcessorMap = {
    "error": {processor: flowJoinedService.getTodayDeptJoinedFlowsStatisticCountOfFlowStatus, mapStatus: "ERROR"},
    "terminated": {
        processor: flowJoinedService.getTodayDeptJoinedFlowsStatisticCountOfFlowStatus,
        mapStatus: "TERMINATED"
    },

    "doing": {processor: flowJoinedService.getTodayDeptJoinedFlowsStatisticCountOfReviewType, mapStatus: "TODO"},
    "completed": {
        processor: flowJoinedService.getTodayDeptJoinedFlowsStatisticCountOfReviewType,
        mapStatus: "HISTORY"
    },
    "waiting": {
        processor: flowJoinedService.getTodayDeptJoinedFlowsStatisticCountOfReviewType,
        mapStatus: "FORCAST"
    },
    "overdue": {processor: flowJoinedService.getTodayDeptJoinedFlowsStatisticCountOfOverDue}
}

const getDeptJoinedResult = async (deptId, status, importance) => {
    const result = await statusMapProcessorHub.convert(deptJoinedStatusProcessorMap, deptId, status, importance)
    return result
}

const todayDeptJoinedFlowsStatisticHub = async (req, res, next) => {
    try {
        const status = req.params.status;
        const {deptId, importance} = req.query
        joiUtil.validate({deptId: {value: deptId, schema: joiUtil.commonJoiSchemas.required}})
        const result = await getDeptJoinedResult(deptId, status, importance)

        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getDeptJoinedResult,
    todayDeptJoinedFlowsStatisticHub
}