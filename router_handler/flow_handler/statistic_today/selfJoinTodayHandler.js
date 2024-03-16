const biResponse = require("../../../utils/biResponse")
const flowJoinedService = require("../../../service/flowJoinedService")
const statusMapProcessorHub = require("./statusMapProcessorHub")

const selfJoinedStatusProcessorMap = {
    "error": {processor: flowJoinedService.getTodaySelfJoinedFlowsStatisticCountOfFlowStatus, mapStatus: "ERROR"},
    "terminated": {
        processor: flowJoinedService.getTodaySelfJoinedFlowsStatisticCountOfFlowStatus,
        mapStatus: "TERMINATED"
    },

    "doing": {processor: flowJoinedService.getTodaySelfJoinedFlowsStatisticCountOfReviewType, mapStatus: "TODO"},
    "completed": {processor: flowJoinedService.getTodaySelfJoinedFlowsStatisticCountOfReviewType, mapStatus: "HISTORY"},
    "waiting": {processor: flowJoinedService.getTodaySelfJoinedFlowsStatisticCountOfReviewType, mapStatus: "FORCAST"},

    "overdue": {processor: flowJoinedService.getTodaySelfJoinedFlowsStatisticCountOfOverDue}
}

const todaySelfJoinedFlowsStatisticHub = async (req, res) => {
    const status = req.params.status;
    const {importance} = req.query
    const result = await statusMapProcessorHub.convert(selfJoinedStatusProcessorMap, req.user.id, importance, status)
    if (result != null) {
        return res.send(biResponse.success(result))
    }
    return res.send(biResponse.format("500", `请求的状态：${status}不可用`))
}

module.exports = {
    todaySelfJoinedFlowsStatisticHub
}