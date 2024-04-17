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

const todayDeptJoinedFlowsStatisticHub = async (req, res) => {
    const status = req.params.status;
    const {deptId, importance} = req.query
    const result = await getDeptJoinedResult(deptId, status, importance)
    if (result != null) {
        return res.send(biResponse.success(result))
    }
    return res.send(biResponse.serverError(`请求的状态：${status}不可用`))
}

module.exports = {
    getDeptJoinedResult,
    todayDeptJoinedFlowsStatisticHub
}