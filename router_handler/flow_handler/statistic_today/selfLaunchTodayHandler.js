const flowLaunchedService = require("../../../service/flowLaunchedService")
const statusMapProcessorHub = require("./statusMapProcessorHub")
const biResponse = require("../../../utils/biResponse")
const userService = require("../../../service/userService")

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

const getSelfLaunchedResult = async (userId, status, importance) => {
    const ddUserId = await userService.getDingDingUserId(userId);
    const result = await statusMapProcessorHub.convert(selfLaunchedStatusProcessorMap, ddUserId, status, importance)
    return result
}

const todaySelfLaunchedFlowsStatisticHub = async (req, res) => {
    const status = req.params.status;
    const {importance} = req.query
    const result = await getSelfLaunchedResult(req.user.id, status, importance)
    if (result != null) {
        return res.send(biResponse.success(result))
    }
    return res.send(biResponse.format("500", `请求的状态：${status}不可用`))
}
module.exports = {
    getSelfLaunchedResult,
    todaySelfLaunchedFlowsStatisticHub
}