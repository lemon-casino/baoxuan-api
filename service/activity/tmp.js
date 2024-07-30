const _ = require("lodash");
const getUserStatResult = async (statusResult, flow, operatorActivity) => {
    
    if (!userFlowDataStatFunc || !_.isFunction(userFlowDataStatFunc)) {
        return {
            processInstanceId: flow.processInstanceId,
            flowData: []
        }
    }
    
    let userFlowDataStat = null
    
    // 获取该人在该流程中当前表单的数据进行汇总(进行中、已完成)
    if (!statusResult.nameCN.includes("待")) {
        const tmpFlow = _.cloneDeep(flow)
        // 进行中的工作会统计表单中预计的数量 完成后需要排除掉预计的数量， 表单标识有【预计】字样
        if (statusResult.nameCN.includes("完")) {
            const containYuJiTagKeys = []
            for (const key of Object.keys(tmpFlow.dataKeyDetails)) {
                if (tmpFlow.dataKeyDetails[key].includes("预计") && tmpFlow.dataKeyDetails[key].includes("数量")) {
                    containYuJiTagKeys.push(key)
                }
            }
            for (const containYuJiTagKey of containYuJiTagKeys) {
                delete tmpFlow.dataKeyDetails[containYuJiTagKey]
                delete tmpFlow.data[containYuJiTagKey]
            }
        }
        
        const dataStatResult = await userFlowDataStatFunc(operatorActivity, tmpFlow)
        
        if (dataStatResult.length > 0) {
            userFlowDataStat = {
                processInstanceId: tmpFlow.processInstanceId,
                flowData: dataStatResult
            }
        }
        
    }
    return userFlowDataStat
}

const userFlowDataStat = await getUserStatResult(statusResult, flow, operatorActivity)