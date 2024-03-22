const dingDingReq = {};
const {dingDingConfig} = require("../config")
const httpUtil = require("../utils/httpUtil")

// 宜搭配置
const systemToken = dingDingConfig.systemToken;
const appType = dingDingConfig.appType;
const appKey = dingDingConfig.appKey;
const appSecret = dingDingConfig.appSecret;

// accessToken的有效期为7200秒（2小时），有效期内重复获取会返回相同结果并自动续期，过期后获取会返回新的accessToken。
// 1.根据code获取用户token
dingDingReq.getDingDingToken = async (code) => {
    const url = "https://api.dingtalk.com//v1.0/oauth2/userAccessToken"
    const data = {
        clientId: appKey,
        clientSecret: appSecret,
        code: code,
        grantType: "authorization_code"
    }
    return await httpUtil.post(url, data)
}

// 1.获取企业内部应用的access_token
dingDingReq.getDingDingCorpToken = async () => {
    const url = `https://oapi.dingtalk.com/gettoken`
    const params = {
        appkey: appKey,
        appsecret: appSecret
    }
    return await httpUtil.get(url, params)
}

// 2.根据用户token获取通讯录用户信息
dingDingReq.getUserInfoByToken = async (token) => {
    const url = "https://api.dingtalk.com/v1.0/contact/users/me"
    return await httpUtil.get(url, null, token)
}

// 3.根据unionid和企业内部应用token获取userId
dingDingReq.getUserIdByUnionIdAndToken = async (token, unionid) => {
    const url = `https://oapi.dingtalk.com/topapi/user/getbyunionid?access_token=${token}`
    const data = {unionid: unionid}
    return await httpUtil.post(url, data)
}

// 4.根据userid获取用户详情
dingDingReq.getUserInfoByUserIdAndToken = async (token, userid) => {
    const url = `https://oapi.dingtalk.com/topapi/v2/user/get?access_token=${token}`
    const data = {language: "zh_CN", userid}
    return await httpUtil.post(url, data)
}

// 5.获取所有宜搭表单数据
dingDingReq.getAllForms = async (token, userid) => {
    const url = "https://api.dingtalk.com/v1.0/yida/forms"
    const params = {
        formTypes: "process",
        systemToken: systemToken,
        appType: appType,
        userId: userid
    }
    return await httpUtil.get(url, params, token)
}

// 6.获取宜搭流程id列表
dingDingReq.getAllFlowIds = async (
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

// 6.1 根据表单获取多个流程id
dingDingReq.getFlowIdsByFormId = async (token, userId, formUuid) => {
    const url = `https://api.dingtalk.com/v1.0/yida/forms/instances/ids/${appType}/${formUuid}`
    const data = {
        formUuid,
        systemToken: systemToken,
        appType: appType,
        userId: userId,
    };
    return await httpUtil.post(url, data, token)

    // todo: 确认异常是否必须返回固定格式的数据
    //     return {
    //         data: [],
    //     };
}

// 6.2 根据表单id获取所有流程实例详情
dingDingReq.getFlowsByFormId = async (
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

// 7.批量获取宜搭流程实例详情
dingDingReq.getBatchFlowsByIds = async (token, userId, processInstanceIds) => {
    const url = "https://api.dingtalk.com/v1.0/yida/processes/instances/searchWithIds"
    const params = {
        systemToken: systemToken,
        appType: appType,
        userId: userId,
        processInstanceIds: processInstanceIds
    }
    return await httpUtil.get(url, params, token)
}


dingDingReq.getFlowsOfStatus = async (
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

// 7.1 单个获取宜搭流程实例详情
dingDingReq.getFlowsOfStatusAndTimeRange = async (
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
    const result = getPagingFlows(token, dataToSend, pageNumber, pageSize)
    return result;
}

// 8.获取部门用户的userid列表
dingDingReq.getDeptUserList = async (access_token, dept_id) => {
    const url = `https://oapi.dingtalk.com/topapi/user/listid?access_token=${access_token}`
    const data = {
        dept_id: dept_id,
    }
    return await httpUtil.post(url, data)
}

// 9. 获取用户部门层级
dingDingReq.getDeptLevel = async (access_token, userid) => {
    const url = `https://oapi.dingtalk.com/topapi/v2/department/listparentbyuser?access_token=${access_token}`
    const data = {userid: userid}
    return await httpUtil.post(url, data)
}

// 10. 获取子部门id详情
dingDingReq.getSubDept = async (access_token, dept_id) => {
    const url = `https://oapi.dingtalk.com/topapi/v2/department/listsubid?access_token=${access_token}`
    const data = {dept_id: dept_id}
    return await httpUtil.post(url, data)
}

// 11. 获取部门用户基础信息
dingDingReq.getDeptUser_def = async (access_token, dept_id, cursor, size) => {
    const url = `https://oapi.dingtalk.com/topapi/user/listsimple?access_token=${access_token}`
    const data = {cursor, size, dept_id}
    return await httpUtil.post(url, data)
}

// 12. 获取流程全部审批记录
dingDingReq.getProcessRecord = async (
    access_token,
    userId,
    process_instance_id
) => {
    const url = "https://api.dingtalk.com/v1.0/yida/processes/operationRecords"
    const params = {systemToken: systemToken, appType: appType, userId: userId, processInstanceId: process_instance_id}
    return await httpUtil.get(url, params, access_token)
}

// 13. 获取所有一级部门列表
dingDingReq.getSubDeptAll = async (access_token, dept_id = 1) => {
    const url = `https://oapi.dingtalk.com/topapi/v2/department/listsub?access_token=${access_token}`
    const data = {language: "zh_CN", dept_id: dept_id}
    return await httpUtil.post(url, data)
}

// 14. 获取实例详情评论信息
dingDingReq.getremarksAll = async (
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

// 导出oa所有流程
dingDingReq.getOaAllProcess = async (access_token, userId) => {
    const url = "https://api.dingtalk.com/v1.0/workflow/processes/managements/templates"
    const params = {userId: userId}
    return await httpUtil.get(url, params, access_token)
}

dingDingReq.corpAccessToken = async () => {
    const url = "https://api.dingtalk.com/v1.0/oauth2/accessToken"
    const data = {
        appKey: appKey,
        appSecret: appSecret,
    }
    return await httpUtil.post(url, data)
}

//根据dingding用户id获取部门列表
dingDingReq.getDp = async (access_token, user_id) => {
    const url = `https://oapi.dingtalk.com/topapi/v2/department/listparentbyuser?access_token=${access_token}`
    const data = {userid: user_id}
    return await httpUtil.post(url, data)
}

//获取部门详情
dingDingReq.getDpInfo = async (access_token, dept_id) => {
    const url = `https://oapi.dingtalk.com/topapi/v2/department/get?access_token=${access_token}`
    const data = {language: "zh_CN", dept_id: dept_id}
    return await httpUtil.post(url, data)
}

module.exports = dingDingReq;
