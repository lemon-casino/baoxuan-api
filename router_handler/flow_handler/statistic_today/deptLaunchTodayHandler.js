const flowLaunchedService = require("../../../service/flowLaunchedService")
const statusMapProcessorHub = require("./statusMapProcessorHub")
const biResponse = require("../../../utils/biResponse")
const departmentService = require("../../../service/departmentService")

const deptLaunchedStatusProcessorMap = {
    "error": {processor: flowLaunchedService.getTodayDeptLaunchedFlowsStatisticCountOfFlowStatus, mapStatus: "ERROR"},
    "terminated": {
        processor: flowLaunchedService.getTodayDeptLaunchedFlowsStatisticCountOfFlowStatus,
        mapStatus: "TERMINATED"
    },
    "doing": {processor: flowLaunchedService.getTodayDeptLaunchedFlowsStatisticCountOfFlowStatus, mapStatus: "RUNNING"},
    "completed": {
        processor: flowLaunchedService.getTodayDeptLaunchedFlowsStatisticCountOfFlowStatus,
        mapStatus: "COMPLETED"
    },

    "waiting": {
        processor: flowLaunchedService.getTodayDeptLaunchedFlowsStatisticCountOfReviewType,
        mapStatus: "FORCAST"
    },

    "overdue": {processor: flowLaunchedService.getTodayDeptLaunchedFlowsStatisticCountOfOverDue}
}

const getDeptLaunchedResult = async (deptId, status, importance) => {
    const result = await statusMapProcessorHub.convert(deptLaunchedStatusProcessorMap, deptId, status, importance)
    return result;
}

const todayDeptLaunchedFlowsStatisticHub = async (req, res) => {
    const status = req.params.status;
    const {deptId, importance} = req.query
    const result = await getDeptLaunchedResult(deptId, status, importance)
    if (result != null) {
        return res.send(biResponse.success(result))
    }
    return res.send(biResponse.serverError(`请求的状态：${status}不可用`))
}
module.exports = {
    getDeptLaunchedResult,
    todayDeptLaunchedFlowsStatisticHub
}