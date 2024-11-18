const { appKey, appSecret, host } = require('../../config/jst')
const crypto = require("crypto")
const httpUtil = require("../../utils/httpUtil")
const { inApi } = require('../../const/jstConst')
const { getAccessToken, sleep } = require('./commonReq')

let headers = {
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
}

const getOrderByShopId = async (shop_id, start, end, type) => {
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
        shop_id,
        start_ts: time,
        modified_begin: start,
        modified_end: end,
    }
    if (type) biz['date_type'] = 2
    body['biz'] = JSON.stringify(biz)
    let message = `${appSecret}access_token${access_token}app_key${appKey}biz${body['biz']}charsetutf-8timestamp${time}version2`
    body['sign'] = crypto.createHash('md5').update(message).digest('hex')
    let url = `${host}${inApi.outQuery}`
    let res = await httpUtil.post(url, body, headers)
    await sleep()
    if (res?.data?.datas) data = res.data.datas
    while (res?.data?.has_next) {
        biz.page_index = (parseInt(biz.page_index) + 1).toString()
        body['biz'] = JSON.stringify(biz)
        message = `${appSecret}access_token${access_token}app_key${appKey}biz${body['biz']}charsetutf-8timestamp${time}version2`
        body['sign'] = crypto.createHash('md5').update(message).digest('hex')
        res = await httpUtil.post(url, body, headers)
        await sleep()
        if (res?.data?.datas) data = data.concat(res.data.datas)
    }
    return data
}

module.exports = {
    getOrderByShopId
}