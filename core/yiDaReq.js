const {dingDingConfig} = require("@/config")
const httpUtil = require("@/utils/httpUtil")
const dingDingUtil = require("@/utils/dingDingUtil")
const ParameterError = require("@/error/parameterError")

// 宜搭配置
const systemToken = dingDingConfig.systemToken;
const appType = dingDingConfig.appType;
const appKey = dingDingConfig.appKey;
const appSecret = dingDingConfig.appSecret;

// accessToken的有效期为7200秒（2小时），有效期内重复获取会返回相同结果并自动续期，过期后获取会返回新的accessToken。

/**
 * 根据code获取用户token
 */
const getUserDingDingAccessToken = async (code) => {
    const url = "https://api.dingtalk.com/v1.0/oauth2/userAccessToken"
    const data = {
        clientId: appKey,
        clientSecret: appSecret,
        code: code,
        grantType: "authorization_code"
    }
    return await httpUtil.post(url, data)
}

/**
 * 钉钉内部登录-免密场景：获取应用与钉钉通讯的token
 *
 * @returns {Promise<*|undefined>}
 */
const corpAccessToken = async () => {
    const url = "https://api.dingtalk.com/v1.0/oauth2/accessToken"
    const data = {
        appKey: appKey,
        appSecret: appSecret,
    }
    return await httpUtil.post(url, data)
}

/**
 * 获取企业内部应用的 access_token，用于访问应用中开通的接口
 *
 * @param appKey
 * @param appSecret
 * @returns {Promise<*|undefined>}
 */
const getDingDingAccessToken = async () => {
    const url = "https://oapi.dingtalk.com/gettoken"
    // 不要使用驼峰，接口调用参数要全部些小
    const params = {
        appkey: appKey, appsecret: appSecret
    }
    return await httpUtil.get(url, params)
}

/**
 * 根据用户token获取通讯录用户信息
 *
 * @param token
 * @returns {Promise<*|undefined>}
 */
const getUserInfoByToken = async (token) => {
    const url = "https://api.dingtalk.com/v1.0/contact/users/me"
    return await httpUtil.get(url, null, token)
}

// 3.根据unionid和企业内部应用token获取userId
const getUserIdByUnionIdAndToken = async (token, unionid) => {
    const url = `https://oapi.dingtalk.com/topapi/user/getbyunionid?access_token=${token}`
    const data = {unionid: unionid}
    return await httpUtil.post(url, data)
}

// 4.根据userid获取用户详情
const getUserInfoByUserIdAndToken = async (token, userid) => {
    const url = `https://oapi.dingtalk.com/topapi/v2/user/get?access_token=${token}`
    const data = {language: "zh_CN", userid}
    return await httpUtil.post(url, data)
}

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
        pageNumber: 0
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
    };
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

// 6.2 根据表单id获取所有流程实例详情
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
    // const url = `https://api.dingtalk.com/v1.0/yida/processes/instances?pageNumber=${pageNumber}&pageSize=${pageSize}`
    const url = "https://api.dingtalk.com/v1.0/yida/processes/instances"//?pageNumber=${pageNumber}&pageSize=${pageSize}`
    return await httpUtil.post(url, data, token)
}

// 7.1 单个获取宜搭流程实例详情
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
        pageNumber,
        pageSize
    }
    if (timeAction) {
        dataToSend[`${timeAction}FromTimeGMT`] = fromTimeGMT;
        dataToSend[`${timeAction}ToTimeGMT`] = toTimeGMT
    }
    const result = await getPagingFlows(token, dataToSend, pageNumber, pageSize)
    return result;
}

// 8.获取部门用户的userid列表
const getDeptUserList = async (access_token, dept_id) => {
    const url = `https://oapi.dingtalk.com/topapi/user/listid?access_token=${access_token}`
    const data = {
        dept_id: dept_id,
    }
    return await httpUtil.post(url, data)
}

// 9. 获取用户部门层级
const getDeptLevel = async (access_token, userid) => {
    const url = `https://oapi.dingtalk.com/topapi/v2/department/listparentbyuser?access_token=${access_token}`
    const data = {userid: userid}
    return await httpUtil.post(url, data)
}

// 10. 获取子部门id详情
const getSubDept = async (access_token, dept_id) => {
    const url = `https://oapi.dingtalk.com/topapi/v2/department/listsubid?access_token=${access_token}`
    const data = {dept_id: dept_id}
    return await httpUtil.post(url, data)
}

