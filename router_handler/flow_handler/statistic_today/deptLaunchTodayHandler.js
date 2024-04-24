const joiUtil = require("../../../utils/joiUtil")
const flowLaunchedService = require("../../../service/flowLaunchedService")
const statusMapProcessorHub = require("./statusMapProcessorHub")
const biResponse = require("../../../utils/biResponse")

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

const todayDeptLaunchedFlowsStatisticHub = async (req, res, next) => {
    try {
        const status = req.params.status;
        const {deptId, importance} = req.query
        joiUtil.validate({deptId: {value: deptId, schema: joiUtil.commonJoiSchemas.strRequired}})
        const result = await getDeptLaunchedResult(deptId, status, importance)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}
module.exports = {
    getDeptLaunchedResult,
    todayDeptLaunchedFlowsStatisticHub
}