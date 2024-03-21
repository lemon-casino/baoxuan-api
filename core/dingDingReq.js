const dingDingReq = {};
const axios = require("axios");
const {logger} = require("../utils/log");
const {dingDingConfig} = require("../config")
const dateUtil = require("../utils/dateUtil")
const delayTime = 200
// 宜搭配置
const systemToken = dingDingConfig.systemToken;
const appType = dingDingConfig.appType;
const appKey = dingDingConfig.appKey;
const appSecret = dingDingConfig.appSecret;

const dingDingUrls = {
    userAccessToken: "https://api.dingtalk.com//v1.0/oauth2/userAccessToken"
}

// accessToken的有效期为7200秒（2小时），有效期内重复获取会返回相同结果并自动续期，过期后获取会返回新的accessToken。
// 1.根据code获取用户token
dingDingReq.getDingDingToken = async (code) => {
    try {
        const response = await axios.post(
            dingDingUrls.userAccessToken,
            {
                clientId: appKey,
                clientSecret: appSecret,
                code: code,
                grantType: "authorization_code"
            }
        );
        return response.data;
    } catch (error) {
        logger.error(
            `根据code获取用户token出错了-----------${error.message}`
        );
    }
};
// 1.获取企业内部应用的access_token
// TODO: 需要缓存token
dingDingReq.getDingDingCorpToken = async () => {
    try {
        await dateUtil.delay(80)
        const response = await axios.get(
            `https://oapi.dingtalk.com/gettoken?appkey=${appKey}&appsecret=${appSecret}`
        );
        return response.data;
    } catch (error) {
        logger.error(
            `获取企业内部应用的access_token出错了-----------${error.message}`
        );
    }
};

// 2.根据用户token获取通讯录用户信息
dingDingReq.getUserInfoByToken = async (token) => {
    try {
        await dateUtil.delay(80)
        const response = await axios.get(
            "https://api.dingtalk.com/v1.0/contact/users/me",
            {
                headers: {
                    "x-acs-dingtalk-access-token": token,
                },
            }
        );
        return response.data;
    } catch (error) {
        logger.error(
            `根据用户token获取通讯录用户信息-----------${error.message}`
        );
    }
};

// 3.根据unionid和企业内部应用token获取userId
dingDingReq.getUserIdByUnionIdAndToken = async (token, unionid) => {
    try {
        await dateUtil.delay(80)
        const response = await axios.post(
            "https://oapi.dingtalk.com/topapi/user/getbyunionid?access_token=" +
            token,
            {
                unionid: unionid,
            }
        );
        return response.data;
    } catch (error) {
        logger.error(
            `根据unionid和企业内部应用token获取userId-----------${error.message}`
        );
    }
};

// 4.根据userid获取用户详情
dingDingReq.getUserInfoByUserIdAndToken = async (token, userid) => {
    try {
        await dateUtil.delay(80)
        const response = await axios.post(
            "https://oapi.dingtalk.com/topapi/v2/user/get?access_token=" + token,
            {
                language: "zh_CN",
                userid,
            }
        );
        return response.data;
    } catch (error) {
        logger.error(
            `根据userid获取用户详情-----------${userid}----->${error.message}`
        );
    }
};

// 5.获取所有宜搭表单数据
dingDingReq.getAllForms = async (token, userid) => {
    try {
        await dateUtil.delay(80)
        const response = await axios.get(
            `https://api.dingtalk.com/v1.0/yida/forms?formTypes=process&systemToken=${systemToken}&appType=${appType}&userId=${userid}&formTypes=process`,
            {
                headers: {
                    "x-acs-dingtalk-access-token": token,
                },
            }
        );
        return response.data;
    } catch (error) {
        logger.error(
            `获取所有宜搭表单数据-----------${userid}------->${error.message}`
        );
    }
};

// 6.获取宜搭流程id列表
dingDingReq.getAllFlowIds = async (
    token,
    userId,
    formUuid,
    pageSize,
    pageNumber
) => {
    let dataToSend = {
        formUuid,
        systemToken: systemToken,
        appType: appType,
        userId: userId,
    };
    try {
        await dateUtil.delay(80)
        const response = await axios.post(
            `https://api.dingtalk.com/v1.0/yida/processes/instanceIds?pageSize=${pageSize}&pageNumber=${pageNumber}`,
            dataToSend,
            {
                headers: {
                    "x-acs-dingtalk-access-token": token,
                },
            }
        );
        return response.data;
    } catch (error) {
        logger.error(
            `获取宜搭流程id列表-----------${dataToSend}------->${error.message}`
        );
        return {
            data: [],
        };
    }
};

