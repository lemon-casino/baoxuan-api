const ProcessModel = require("../model/process")
const FlowReview = require("../model/flowformreview")
const reviewUtil = require("../utils/reviewUtil")
const redisUtil = require("../utils/redisUtil")
const dingDingData = require("../service/dingDingService")
const processReviewService = require("../service/prcessReviewService")
const dingDingService = require("../service/dingDingService")

const {redisKeys} = require("../const/redisConst")

const syncProcessReviewInDb = async () => {
    const allProcesses = await ProcessModel.getProcessList();
    for (let process of allProcesses) {
        if (!process.review_id) {
            const reviewRequirements = await FlowReview.getFlowFormReviewList(process.formUuid)
            // 获取指定form的最新的审核要求
            if (reviewRequirements && reviewRequirements.form_review) {
                process = await reviewUtil.addCostToReviewOfFlow(process, reviewRequirements.form_review)
                process.review_id = reviewRequirements.id
                await ProcessModel.updateProcess(process)
            }
        }
    }
}

const extractProcessReviewToAloneTale = async () => {
    const allProcesses = await ProcessModel.getProcessList();
    // for (const process of allProcesses) {
    if (allProcesses[0].overallprocessflow) {
        const reviewItems = allProcesses[0].overallprocessflow;
        for (const reviewItem of reviewItems) {
            const keyMap = {
                processInstanceId: "processId",
                operateTimeGMT: "operateTime",
                taskHoldTimeGMT: "taskHoldTime",
            }
            for (const key of Object.keys(keyMap)) {
                if (Object.keys(reviewItem).includes(key)) {
                    reviewItem[keyMap[key]] = reviewItem[key];
                }
            }
            const result = await processReviewService.saveProcessReview(reviewItem)
            console.log("--")
        }
    }
    // }
}

const initRedis = async () => {
    await dingDingData.getDingDingToken();
    await dingDingData.getDepartmentFromDingDing();
    await dingDingData.getAllFinishedFlowsBeforeToday();
    await dingDingData.getAllNotFinishedFlowsBeforeToday();
    await dingDingData.combineAllFlows();
    await dingDingData.getAllFlowsOfToday();
    await dingDingData.getUsersDetailFromDingDing();
    await dingDingData.getUsersFromDingDing();
}

const getFlowsOfRunningAndFinishedOfToday = async () => {
    console.log("------- getFlowsOfRunningAndFinishedOfToday ------")
    const flows = await dingDingService.getFlowsOfRunningAndFinishedOfToday()
    console.log("------- getFlowsOfRunningAndFinishedOfToday  sum ------", flows.length)
    const result = await redisUtil.setKey(redisKeys.FlowsOfRunningAndFinishedOfToday, JSON.stringify(flows))
}



const dingDingReq = require("../core/dingDingReq")
const testGetDingDingInstances = async () => {
    const result = await dingDingReq.getFlowsOfStatus("COMPLETED",
        "a0c2bf3c1a2039b2bf4f6bfc76dd5eff",
        "073105202321093148",
        "FORM-4IA668916HKCDJ2O9KPRFBWT069H3F08AJ6KL6",
        1,10)
    console.log("---hello world---")
}
testGetDingDingInstances()

// dingDingData.getUsersFromDingDing()
// dingDingData.getUsersDetailFromDingDing();
// dingDingData.getDingDingToken();
// dingDingData.getDepartmentFromDingDing();
// getFlowsOfRunningAndFinishedOfToday()

// initRedis()

// syncProcessReviewInDb()

// extractProcessReviewToAloneTale()
