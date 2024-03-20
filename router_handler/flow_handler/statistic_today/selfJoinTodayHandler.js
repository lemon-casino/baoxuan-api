const biResponse = require("../../../utils/biResponse")
const flowJoinedService = require("../../../service/flowJoinedService")
const statusMapProcessorHub = require("./statusMapProcessorHub")
const userService = require("../../../service/userService")

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

const getSelfJoinedResult = async (userId, status, importance) => {
    const ddUserId = await userService.getDingDingUserId(userId);
    const result = await statusMapProcessorHub.convert(selfJoinedStatusProcessorMap, ddUserId, status, importance)
    return result;
}

const todaySelfJoinedFlowsStatisticHub = async (req, res) => {
    const status = req.params.status;
    const {importance} = req.query
    // todo: 需要返回前端直接从user中取
    const result = await getSelfJoinedResult(req.user.id, status, importance)
    if (result != null) {
        return res.send(biResponse.success(result))
    }
    return res.send(biResponse.format("500", `请求的状态：${status}不可用`))
}

module.exports = {
    getSelfJoinedResult,
    todaySelfJoinedFlowsStatisticHub
}