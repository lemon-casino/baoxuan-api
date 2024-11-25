const { appKey, appSecret, host } = require('../../config/jst')
const crypto = require("crypto")
const httpUtil = require("../../utils/httpUtil")
const { commonApi } = require('../../const/jstConst')
const { redisKeys } = require("../../const/redisConst")
const redisUtil = require("../../utils/redisUtil")

let headers = {
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
}

const randomCode = () => {
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let random_key = ''
    for(let i = 0; i < 6; i++) {
        random_key += characters.charAt(Math.floor(Math.random()*characters.length))
    }
    return random_key
}

const getAccessToken = async () => {
    let access_token = await redisUtil.get(redisKeys.jstToken)
    if (!access_token) {
        let time = Math.round(new Date().getTime() / 1000)
        let random_key = randomCode()
        let message = `${appSecret}app_key${appKey}charsetutf-8code${random_key}grant_typeauthorization_codetimestamp${time}`
        let sign = crypto.createHash('md5').update(message).digest('hex')
        let body = {
            app_key: appKey,
            timestamp: time,
            grant_type: 'authorization_code',
            charset: 'utf-8',
            code: random_key,
            sign
        }
        let url = `${host}${commonApi.token}`
        let res = await httpUtil.post(url, body, headers)
        if (res?.data) {
            access_token = res.data.access_token
            await redisUtil.set(redisKeys.jstToken, access_token, res.data.expires_in)
            await redisUtil.set(redisKeys.jstRefreshToken, res.data.refresh_token, res.data.expires_in)
        }
    }
    return access_token
}

const getShops = async () => {
    let time = Math.round(new Date().getTime() / 1000), data = []
    let access_token = await getAccessToken()
    let body = {
        app_key: appKey,
        access_token,
        timestamp: time,
        version: "2",
        charset: 'utf-8',
    }
    let biz = {
        page_index:"1",
        page_size:"100",
        date_field: "created",
        modified_begin: start,
        modified_end: end,
    }
    body['biz'] = JSON.stringify(biz)
    let message = `${appSecret}access_token${access_token}app_key${appKey}biz${body['biz']}charsetutf-8timestamp${time}version2`
    body['sign'] = crypto.createHash('md5').update(message).digest('hex')
    let url = `${host}${goodsApi.itemQuery}`
    let res = await httpUtil.post(url, body, headers)
    await sleep()
    if (res?.data?.datas) data = res.data.datas
    while (res?.data?.has_next) {
        biz.page_index = (parseInt(biz.page_index) + 1).toString()
        body['biz'] = JSON.stringify(biz)
        message = `${appSecret}access_token${access_token}app_key${appKey}biz${body['biz']}charsetutf-8timestamp${time}version2`
        await sleep()
        body['sign'] = crypto.createHash('md5').update(message).digest('hex')
        res = await httpUtil.post(url, body, headers)
        if (res?.data?.datas) data = data.concat(res.data.datas)
    }
    return data
}

const sleep = async () => {
    await (new Promise(resolve => setTimeout(resolve, 500)))
}

module.exports = {
    getAccessToken,
    getShops,
    sleep
}