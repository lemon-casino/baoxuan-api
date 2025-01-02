// accessToken的有效期为7200秒（2小时），有效期内重复获取会返回相同结果并自动续期，过期后获取会返回新的accessToken。

const httpUtil = require("@/utils/httpUtil")
const {dingDingConfig} = require("@/config");

const systemToken = dingDingConfig.systemToken;
const appType = dingDingConfig.appType;
const appKey = dingDingConfig.appKey;
const appSecret = dingDingConfig.appSecret;

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
 * 钉钉内部登录-jsapi-ticket
 * @param {*} access_token 
 * @returns 
 */
const getJsapiTickets = async (access_token) => {
    const url = "https://api.dingtalk.com/v1.0/oauth2/jsapiTickets"
    const headers = {
        'x-acs-dingtalk-access-token': access_token,
    }
    return await httpUtil.post(url, {}, headers)
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

module.exports = {
    corpAccessToken,
    getDingDingAccessToken,
    getUserDingDingAccessToken,
    getJsapiTickets
}

