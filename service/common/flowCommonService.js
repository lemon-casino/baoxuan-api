const {flowReviewTypeConst, operateTypeConst} = require("@/const/flowConst")
const dateUtil = require("@/utils/dateUtil")
const ParameterError = require("@/error/parameterError")
const flowRepo = require("@/repository/flowRepo")
const flowFormDetailsRepo = require("@/repository/flowFormDetailsRepo")
const globalGetter = require("@/global/getter")
const flowFormReviewUtil = require("@/utils/flowFormReviewUtil")

/**
 * 移除指定状态的流程
 *
 * @param flows
 * @param flowStatus
 * @returns {*}
 */
const removeTargetStatusFlows = (flows, flowStatus) => {
    return flows.filter(item => item.instanceStatus !== flowStatus)
}


/**
 * 移除流程的审核节点：完成时间不在完成时间区间内
 *
 * @param flows
 * @param startDoneDate
 * @param endDoneDate
 * @returns {*}
 */
const removeDoneActivitiesNotInDoneDateRange = (flows, startDoneDate, endDoneDate) => {
    // 根据时间区间过滤掉不在区间内的完成节点，todo和forcast的数据不用处理
    for (const flow of flows) {
        if (!flow.overallprocessflow) {
            continue
        }

        const newOverallProcessFlow = []
        for (const item of flow.overallprocessflow) {
            if (item.type === flowReviewTypeConst.TODO || item.type === flowReviewTypeConst.FORCAST) {
                newOverallProcessFlow.push(item)
                continue
            }
            if (startDoneDate && endDoneDate && item.type === flowReviewTypeConst.HISTORY) {
                let doneTime = item.doneTime
                if (!doneTime) {
                    doneTime = dateUtil.formatGMT2Str(item.operateTimeGMT)
                }
                if (dateUtil.duration(doneTime, dateUtil.startOfDay(startDoneDate)) >= 0 && dateUtil.duration(dateUtil.endOfDay(endDoneDate), doneTime) >= 0) {
                    newOverallProcessFlow.push(item)
                    continue
                }
            }
        }
        flow.overallprocessflow = newOverallProcessFlow
    }
    return flows
}

/**
 * 去掉转接的节点
 *
 * @param flows
 * @returns {*}
 */
const removeRedirectActivity = (flows) => {
    for (const flow of flows) {
        if (!flow.overallprocessflow) {
            continue
        }

        const newOverallProcessFlow = []
        for (const item of flow.overallprocessflow) {
            if (item.operateType !== operateTypeConst.REDIRECT_TASK) {
                newOverallProcessFlow.push(item)
                continue
            }
        }
        flow.overallprocessflow = newOverallProcessFlow
    }
    return flows
}

/**
 * 获取节点完成时间区间内的流程和todayFlows
 *
 * 历史数据转成Redis中的格式统一处理
 * @param startDoneDate
 * @param endDoneDate
 * @param formIds
 * @returns {Promise<*[]>}
 */
const getCombinedFlowsOfHistoryAndToday = async (startDoneDate, endDoneDate, formIds) => {

    if ((startDoneDate || endDoneDate) && !(startDoneDate && endDoneDate)) {
        throw new ParameterError("时间区间不完整")
    }

    let flows = []
    // 获取时间区间内的入库流程
    if (startDoneDate && endDoneDate) {
        if (dateUtil.duration(endDoneDate, startDoneDate) < 0) {
            throw new ParameterError("结束日期不能小于开始日期")
        }

        const processRelatedInfo = await Promise.all([
            flowRepo.getProcessDataByReviewItemDoneTime(dateUtil.startOfDay(startDoneDate), dateUtil.endOfDay(endDoneDate), formIds), // 2.8s
            flowRepo.getProcessWithReviewByReviewItemDoneTime(dateUtil.startOfDay(startDoneDate), dateUtil.endOfDay(endDoneDate), formIds),
            flowFormDetailsRepo.getAllFormsDetails()
        ])

        const flowsData = processRelatedInfo[0]
        const flows = processRelatedInfo[1]
        const flowFormDetails = processRelatedInfo[2]

        // 合并流程的data和审核流信息
        for (let i = 0; i < flows.length; i++) {
            const currData = {}
            for (const item of flowsData[i].data) {
                const fieldValue = item.fieldValue
                if (fieldValue.startsWith("[") && fieldValue.endsWith("]")) {
                    currData[item.fieldId] = JSON.parse(fieldValue)
                } else {
                    currData[item.fieldId] = fieldValue
                }
            }
            flows[i].data = currData

            const formDataKeys = flowFormDetails.filter(item => item.formId === flows[i].formUuid)
            const dataKeyDetails = {}
            formDataKeys.forEach(item => dataKeyDetails[item.fieldId] = item.fieldName)
            flows[i].dataKeyDetails = dataKeyDetails
        }
    }

    let todayFlows = await globalGetter.getTodayFlows()
    if (formIds && formIds.length > 0) {
        todayFlows = todayFlows.filter(flow => formIds.includes(flow.formUuid))
    }

    flows = flows.concat(todayFlows.map(flow => {
        // 返回新的Flow, 防止修改内存中的数据结构
        return {...flow}
    }))

    return flows
}


const getVisionOutSourcingNames = (flows) => {
    const outSourcingForms = [{
        formId: "FORM-30500E23B9C44712A5EBBC5622D3D1C4TL18",
        formName: "外包拍摄视觉流程",
        outSourceChargerFieldId: "textField_lvumnj2k"
    }, {
        formId: "FORM-4D592E41E1C744A3BCD70DB5AC228B01V8GV",
        formName: "外包修图视觉流程",
        outSourceChargerFieldId: "textField_lx48e5gk"
    }]

    const outSourcingUsers = {}
    for (const flow of flows) {
        const outSourcingFormIds = outSourcingForms.map(item => item.formId)
        if (outSourcingFormIds.includes(flow.formUuid)) {
            const {outSourceChargerFieldId} = outSourcingForms.filter(item => item.formId === flow.formUuid)[0]

            const username = flowFormReviewUtil.getFieldValue(outSourceChargerFieldId, flow.data)
            if (username) {
                outSourcingUsers[username] = 1
            }
        }
    }
    return Object.keys(outSourcingUsers)
}


module.exports = {
    removeTargetStatusFlows,
    removeDoneActivitiesNotInDoneDateRange,
    getCombinedFlowsOfHistoryAndToday,
    getVisionOutSourcingNames,
    removeRedirectActivity
}