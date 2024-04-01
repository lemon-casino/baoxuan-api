const ProcessModel = require("../model/process")
const FlowReview = require("../model/flowformreview")
const reviewUtil = require("../utils/reviewUtil")
const redisUtil = require("../utils/redisUtil")
const dateUtil = require("../utils/dateUtil")
const dingDingData = require("../service/dingDingService")
const processReviewService = require("../service/prcessReviewService")
const dingDingService = require("../service/dingDingService")
const processService = require("../service/processService")
const globalSetter = require("../global/setter")

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
            await processReviewService.saveProcessReview(reviewItem)
        }
    }
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

const getTodayRunningAndFinishedFlows = async () => {
    const flows = await dingDingService.getTodayRunningAndFinishedFlows()
    await redisUtil.setKey(redisKeys.FlowsOfRunningAndFinishedOfToday, JSON.stringify(flows))
    globalSetter.setGlobalTodayRunningAndFinishedFlows(flows)
}

processService.correctStrFieldToJson();

// 同步3.21号~3.31的已完成流程入库
// dingDingService.handleAsyncAllFinishedFlowsByTimeRange("2024-03-21 00:00:00","2024-03-31 23:59:00");