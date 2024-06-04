const ProcessModel = require("../model/process")
const FlowReview = require("../model/flowformreview")
const globalSetter = require("../global/setter")
const reviewUtil = require("../utils/reviewUtil")
const redisUtil = require("../utils/redisUtil")
const dateUtil = require("../utils/dateUtil")
const dingDingData = require("../service/dingDingService")
const processReviewService = require("../service/prcessReviewService")
const dingDingService = require("../service/dingDingService")
const processService = require("../service/processService")
const flowService = require("../service/flowService")
const processDetailsService = require("../service/processDetailsService")
const flowFormDetailsService = require("../service/flowFormDetailsService")
const workingDayService = require("../service/workingDayService")
const taskService = require("../service/taskService")
const {logger} = require("../utils/log")

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
}

const getTodayRunningAndFinishedFlows = async () => {
    const flows = await dingDingService.getTodayRunningAndFinishedFlows()
    await redisUtil.setKey(redisKeys.FlowsOfRunningAndFinishedOfToday, JSON.stringify(flows))
    globalSetter.setGlobalTodayRunningAndFinishedFlows(flows)
}

// processService.correctStrFieldToJson();


const getHistoryFinishedFlows = async () => {
    const pullTimeRange = []
    // 获取拉取钉钉完成流程的起始时间（异常情况下，当天更新失败，可能下次会拉取多天的）
    const latestProcess = await processService.getLatestModifiedProcess();
    if (latestProcess) {
        // 钉钉返回的时间精确到分钟，同一分钟内可能会有入库失败的情况，
        // 需要把这一分钟内的流程也筛出来，过滤掉
        pullTimeRange.push(dateUtil.convertToStr(latestProcess.modifiedTime))
        pullTimeRange.push(dateUtil.endOfToday())
    }
    // 还没有历史数据，需要拉取全部的已完成的流程
    else {
        pullTimeRange.push(dateUtil.dateOfEarliest())
        pullTimeRange.push(dateUtil.endOfToday())
    }

    // 获取指定范围时间范围内的流程
    let finishedFlows = await dingDingService.getFinishedFlows(pullTimeRange)
    // 按照完成时间（modifiedTime） 升序排序
    finishedFlows = finishedFlows.sort((curr, next) => {
        const currDate = Date.parse(dateUtil.convertToStr(dateUtil.formatGMT(curr.modifiedTimeGMT)))
        const nextDate = Date.parse(dateUtil.convertToStr(dateUtil.formatGMT(next.modifiedTimeGMT)))
        return currDate - nextDate
    })

    for (const flow of finishedFlows) {
        // 同一起始时间(分钟)可能已经入库
        if (dateUtil.convertToStr(dateUtil.formatGMT(flow.modifiedTimeGMT)) === pullTimeRange[0].toString()) {
            const savedFlow = await processService.getProcessByProcessInstanceId(flow.processInstanceId)
            if (savedFlow) {
                continue
            }
        }
        // 同步到数据库
        await processService.saveProcess(flow)
    }
}

// flowFormService.syncFormsFromDingDing()

// dingDingData.getDingDingToken();

/**
 * 将流程数据中的originator信息拆出来
 * @returns {Promise<void>}
 */
const extractProcessOriginator = async () => {
    const allFlows = await flowService.getAllFlows()
    let index = 0
    for (const flow of allFlows) {
        // 修改originator信息
        const originator = flow.originator
        if (originator) {
            const newFlow = {...flow.dataValues}
            newFlow.originatorName = originator.name.nameInChinese
            newFlow.originatorId = originator.userId
            await flowService.updateFlow(newFlow)
        }
        index = index + 1
        console.log(`流程中originator信息同步进度：${index}/${allFlows.length}`)
    }
}
// extractProcessOriginator()

/**git
 * 流程中data数据的拆分
 * @returns {Promise<void>}
 */
const extractProcessData = async () => {
    const allFlows = await flowService.getAllFlows()
    let index = 0
    for (const flow of allFlows) {
        // 获取表单的详细信息
        const formDetails = await flowFormDetailsService.getFormDetailsByFormId(flow.formUuid)
        // 修改data 信息
        const dataJson = flow.data
        const processDetailsArr = []
        if (dataJson) {
            for (const key of Object.keys(dataJson)) {
                const processDetails = {}
                processDetails["processInstanceId"] = flow.processInstanceId;
                processDetails["fieldId"] = key;
                const tmpFormDetails = formDetails.filter((item) => item.fieldId === key)
                processDetails["fieldName"] = "";
                if (tmpFormDetails && tmpFormDetails.length > 0) {
                    processDetails["fieldName"] = tmpFormDetails[0].fieldName;
                }
                processDetails["fieldValue"] = dataJson[key];
                processDetailsArr.push(processDetails)
            }
            await processDetailsService.saveProcessDetailsArr(processDetailsArr)
        }
        index = index + 1
        console.log(`流程信息同步进度：${index}/${allFlows.length}`)
    }
}

// extractProcessData()

/**
 * 提取流程的审核信息
 * @returns {Promise<void>}
 */
const extractProcessReview = async () => {
    const allFlows = await flowService.getAllFlows()
    let index = 0
    const failedFlows = []
    for (const flow of allFlows) {
        const reviewItems = flow.overallprocessflow
        if (reviewItems && reviewItems.length > 0) {
            const result = await processReviewService.saveBatchProcessReviews(reviewItems)
            if (!result) {
                failedFlows.push(flow.processInstanceId)
            }
        }
        index = index + 1
        console.log(`流程信息同步进度：${index}/${allFlows.length}`)
    }
}
// extractProcessReview()

// flowService.syncMissingCompletedFlows()
// 同步3.1号~3.31的已完成流程入库
// dingDingService.handleAsyncAllFinishedFlowsByTimeRange("2024-03-01 00:00:00","2024-03-31 23:59:00");

const syncWorkingDay = async () => {
    const date = dateUtil.format2Str(new Date(), "YYYY-MM-DD")
    const isWorkingDay = await dingDingService.isWorkingDay(date)
    if (isWorkingDay) {
        await workingDayService.saveWorkingDay(date)
    }
}

const computeValidWorkingDuration = async () => {
    const duration = await workingDayService.computeValidWorkingDuration("2024-04-15 10:00:00", "2024-04-16 11:03:24")
}

// taskService.syncUserWithDepartment()
// taskService.syncDingDingToken()
// taskService.syncResignEmployeeInfo()
taskService.syncUserWithDepartment()