// 11. 获取部门用户基础信息
const getDeptUser_def = async (access_token, dept_id, cursor, size) => {
    const url = `https://oapi.dingtalk.com/topapi/user/listsimple?access_token=${access_token}`
    const data = {cursor, size, dept_id}
    return await httpUtil.post(url, data)
}

// 12. 获取流程全部审批记录
const getProcessRecord = async (
    access_token,
    userId,
    process_instance_id
) => {
    const url = "https://api.dingtalk.com/v1.0/yida/processes/operationRecords"
    const params = {systemToken: systemToken, appType: appType, userId: userId, processInstanceId: process_instance_id}
    return await httpUtil.get(url, params, access_token)
}

// 13. 获取所有一级部门列表
const getSubDeptAll = async (access_token, dept_id = 1) => {
    const url = `https://oapi.dingtalk.com/topapi/v2/department/listsub?access_token=${access_token}`
    const data = {language: "zh_CN", dept_id: dept_id}
    return await httpUtil.post(url, data)
}

// 14. 获取实例详情评论信息
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

//根据dingding用户id获取部门列表
const getDp = async (access_token, user_id) => {
    const url = `https://oapi.dingtalk.com/topapi/v2/department/listparentbyuser?access_token=${access_token}`
    const data = {userid: user_id}
    return await httpUtil.post(url, data)
}

//获取部门详情
const getDpInfo = async (access_token, dept_id) => {
    const url = `https://oapi.dingtalk.com/topapi/v2/department/get?access_token=${access_token}`
    const data = {language: "zh_CN", dept_id: dept_id}
    return await httpUtil.post(url, data)
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

/**
 * 获取离职的员工信息
 *
 * @param token
 * @returns {Promise<*|undefined>}
 */
const getPagingResignEmployees = async (token, nextToken = 0) => {
    const url = "https://api.dingtalk.com/v1.0/hrm/employees/dismissions"
    // 接口单次最大查询条数为50
    const params = {nextToken, maxResults: 30}
    return await httpUtil.get(url, params, token)
}

/**
 * 人员离职的信息
 *
 * @param token
 * @param userIds 最大长度为50
 * @returns {Promise<*|undefined>}
 */
const getResignInfo = async (token, userIds) => {
    if (userIds.length > 50) {
        throw new ParameterError("参数userIds的最大长度为50")
    }
    const url = "https://api.dingtalk.com/v1.0/hrm/employees/dimissionInfos"
    const params = {userIdList: JSON.stringify(userIds)}
    return await httpUtil.get(url, params, token)
}

const getResignEmployees = async (token) => {
    // 分页获取所有离职人员id列表
    const getAllResignEmployees = async (token, nextToken) => {
        let {
            nextToken: dNextToken,
            hasMore,
            userIdList: allResignEmployees
        } = await getPagingResignEmployees(token, nextToken)

        if (hasMore) {
            const data = await getAllResignEmployees(token, dNextToken)
            allResignEmployees = allResignEmployees.concat(data)
        }
        return allResignEmployees
    }

    let allResignEmployees = await getAllResignEmployees(token, 0)

    let allResignEmployeesDetails = []
    while (allResignEmployees.length > 0) {
        // 根据ids获取人员离职详情，单次最大支持50
        const pagingResignEmployees = allResignEmployees.splice(0, 50)
        const usersResignInfo = await getResignInfo(token, pagingResignEmployees)
        allResignEmployeesDetails = allResignEmployeesDetails.concat(usersResignInfo.result)
    }
    return allResignEmployeesDetails
}

module.exports = {
    getDingDingToken: getUserDingDingAccessToken,
    getDingDingAccessToken,
    getFormFields,
    getDpInfo,
    getDp,
    corpAccessToken,
    getremarksAll,
    getSubDeptAll,
    getProcessRecord,
    getDeptUser_def,
    getSubDept,
    getDeptLevel,
    getDeptUserList,
    getFlowsOfStatusAndTimeRange,
    getFlowsOfStatus,
    getPagingFlows,
    getBatchFlowsByIds,
    getUserInfoByToken,
    getFlowsByFormId,
    getUserIdByUnionIdAndToken,
    getUserInfoByUserIdAndToken,
    getAllForms,
    getAllFlowIds,
    getFlowIdsByFormId,
    createProcess,
    getResignEmployees
}
