const flowService = require("./flowService")
const redisService = require("./redisService")
const dateUtil = require("../utils/dateUtil")
const reviewUtil = require("../utils/reviewUtil")
const statisticStatusConst = require("../const/statisticStatusConst")
const FlowFormReview = require("../model/flowformreview")

/**
 * doing error completed terminated
 * @param userId
 * @param status
 * @param importance
 * @returns {Promise<{sum: number, departments: {}}>}
 */
const getTodaySelfLaunchedFlowsStatisticCountOfFlowStatus = async (userId, status, importance) => {
    let filteredFlows = await flowService.filterTodayFlowsByFlowStatusAndImportanceEndOfForms(status, importance)
    filteredFlows = filteredFlows.filter((flow) => {
        return flow.originator.userId === userId;
    })
    const flowsOfDepartment = await flowService.flowsDividedByDepartment(filteredFlows)
    const result = await flowService.sumFlowsByDepartment(flowsOfDepartment)
    if (result.departments) {
        const convertedData = await flowService.convertJonsToArr(result.departments)
        result.departments = convertedData
    }
    return result;
}

/**
 * 待转入
 * @param userId
 * @param type
 * @param importance
 * @returns {Promise<{sum: number, departments: {}}>}
 */
const getTodaySelfLaunchedFlowsStatisticCountOfReviewType = async (userId, type, importance) => {
    let filteredFlows = await flowService.filterTodayFlowsByFlowStatusAndImportanceEndOfForms(
        statisticStatusConst.flowStatus.running,
        importance)

    filteredFlows = filteredFlows.filter((flow) => {
        return flow.originator.userId === userId;
    })

    filteredFlows = await flowService.filterFlowByReviewTypeAndOperatorId(filteredFlows, type, userId);
    const flowsOfDepartment = await flowService.flowsDividedByDepartment(filteredFlows)
    const result = await flowService.sumFlowsByDepartment(flowsOfDepartment)

    if (result.departments) {
        const convertedData = await flowService.convertJonsToArr(result.departments)
        result.departments = convertedData
    }

    return result;
}

const getTodaySelfLaunchedFlowsStatisticCountOfOverDue = async (userId, importance) => {
    const satisfiedFlowsObj = await getTodaySelfLaunchedFlowsStatisticOfOverDue(userId, importance)
    let allSum = 0;
    for (const key of Object.keys(satisfiedFlowsObj)) {
        const flowsDividedByDepartment = await flowService.flowsDividedByDepartment(satisfiedFlowsObj[key])
        const sumFlowsByDepartment = await flowService.sumFlowsByDepartment(flowsDividedByDepartment)
        if (sumFlowsByDepartment.departments) {
            const convertedData = await flowService.convertJonsToArr(sumFlowsByDepartment.departments)
            sumFlowsByDepartment.departments = convertedData
        }
        satisfiedFlowsObj[key] = sumFlowsByDepartment
        allSum = allSum + (sumFlowsByDepartment["sum"] || 0)
    }
    satisfiedFlowsObj["sum"] = allSum
    return satisfiedFlowsObj
}

const getTodaySelfLaunchedFlowsStatisticOfOverDue = async (userId, status, importance) => {
    const flowsOfRunningAndFinishedOfToday = await redisService.getFlowsOfRunningAndFinishedOfToday();
    let filteredFlows = flowsOfRunningAndFinishedOfToday.filter((flow) => {
        return flow.originator.userId === userId;
    })
    filteredFlows = await flowService.filterFlowsByImportance(filteredFlows, importance)

    const satisfiedFlows = {"done": [], "doing": []};

    let needFilterReviewItems = null
    if (importance) {
        needFilterReviewItems = importance.items
    }
    for (const flow of filteredFlows) {
        const reviewItems = flow.overallprocessflow
        if (!reviewItems) {
            continue;
        }
        for (let i = 0; i < reviewItems.length; i++) {
            // 如果需要过滤指定的items，那么不符合直接跳过
            if (needFilterReviewItems && needFilterReviewItems.length > 0) {
                if (!needFilterReviewItems.includes(reviewItems[i].activityId)) {
                    continue
                }
            }

            // 已完成的工作逾期
            if (reviewItems[i].isOverDue) {
                if (reviewItems[i].type === statisticStatusConst.reviewType.history){
                    satisfiedFlows.done.push(flow)
                    break;
                }else{
                    satisfiedFlows.doing.push(flow)
                    break;
                }
                // satisfiedFlows.done.push(flow)
                // continue;
            }

            // 正在做还未完成的工作已逾期
            // if (reviewItems[i].type === statisticStatusConst.reviewType.todo && i > 0) {
            //     // 计算现在工作时长是否超时
            //     const costAlready = dateUtil.diff(new Date(), dateUtil.formatGMT(reviewItems[i - 1].operateTimeGMT))
            //     const reviewRequirements = await FlowFormReview.getFlowFormReviewList(flow.formUuid)
            //     const requiredCost = reviewUtil.extractTimeRequirement(reviewRequirements.form_review, reviewItems[i].activityId)
            //
            //     if (requiredCost > 0 && costAlready >= requiredCost) {
            //         satisfiedFlows.doing.push(flow)
            //         continue
            //     }
            // }
        }
    }
    return satisfiedFlows;
}


module.exports = {
    getTodaySelfLaunchedFlowsStatisticCountOfFlowStatus,
    getTodaySelfLaunchedFlowsStatisticCountOfReviewType,
    getTodaySelfLaunchedFlowsStatisticCountOfOverDue
}