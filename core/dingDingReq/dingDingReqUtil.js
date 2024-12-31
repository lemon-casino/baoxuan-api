const crypto = require('crypto')
const { dingDingConfig } = require('../../config/default')
const moment = require('moment')
const { corpAccessToken, getJsapiTickets } = require('./credentialsReq')

const getDingTalkAccessTokenHeader = (token) => {
    return {"x-acs-dingtalk-access-token": token}
}

function sign(jsticket, nonceStr, timeStamp, url) {
    try {
        const plain = `jsapi_ticket=${jsticket}&noncestr=${nonceStr}&timestamp=${timeStamp}&url=${decodeUrl(url)}`;
        const sha1 = crypto.createHash('sha256');
        sha1.update(plain, 'utf8');
        return byteToHex(sha1.digest());
    } catch (error) {
        console.error('Error in sign function:', error);
        throw error;
    }
}
  
// 字节数组转化成十六进制字符串
function byteToHex(buffer) {
    return buffer.toString('hex');
}
  
/**
 * 因为ios端上传递的url是encode过的，android是原始的url。开发者使用的也是原始url,
 * 所以需要把参数进行一般urlDecode
 *
 * @param {string} urlString
 * @returns {string} 解码后的URL
 */
function decodeUrl(urlString) {
    try {
        const parsedUrl = new URL(urlString);
        let urlBuffer = `${parsedUrl.protocol}:`;
        if (parsedUrl.host) {
            urlBuffer += `//${parsedUrl.host}`;
        }
        if (parsedUrl.pathname) {
            urlBuffer += parsedUrl.pathname;
        }
        if (parsedUrl.search) {
            urlBuffer += `?${decodeURIComponent(parsedUrl.search.substring(1))}`;
        }
        return urlBuffer;
    } catch (error) {
        console.error('Error in decodeUrl function:', error);
        throw error;
    }
}

const config = async (url) => {
    let time = moment().valueOf()
    let { accessToken } = await corpAccessToken()
    let jsapiTicket = await getJsapiTickets(accessToken)
    let signature = sign(jsapiTicket, time, time, url)
    return {
        agentId: dingDingConfig.agentId,
        clientId: dingDingConfig.appKey,
        corpId: dingDingConfig.corpId,
        timeStamp: time,
        nonceStr: time,
        signature
    }
}

module.exports = {
    getDingTalkAccessTokenHeader,
    sign,
    config
}