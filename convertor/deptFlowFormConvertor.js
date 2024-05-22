const convert = (deptForms) => {
    const result = []
    for (const form of deptForms) {
        const tmpResult = {
            formName: form.formName,
            formId: form.formId,
            actions: []
        }
        const reviewItems = form.deptFlowFormActivities
        if (!reviewItems || reviewItems.length === 0) {
            continue
        }
        // 名称相同的节点需要合并
        const actionNames = {}
        for (const item of reviewItems) {
            let tmpActivity = null
            if (Object.keys(actionNames).includes(item.activityName)) {
                const action = tmpResult.actions.filter(action => action.name === item.activityName)
                action[0].nodeIds.push(item.activityId)
            } else {
                tmpActivity = {name: item.activityName, nodeIds: [item.activityId]}
                tmpResult.actions.push(tmpActivity)
            }
            actionNames[item.activityName] = 1
        }
        result.push(tmpResult)
    }
    return result
}

module.exports = {
    convert
}