// 6.1 根据表单获取多个流程id
dingDingReq.getFlowIdsByFormId = async (token, userId, formUuid) => {
    let dataToSend = {
        formUuid,
        systemToken: systemToken,
        appType: appType,
        userId: userId,
    };
    try {
        await dateUtil.delay(delayTime)
        const response = await axios.post(
            `https://api.dingtalk.com/v1.0/yida/forms/instances/ids/${appType}/${formUuid}`,
            dataToSend,
            {
                headers: {
                    "x-acs-dingtalk-access-token": token,
                },
            }
        );
        return response.data;
    } catch (error) {
        logger.error(
            `根据表单获取多个流程id-----------${dataToSend}-------->${error.message}`
        );
        return {
            data: [],
        };
    }
};

// 6.2 根据表单id获取所有流程实例详情
dingDingReq.getFlowsByFormId = async (
    token,
    userId,
    formUuid,
    pageSize,
    pageNumber
) => {
    let dataToSend = {
        formUuid,
        systemToken: systemToken,
        appType: appType,
        userId: userId,
        pageSize,
        pageNumber,
    };
    try {
        await dateUtil.delay(delayTime)
        const response = await axios.post(
            `https://api.dingtalk.com/v1.0/yida/forms/instances/advances/queryAll`,
            dataToSend,
            {
                headers: {
                    "x-acs-dingtalk-access-token": token,
                },
            }
        );
        return response.data;
    } catch (error) {
        logger.error(
            `根据表单id获取所有流程实例详情-----------${dataToSend}------->${error.message}`
        );
    }
};

// 7.批量获取宜搭流程实例详情
dingDingReq.getBatchFlowsByIds = async (token, userId, processInstanceIds) => {
    try {
        await dateUtil.delay(delayTime)
        const response = await axios.get(
            `https://api.dingtalk.com/v1.0/yida/processes/instances/searchWithIds?systemToken=${systemToken}&appType=${appType}&userId=${userId}&processInstanceIds=${processInstanceIds}`,
            {
                headers: {
                    "x-acs-dingtalk-access-token": token,
                },
            }
        );
        return response.data;
    } catch (error) {
        logger.error(
            `批量获取宜搭流程实例详情错误-----------${userId}---${processInstanceIds}-----${error.message}`
        );
    }
};


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
    try {
        await dateUtil.delay(delayTime)
        const response = await axios.post(
            `https://api.dingtalk.com/v1.0/yida/processes/instances?pageNumber=${pageNumber}&pageSize=${pageSize}`,
            data,
            {
                headers: {
                    "x-acs-dingtalk-access-token": token,
                }
            }
        );
        return response.data;
    } catch (error) {
        logger.error(
            `单个获取宜搭流程实例详情错误: ${error.message}  
            data:${JSON.stringify(data)} --- 
            token: ${token} --- 
            response:${JSON.stringify(error.response || {})}`
        );
    }
    return null
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
};

// 8.获取部门用户的userid列表
dingDingReq.getDeptUserList = async (access_token, dept_id) => {
    try {
        await dateUtil.delay(delayTime)
        const response = await axios.post(
            "https://oapi.dingtalk.com/topapi/user/listid?access_token=" +
            access_token,
            {
                dept_id: dept_id,
            }
        );
        return response.data;
    } catch (error) {
        logger.error(
            `获取部门用户的userid列表-----------${dept_id}----->${error.message}`
        );
    }
};

// 9. 获取用户部门层级
dingDingReq.getDeptLevel = async (access_token, userid) => {
    try {
        await dateUtil.delay(delayTime)
        const response = await axios.post(
            "https://oapi.dingtalk.com/topapi/v2/department/listparentbyuser?access_token=" +
            access_token,
            {
                userid: userid,
            }
        );
        return response.data;
    } catch (error) {
        logger.error(
            `获取用户部门层级-----------${userid}------>${error.message}`
        );
    }
};

// 10. 获取子部门id详情
dingDingReq.getSubDept = async (access_token, dept_id) => {
    try {
        await dateUtil.delay(delayTime)
        const response = await axios.post(
            "https://oapi.dingtalk.com/topapi/v2/department/listsubid?access_token=" +
            access_token,
            {
                dept_id: dept_id,
            }
        );
        return response.data;
    } catch (error) {
        logger.error(
            `获取子部门id详情-----------${dept_id}------->${error.message}`
        );
    }
};

