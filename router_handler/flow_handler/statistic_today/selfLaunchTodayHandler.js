const flowLaunchedService = require("../../../service/flowLaunchedService")
const statusMapProcessorHub = require("./statusMapProcessorHub")
const biResponse = require("../../../utils/biResponse")

const selfLaunchedStatusProcessorMap = {
    "error": {processor: flowLaunchedService.getTodaySelfLaunchedFlowsStatisticCountOfFlowStatus, mapStatus: "ERROR"},
    "terminated": {
        processor: flowLaunchedService.getTodaySelfLaunchedFlowsStatisticCountOfFlowStatus,
        mapStatus: "TERMINATED"
    },
    "doing": {processor: flowLaunchedService.getTodaySelfLaunchedFlowsStatisticCountOfFlowStatus, mapStatus: "RUNNING"},
    "completed": {
        processor: flowLaunchedService.getTodaySelfLaunchedFlowsStatisticCountOfFlowStatus,
        mapStatus: "COMPLETED"
    },

    "waiting": {
        processor: flowLaunchedService.getTodaySelfLaunchedFlowsStatisticCountOfReviewType,
        mapStatus: "FORCAST"
    },

    "overdue": {processor: flowLaunchedService.getTodaySelfLaunchedFlowsStatisticCountOfOverDue}
}

const todaySelfLaunchedFlowsStatisticHub = async (req, res) => {
    const status = req.params.status;
    const {importance} = req.query
    const result = await statusMapProcessorHub.convert(selfLaunchedStatusProcessorMap, req.user.id, importance, status)
    if (result != null) {
        return res.send(biResponse.success(result))
    }
    return res.send(biResponse.format("500", `请求的状态：${status}不可用`))
}
module.exports = {
    todaySelfLaunchedFlowsStatisticHub
}