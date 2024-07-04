const {dingDingConfig} = require("@/config")
const httpUtil = require("@/utils/httpUtil")
const dingDingUtil = require("@/utils/dingDingUtil")

// 宜搭配置
const systemToken = dingDingConfig.systemToken;
const appType = dingDingConfig.appType;

/**
 * 获取表单数据
 *
 * @param token
 * @param userid
 * @returns {Promise<*>}
 */
const getAllForms = async (token, userid) => {
    const url = "https://api.dingtalk.com/v1.0/yida/forms"
    const params = {
        formTypes: "process",
        systemToken: systemToken,
        appType: appType,
        userId: userid,
        pageSize: 100,
        pageNumber: 1
    }
    const result = await dingDingUtil.loopGet(url, params, token, [])
    return result
}

/**
 * 获取流程详情
 *
 * @param token
 * @param userId
 * @param formUuid
 * @param pageSize
 * @param pageNumber
 * @returns {Promise<*|undefined>}
 */
const getAllFlowIds = async (
    token,
    userId,
    formUuid,
    pageSize,
    pageNumber
) => {
    const url = `https://api.dingtalk.com/v1.0/yida/processes/instanceIds?pageSize=${pageSize}&pageNumber=${pageNumber}`
    const data = {
        formUuid,
        systemToken: systemToken,
        appType: appType,
        userId: userId,
    }
    return await httpUtil.post(url, data, token)
}

/**
 * 根据表单获取流程数据
 *
 * @param token
 * @param userId
 * @param formUuid
 * @returns {Promise<*|undefined>}
 */
const getFlowIdsByFormId = async (token, userId, formUuid) => {
    const url = `https://api.dingtalk.com/v1.0/yida/forms/instances/ids/${appType}/${formUuid}`
    const data = {
        formUuid,
        systemToken: systemToken,
        appType: appType,
        userId: userId,
    };
    return await httpUtil.post(url, data, token)
}

/**
 * 根据表单id获取所有流程实例详情
 *
 * @param token
 * @param userId
 * @param formUuid
 * @param pageSize
 * @param pageNumber
 * @returns {Promise<*|undefined>}
 */
const getFlowsByFormId = async (
    token,
    userId,
    formUuid,
    pageSize,
    pageNumber
) => {
    const url = "https://api.dingtalk.com/v1.0/yida/forms/instances/advances/queryAll"
    const data = {
        formUuid,
        systemToken: systemToken,
        appType: appType,
        userId: userId,
        pageSize,
        pageNumber,
    };
    return await httpUtil.post(url, data, token)
}

/**
 * 批量获取宜搭流程实例详情
 *
 * @param token
 * @param userId
 * @param processInstanceIds
 * @returns {Promise<*|undefined>}
 */
const getBatchFlowsByIds = async (token, userId, processInstanceIds) => {
    const url = "https://api.dingtalk.com/v1.0/yida/processes/instances/searchWithIds"
    const params = {
        systemToken: systemToken,
        appType: appType,
        userId: userId,
        processInstanceIds: processInstanceIds
    }
    return await httpUtil.get(url, params, token)
}

const getFlowsOfStatus = async (
    status,
    token,
    userId,
    formUuid,
    pageSize,
    pageNumber
) => {
    const data = {
        instanceStatus: status,
        formUuid,
        systemToken: systemToken,
        appType: appType,
        userId: userId
    };
    const result = getPagingFlows(token, data, pageNumber, pageSize);
    return result;
}

const getPagingFlows = async (token, data, pageNumber, pageSize) => {
    const url = `https://api.dingtalk.com/v1.0/yida/processes/instances?pageNumber=${pageNumber}&pageSize=${pageSize}`
    return await httpUtil.post(url, data, token)
}

/**
 * 单个获取宜搭流程实例详情
 *
 * @param fromTimeGMT
 * @param toTimeGMT
 * @param timeAction
 * @param status
 * @param token
 * @param userId
 * @param formUuid
 * @param pageSize
 * @param pageNumber
 * @returns {Promise<*>}
 */
const getFlowsOfStatusAndTimeRange = async (
    fromTimeGMT,
    toTimeGMT,
    timeAction,
    status,
    token,
    userId,
    formUuid,
    pageSize,
    pageNumber
) => {
    let dataToSend = {
        instanceStatus: status,
        formUuid,
        systemToken: systemToken,
        appType: appType,
        userId: userId,
    }
    if (timeAction) {
        dataToSend[`${timeAction}FromTimeGMT`] = fromTimeGMT;
        dataToSend[`${timeAction}ToTimeGMT`] = toTimeGMT
    }
    const result = await getPagingFlows(token, dataToSend, pageNumber, pageSize)
    return result;
}


/**
 * 获取流程全部审批记录
 *
 * @param access_token
 * @param userId
 * @param process_instance_id
 * @returns {Promise<*|undefined>}
 */
const getProcessRecord = async (
    access_token,
    userId,
    process_instance_id
) => {
    const url = "https://api.dingtalk.com/v1.0/yida/processes/operationRecords"
    const params = {systemToken: systemToken, appType: appType, userId: userId, processInstanceId: process_instance_id}
    return await httpUtil.get(url, params, access_token)
}

/**
 * 获取实例详情评论信息
 *
 * @param access_token
 * @param formUuid
 * @param userId
 * @param formInstanceIdList
 * @returns {Promise<*|undefined>}
 */
const getremarksAll = async (
    access_token,
    formUuid,
    userId,
    formInstanceIdList
) => {
    const url = "https://api.dingtalk.com/v1.0/yida/forms/remarks/query"
    const data = {
        formUuid,
        systemToken: systemToken,
        appType: appType,
        userId: userId,
        formInstanceIdList,
    };
    return await httpUtil.post(url, data, access_token)
}

/**
 * 获取Form的详细的设计信息
 * @param formId
 * @param userId
 * @param token
 * @returns {Promise<any>}
 */
const getFormFields = async (formId, userId, token) => {
    const url = "https://api.dingtalk.com/v1.0/yida/forms/formFields"
    const params = {
        appType: appType,
        systemToken: systemToken,
        formUuid: formId,
        userId: userId
    }
    const result = await httpUtil.get(url, params, token)
    return result
}

/**
 * 发起流程
 * @param formId
 * @param userId
 * @param processCode
 * @param departmentId
 * @param formDataJsonStr
 * @returns {Promise<void>}
 */
const createProcess = async (token, formId, userId, processCode, departmentId, formDataJsonStr) => {
    const url = "https://api.dingtalk.com/v1.0/yida/processes/instances/start"

    const body = {
        "appType": appType,
        "systemToken": systemToken,
        userId,
        "language": "zh_CN",
        "formUuid": formId,
        processCode,
        departmentId: departmentId.toString()
    }
    if (formDataJsonStr) {
        body.formDataJson = formDataJsonStr
    }

    return await httpUtil.post(url, body, token)
}

module.exports = {
    getFormFields,
    getremarksAll,
    getProcessRecord,
    getFlowsOfStatusAndTimeRange,
    getFlowsOfStatus,
    getPagingFlows,
    getBatchFlowsByIds,
    getFlowsByFormId,
    getAllForms,
    getAllFlowIds,
    getFlowIdsByFormId,
    createProcess
}