// 11. 获取部门用户基础信息
dingDingReq.getDeptUser_def = async (access_token, dept_id, cursor, size) => {
    try {
        await dateUtil.delay(delayTime)
        const response = await axios.post(
            "https://oapi.dingtalk.com/topapi/user/listsimple?access_token=" +
            access_token,
            {
                cursor,
                // contain_access_limit: true,
                size,
                // order_field: "modify_desc",
                dept_id,
            }
        );
        return response.data;
    } catch (error) {
        logger.error(
            `获取部门用户基础信息-----------${dept_id}------>${error.message}`
        );
    }
};

// 12. 获取流程全部审批记录
dingDingReq.getProcessRecord = async (
    access_token,
    userId,
    process_instance_id
) => {
    try {
        await dateUtil.delay(delayTime)
        const response = await axios.get(
            `https://api.dingtalk.com/v1.0/yida/processes/operationRecords?systemToken=${systemToken}&appType=${appType}&userId=${userId}&processInstanceId=${process_instance_id}`,
            {
                headers: {
                    "x-acs-dingtalk-access-token": access_token,
                },
            }
        );
        return response.data;
    } catch (error) {
        logger.error(
            `获取流程全部审批记录-----------${userId}--${process_instance_id}------${error.message}`
        );
    }
};

// 13. 获取所有一级部门列表
dingDingReq.getSubDeptAll = async (access_token, dept_id = 1) => {
    try {
        await dateUtil.delay(delayTime)
        const response = await axios.post(
            "https://oapi.dingtalk.com/topapi/v2/department/listsub?access_token=" +
            access_token,
            {
                language: "zh_CN",
                dept_id: dept_id,
            }
        );
        return response.data;
    } catch (error) {
        logger.error(
            `获取所有一级部门列表错误-----------${dept_id}--------${error.message}`
        );
    }
};
// 14. 获取实例详情评论信息
dingDingReq.getremarksAll = async (
    access_token,
    formUuid,
    userId,
    formInstanceIdList
) => {
    let dataToSend = {
        formUuid,
        systemToken: systemToken,
        appType: appType,
        userId: userId,
        formInstanceIdList,
    };
    try {
        await dateUtil.delay(delayTime)
        const response = await axios.post(
            "https://api.dingtalk.com/v1.0/yida/forms/remarks/query",
            dataToSend,
            {
                headers: {
                    "x-acs-dingtalk-access-token": access_token,
                },
            }
        );
        return response.data;
    } catch (error) {
        logger.error(
            `获取实例详情评论信息错误-----------${dept_id}--------${error.message}`
        );
    }
};

// 导出oa所有流程
dingDingReq.getOaAllProcess = async (access_token, userId) => {
    try {
        await dateUtil.delay(delayTime)
        const response = await axios.get(
            `https://api.dingtalk.com/v1.0/workflow/processes/managements/templates?userId=${userId}`,
            {
                headers: {
                    "x-acs-dingtalk-access-token": access_token,
                },
            }
        );
        return response.data;
    } catch (error) {
        logger.error(`-----------${error.message}`);
    }
};

dingDingReq.corpAccessToken = async () => {
    try {
        await dateUtil.delay(delayTime)
        const response = await axios.post(
            "https://api.dingtalk.com/v1.0/oauth2/accessToken",
            {
                appKey: appKey,
                appSecret: appSecret,
            }
        );
        return response.data;
    } catch (error) {
        logger.error(`corpAccessToken-----------${error.message}`);
    }
};

//根据dingding用户id获取部门列表
dingDingReq.getDp = async (access_token, user_id) => {
    try {
        await dateUtil.delay(delayTime)
        const response = await axios.post(
            "https://oapi.dingtalk.com/topapi/v2/department/listparentbyuser?access_token=" +
            access_token,
            {
                userid: user_id,
            }
        );
        return response.data;
    } catch (error) {
        logger.error(
            `根据dingding用户id获取部门列表-----------${user_id}------>${error.message}`
        );
    }
};

//获取部门详情
dingDingReq.getDpInfo = async (access_token, dept_id) => {
    try {
        await dateUtil.delay(delayTime)
        const response = await axios.post(
            "https://oapi.dingtalk.com/topapi/v2/department/get?access_token=" +
            access_token,
            {
                language: "zh_CN",
                dept_id: dept_id,
            }
        );
        return response.data;
    } catch (error) {
        logger.error(
            `获取部门详情错误-----------${dept_id}----->${error.message}`
        );
    }
};
module.exports = dingDingReq;
