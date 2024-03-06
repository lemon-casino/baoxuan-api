const dingdingUtil = {};
const axios = require("axios");
// 引入日志配置
const { logger } = require("../utils/log");
// 宜搭配置
const yd_formUuid = "FORM-519E4784261346AA940839155F777ADFA5HA";
const yd_systemToken = "DR766X81LZ9BNGPSFBAFB4JD0FLH3D7VCZCIL8";
const yd_appType = "APP_BXS79QCC8MY5ZV0EZZ07";

const appKey = "dinglc7figruiaukkx86";
const appSecret =
  "xbivnBl_KlDbXdQrllrA4LIVvTGWAReK3A9Qb4TjtKwEHO38Osxz8k-bl0_B4fkY";

// accessToken的有效期为7200秒（2小时），有效期内重复获取会返回相同结果并自动续期，过期后获取会返回新的accessToken。
// 1.根据code获取用户token
// TODO: 需要缓存token
dingdingUtil.getddToken = async (code) => {
  try {
    const response = await axios.post(
      "https://api.dingtalk.com//v1.0/oauth2/userAccessToken",
      {
        clientId: appKey,
        clientSecret: appSecret,
        code: code,
        grantType: "authorization_code",
        // appKey: appKey,
        // appSecret: appSecret,
      }
    );
    return response.data;
  } catch (error) {
    logger.error(
      `根据code获取用户token出错了-----------${JSON.stringify(error.response)}`
    );
  }
};
// 1.获取企业内部应用的access_token
// TODO: 需要缓存token
dingdingUtil.getddCorpToken = async () => {
  try {
    const response = await axios.get(
      `https://oapi.dingtalk.com/gettoken?appkey=${appKey}&appsecret=${appSecret}`
    );
    return response.data;
  } catch (error) {
    logger.error(
      `获取企业内部应用的access_token出错了-----------${JSON.stringify(
        error.response
      )}`
    );
  }
};

// 2.根据用户token获取通讯录用户信息
dingdingUtil.getddtxInfo = async (token) => {
  try {
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
      `根据用户token获取通讯录用户信息-----------${JSON.stringify(
        error.response
      )}`
    );
  }
};

// 3.根据unionid和企业内部应用token获取userId
dingdingUtil.getddUserId = async (token, unionid) => {
  try {
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
      `根据unionid和企业内部应用token获取userId-----------${JSON.stringify(
        error.response
      )}`
    );
  }
};

// 4.根据userid获取用户详情
dingdingUtil.getddUserInfo = async (token, userid) => {
  try {
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
      `根据userid获取用户详情-----------${userid}----->${JSON.stringify(
        error.response
      )}`
    );
  }
};

// 5.获取所有宜搭表单数据
dingdingUtil.getyd_FormList = async (token, userid) => {
  try {
    const response = await axios.get(
      `https://api.dingtalk.com/v1.0/yida/forms?formTypes=process&systemToken=${yd_systemToken}&appType=${yd_appType}&userId=${userid}&formTypes=process`,
      {
        headers: {
          "x-acs-dingtalk-access-token": token,
        },
      }
    );
    return response.data;
  } catch (error) {
    logger.error(
      `获取所有宜搭表单数据-----------${userid}------->${JSON.stringify(
        error.response
      )}`
    );
  }
};

// 6.获取宜搭流程id列表
dingdingUtil.getyd_LiuChengList = async (
  token,
  userId,
  formUuid,
  pageSize,
  pageNumber
) => {
  let dataToSend = {
    formUuid,
    systemToken: yd_systemToken,
    appType: yd_appType,
    userId: userId,
  };
  try {
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
      `获取宜搭流程id列表-----------${dataToSend}------->${JSON.stringify(
        error.response
      )}`
    );
    return {
      data: [],
    };
  }
};

// 6.1 根据表单获取多个流程id
dingdingUtil.getyd_LiuChengListByForm = async (token, userId, formUuid) => {
  let dataToSend = {
    formUuid,
    systemToken: yd_systemToken,
    appType: yd_appType,
    userId: userId,
  };
  try {
    const response = await axios.post(
      `https://api.dingtalk.com/v1.0/yida/forms/instances/ids/${yd_appType}/${formUuid}`,
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
      `根据表单获取多个流程id-----------${dataToSend}-------->${JSON.stringify(
        error.response
      )}`
    );
    return {
      data: [],
    };
  }
};

// 6.2 根据表单id获取所有流程实例详情
dingdingUtil.getyd_LiuChengInfoByForm = async (
  token,
  userId,
  formUuid,
  pageSize,
  pageNumber
) => {
  let dataToSend = {
    formUuid,
    systemToken: yd_systemToken,
    appType: yd_appType,
    userId: userId,
    pageSize,
    pageNumber,
  };
  try {
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
      `根据表单id获取所有流程实例详情-----------${dataToSend}------->${JSON.stringify(
        error.response
      )}`
    );
  }
};

