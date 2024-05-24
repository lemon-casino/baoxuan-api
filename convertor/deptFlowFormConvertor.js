const {flowReviewTypeConst} = require("../const/flowConst")
const {opCodes} = require("../const/operatorConst")
/**
 * 对单个部门配置的表单数据进行格式转化
 *
 * @param deptForms
 * @returns {*[]}  [{formName: "", ... , actions: [{name: "", nodeIds: []}]}]
 */
const convertDeptForms = (deptForms) => {
    const result = []
    for (const form of deptForms) {
        const tmpResult = {
            formName: form.formName,
            formId: form.formId,
            children: []
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
                const activities = tmpResult.children.filter(activity => activity.activityName === item.activityName)
                activities[0].children.push(item.activityId)
            } else {
                tmpActivity = {activityName: item.activityName, children: [item.activityId]}
                tmpResult.children.push(tmpActivity)
            }
            actionNames[item.activityName] = 1
        }
        result.push(tmpResult)
    }
    return result
}

/**
 * 对对部门的表单配置数据格式转化
 *
 * @param deptsForms
 * @returns {*[]} [{formId:"",... ,children:[deptName: "", ... , children: [{actionName: "", children: []}]]}]
 */
const convertDeptsForms = (deptsForms) => {
    const result = []

    for (const form of deptsForms) {
        let formResult = result.filter(item => item.formId === form.formId)
        if (!formResult || formResult.length === 0) {
            result.push({formId: form.formId, formName: form.formName, children: []})
            formResult = result[result.length - 1]
        } else {
            formResult = formResult[0]
        }

        let deptResult = formResult.children.filter(dept => form.deptId === dept.deptId)
        if (!deptResult || deptResult.length === 0) {
            formResult.children.push({deptName: form.deptName, deptId: form.deptId, children: []})
            deptResult = formResult.children[formResult.children.length - 1]
        } else {
            deptResult = deptResult[0]
        }

        const reviewItems = form.deptFlowFormActivities
        if (!reviewItems || reviewItems.length === 0) {
            continue
        }

        for (const reviewItem of reviewItems) {
            let actionResult = deptResult.children.filter(item => item.actionName === reviewItem.activityName)
            if (!actionResult || actionResult.length === 0) {
                deptResult.children.push({actionName: reviewItem.activityName, children: []})
                actionResult = deptResult.children[deptResult.children.length - 1]
            } else {
                actionResult = actionResult[0]
            }
            actionResult.children.push(reviewItem.activityId)
        }
    }
    return result
}

module.exports = {
    convertDeptForms,
    convertDeptsForms
}