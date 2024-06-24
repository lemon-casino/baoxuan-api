const httpUtil = require("../../utils/httpUtil")

/**
 * 获取当前企业所有可管理的表单
 *
 * @param accessToken
 * @param userId
 * @returns {Promise<{result: [{newProcess: boolean, attendanceType: number, flowTitle: string, gmtModified: string, iconName: string, processCode: string, iconUrl: string},{newProcess: boolean, attendanceType: number, flowTitle: string, gmtModified: string, iconName: string, processCode: string, iconUrl: string},{newProcess: boolean, attendanceType: number, flowTitle: string, gmtModified: string, iconName: string, processCode: string, iconUrl: string},{newProcess: boolean, attendanceType: number, flowTitle: string, gmtModified: string, iconName: string, processCode: string, iconUrl: string},{newProcess: boolean, attendanceType: number, flowTitle: string, gmtModified: string, iconName: string, processCode: string, iconUrl: string},null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null], success: boolean}>}
 */
const getOAProcessTemplates = async (accessToken, userId) => {
    const url = "https://api.dingtalk.com/v1.0/workflow/processes/managements/templates"
    const params = {userId: userId}
    return await httpUtil.get(url, params, accessToken)
}

/**
 * 获取审批实例ID列表
 *
 * @param accessToken
 * @param data { processCode, startTime, endTime, nextToken, maxResults, userIds, statuses}
 * @returns {Promise<void>}
 */
const getOAProcessIds = async (accessToken, data) => {
    const url = "https://api.dingtalk.com/v1.0/workflow/processes/instanceIds/query"
    return await httpUtil.post(url, data, accessToken)
}

/**
 * 获取单个审批实例详情
 *
 * @param accessToken
 * @param processInstanceId
 * @returns {Promise<*|undefined>}
 */
const getOAProcessDetails = async (accessToken, processInstanceId) => {
    const params = {processInstanceId}
    const url = "https://api.dingtalk.com/v1.0/workflow/processInstances"
    return await httpUtil.get(url, params, accessToken)
}


module.exports = {
    getOAProcessTemplates,
    getOAProcessIds,
    getOAProcessDetails,
}