// 7.批量获取宜搭流程实例详情
dingdingUtil.getyd_LiuChengInfo = async (token, userId, processInstanceIds) => {
  try {
    const response = await axios.get(
      `https://api.dingtalk.com/v1.0/yida/processes/instances/searchWithIds?systemToken=${yd_systemToken}&appType=${yd_appType}&userId=${userId}&processInstanceIds=${processInstanceIds}`,
      {
        headers: {
          "x-acs-dingtalk-access-token": token,
        },
      }
    );
    return response.data;
  } catch (error) {
    logger.error(
      `批量获取宜搭流程实例详情错误-----------${userId}---${processInstanceIds}-----${JSON.stringify(
        error.response
      )}`
    );
  }
};
// 7.1 单个获取宜搭流程实例详情
dingdingUtil.getyd_LiuChengInfoSingle = async (
  createFromTimeGMT,
  createToTimeGMT,
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
    systemToken: yd_systemToken,
    appType: yd_appType,
    userId: userId,
    createFromTimeGMT,
    createToTimeGMT,
  };
  try {
    const response = await axios.post(
      `https://api.dingtalk.com/v1.0/yida/processes/instances?pageNumber=${pageNumber}&pageSize=${pageSize}`,
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
      `单个获取宜搭流程实例详情错误-----------${dataToSend}------>${JSON.stringify(
        error.response
      )}`
    );
  }
};
// 8.获取部门用户的userid列表
dingdingUtil.getDeptUserList = async (access_token, dept_id) => {
  try {
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
      `获取部门用户的userid列表-----------${dept_id}----->${JSON.stringify(
        error.response
      )}`
    );
  }
};

// 9. 获取用户部门层级
dingdingUtil.getDeptLevel = async (access_token, userid) => {
  try {
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
      `获取用户部门层级-----------${userid}------>${JSON.stringify(
        error.response
      )}`
    );
  }
};
// 10. 获取子部门id详情
dingdingUtil.getSubDept = async (access_token, dept_id) => {
  try {
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
      `获取子部门id详情-----------${dept_id}------->${JSON.stringify(
        error.response
      )}`
    );
  }
};

// 11. 获取部门用户基础信息
dingdingUtil.getDeptUser_def = async (access_token, dept_id, cursor, size) => {
  try {
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
      `获取部门用户基础信息-----------${dept_id}------>${JSON.stringify(
        error.response
      )}`
    );
  }
};

// 12. 获取流程全部审批记录
dingdingUtil.getProcessRecord = async (
  access_token,
  userId,
  process_instance_id
) => {
  try {
    const response = await axios.get(
      `https://api.dingtalk.com/v1.0/yida/processes/operationRecords?systemToken=${yd_systemToken}&appType=${yd_appType}&userId=${userId}&processInstanceId=${process_instance_id}`,
      {
        headers: {
          "x-acs-dingtalk-access-token": access_token,
        },
      }
    );
    return response.data;
  } catch (error) {
    logger.error(
      `获取流程全部审批记录-----------${userId}--${process_instance_id}------${JSON.stringify(
        error.response
      )}`
    );
  }
};
// 13. 获取所有一级部门列表
dingdingUtil.getSubDeptAll = async (access_token, dept_id = 1) => {
  try {
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
      `获取所有一级部门列表错误-----------${dept_id}--------${JSON.stringify(
        error.response
      )}`
    );
  }
};
// 14. 获取实例详情评论信息
dingdingUtil.getremarksAll = async (
  access_token,
  formUuid,
  userId,
  formInstanceIdList
) => {
  let dataToSend = {
    formUuid,
    systemToken: yd_systemToken,
    appType: yd_appType,
    userId: userId,
    formInstanceIdList,
  };
  try {
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
    console.log('error.response ================>', error);
    logger.error(
      `获取实例详情评论信息错误-----------${dept_id}--------${JSON.stringify(
        error.response
      )}`
    );
  }
};

// 导出oa所有流程
dingdingUtil.getOaAllProcess = async (access_token, userId) => {
  try {
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
    logger.error(`-----------${JSON.stringify(error.response)}`);
  }
};

dingdingUtil.corpAccessToken = async () => {
  try {
    const response = await axios.post(
      "https://api.dingtalk.com/v1.0/oauth2/accessToken",
      {
        appKey: appKey,
        appSecret: appSecret,
      }
    );
    return response.data;
  } catch (error) {
    logger.error(`corpAccessToken-----------${JSON.stringify(error.response)}`);
  }
};

//根据dingding用户id获取部门列表
dingdingUtil.getDp = async (access_token, user_id) => {
  try {
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
      `根据dingding用户id获取部门列表-----------${user_id}------>${JSON.stringify(
        error.response
      )}`
    );
  }
};

//获取部门详情
dingdingUtil.getDpInfo = async (access_token, dept_id) => {
  try {
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
      `获取部门详情错误-----------${dept_id}----->${JSON.stringify(
        error.response
      )}`
    );
  }
};
module.exports = dingdingUtil;
