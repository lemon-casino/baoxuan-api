const transmittedOfflineActivityPatch = require("./transmittedOfflineActivityPatch")
const visionErrAllWorksInOnePatch = require("./visionErrAllWorksInOnePatch")
const flowDataPatch = require("./flowDataPatch")

const patchOfflineTransmittedActivity = (flow) => {
    const tmpRequirePatchedFlows = transmittedOfflineActivityPatch.filter(item => item.processInstanceId === flow.processInstanceId)
    if (tmpRequirePatchedFlows.length > 0) {
        const {targetActivityId, replacedActivities} = tmpRequirePatchedFlows[0]
        let newOverallProcessFlows = []
        for (const item of flow.overallprocessflow) {
            if (item.activityId === targetActivityId) {
                for (const newAct of replacedActivities) {
                    newAct.type = item.type
                    newAct.operateTimeGMT = item.operateTimeGMT
                    newAct.showName = item.showName
                    newAct.action = item.action
                }
                newOverallProcessFlows = newOverallProcessFlows.concat(replacedActivities)
            } else {
                newOverallProcessFlows.push(item)
            }
        }
        flow.overallprocessflow = newOverallProcessFlows
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

module.exports = {
    patchOfflineTransmittedActivity,
    getUserTmpTags,
    patchFlowData
}