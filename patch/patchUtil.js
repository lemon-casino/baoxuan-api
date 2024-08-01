const flowConst = require("@/const/flowConst")
const transmittedOfflineActivityPatch = require("./transmittedOfflineActivityPatch")
const visionErrAllWorksInOnePatch = require("./visionErrAllWorksInOnePatch")
const flowDataPatch = require("./flowDataPatch")
const redundantFlowsActivities = require("./redundantFlowsActivitiesPatch")
const abnormalRedirectFlowsPatch = require("./abnormalRedirectFlowsPatch")

const usefulOriginKeys = ["showName", "operateTimeGMT", "remark", "dataId", "type", "taskHoldTimeGMT", "size"]

const getNewActivity = (oldActivity, newActivityCnf) => {
    const newActivity = {...newActivityCnf}
    for (const usefulOriginKey of usefulOriginKeys) {
        newActivity[usefulOriginKey] = oldActivity[usefulOriginKey]
    }
    return newActivity
}

const patchAbnormalRedirectFlow = (flow) => {
    const targetFlow = abnormalRedirectFlowsPatch.find(item => item.processInstanceId === flow.processInstanceId)
    if (targetFlow) {
        const targetActivityId = targetFlow.targetActivityId
        const newOverallProcessFlow = []
        for (const activity of flow.overallprocessflow) {
            if (activity.activityId === targetActivityId && activity.operateType === flowConst.operateTypeConst.REDIRECT_PROCESS) {
                const replacedActivities = targetFlow.replacedActivities
                for (const replacedActivity of replacedActivities) {
                    const newActivity = getNewActivity(activity, replacedActivity)
                    newOverallProcessFlow.push(newActivity)
                }
            } else {
                newOverallProcessFlow.push(activity)
            }
        }
        flow.overallprocessflow = newOverallProcessFlow
    }
    return flow
}


const patchOfflineTransmittedActivity = (flow) => {
    const tmpRequirePatchedFlow = transmittedOfflineActivityPatch.find(item => item.processInstanceId === flow.processInstanceId)
    if (tmpRequirePatchedFlow) {
        const {targetActivityId, replacedActivities} = tmpRequirePatchedFlow
        let newOverallProcessFlow = []
        for (const activity of flow.overallprocessflow) {
            if (activity.activityId === targetActivityId) {
                for (const replacedActivity of replacedActivities) {
                    const newActivity = getNewActivity(activity, replacedActivity)
                    newOverallProcessFlow.push(newActivity)
                }
            } else {
                newOverallProcessFlow.push(activity)
            }
        }
        flow.overallprocessflow = newOverallProcessFlow
    }
    return flow
}

const getUserTmpTags = (userName, processInstanceId) => {
    const userPatch = visionErrAllWorksInOnePatch.find(item => item.userName === userName)
    if (!userPatch) {
        return []
    }
    
    const errFlow = userPatch.errFormDataFlows.find(item => item.processInstanceId === processInstanceId)
    if (errFlow) {
        return errFlow.tmpTags
    }
    return []
}

const patchFlowData = (flow) => {
    const requiredPatchedFlow = flowDataPatch.find(item => item.processInstanceId === flow.processInstanceId)
    if (requiredPatchedFlow) {
        flow.data = {...flow.data, ...requiredPatchedFlow.patchData}
        return flow
    }
    return flow
}

const removeRedundantFlowsActivities = (flow) => {
    const redundantFlow = redundantFlowsActivities.find(item => item.processInstanceId === flow.processInstanceId)
    if (redundantFlow) {
        flow.overallprocessflow = flow.overallprocessflow.filter(item => !redundantFlow.activityIds.includes(item.activityId))
    }
    
    return flow
}

const patchFlow = (flow) => {
    flow = patchOfflineTransmittedActivity(flow)
    flow = patchFlowData(flow)
    flow = removeRedundantFlowsActivities(flow)
    flow = patchAbnormalRedirectFlow(flow)
    return flow
}

module.exports = {
    getUserTmpTags,
    patchFlow
}