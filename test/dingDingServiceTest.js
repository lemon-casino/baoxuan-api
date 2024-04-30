const dingDingService = require("../service/dingDingService")
const taskService = require("../service/taskService")

describe("", () => {
    it("getFlowsOfStatusAndTimeRange", async () => {
        const result = await dingDingService.getFlowsOfStatusAndTimeRange()
        console.log(result)
    })
    it("syncTodayRunningAndFinishedFlows", async () => {
        await taskService.syncTodayRunningAndFinishedFlows()
    })
    it("syncMissingCompletedFlows", async () => {
        await taskService.syncMissingCompletedFlows()
    })
})