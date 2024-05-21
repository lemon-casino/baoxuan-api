const convert = (deptForms) => {
    const result = []
    for (const deptForm of deptForms) {
        const tmpResult = {
            formName: deptForm.formName,
            formId: deptForm.formId,
            actions: []
        }
        const deptFlowFormActivities = deptForm.deptFlowFormActivities
        // 名称相同的节点需要合并
        const actionNames = {}
        for (const activity of deptFlowFormActivities) {
            let tmpActivity = null
            if (Object.keys(actionNames).includes(activity.activityName)) {
                const action = tmpResult.actions.filter(action => action.name === activity.activityName)
                action[0].nodeIds.push(activity.activityId)
            } else {
                tmpActivity = {name: activity.activityName, nodeIds: [activity.activityId]}
                tmpResult.actions.push(tmpActivity)
            }
            actionNames[activity.activityName] = 1
        }
        result.push(tmpResult)
    }
    return result
}

module.exports = {
    convert
}