const axios = require("axios")
const Limiter = require('limiter').RateLimiter
const dateUtil = require("./dateUtil")
const RemoteError = require("../error/remoteError")

const limiter = new Limiter({tokensPerInterval: 15, interval: 'second'});

// 临时处理限制请求速度  mq更适合
const delayTime = 100
// global.currentRequstCount = 0
const get = async (url, params, token) => {
    const remainingToken = await limiter.removeTokens(1)
    if (remainingToken <= 0) {
        await dateUtil.delay(delayTime)
    }

    // await dateUtil.delay(delayTime * Math.max(global.currentRequstCount, 0))
    // await dateUtil.delay(delayTime)
    // global.currentRequstCount = global.currentRequstCount + 1

    logger.info(`${process.pid}:${url}`)
    let query = ""
    if (params) {
        query = "?"
        const keys = Object.keys(params)
        for (let i = 0; i < keys.length; i++) {
            if (i > 0) {
                query = `${query}&`
            }
            query = `${query}&${keys[i]}=${params[keys[i]]}`
        }
    }
    const newUrl = `${url}${query}`
    let config = null
    if (token) {
        config = {headers: {"x-acs-dingtalk-access-token": token}}
    }

    try {
        const response = await axios.get(newUrl, config);
        return response.data;
    } catch (error) {
        errorHandler(url, query, config, error)
    } finally {
        // global.currentRequstCount = global.currentRequstCount - 1
    }
}

const post = async (url, data, token) => {
    // await dateUtil.delay(delayTime * Math.max(global.currentRequstCount, 0))
    // await dateUtil.delay(delayTime)
    // global.currentRequstCount = global.currentRequstCount + 1

    const remainingToken = await limiter.removeTokens(1)
    if (remainingToken <= 0) {
        await dateUtil.delay(delayTime)
    }

    logger.info(`${process.pid}:${url}`)
    let config = null
    if (token) {
        config = {headers: {"x-acs-dingtalk-access-token": token}}
    }

    try {
        const response = await axios.post(url, data, config);
        return response.data;
    } catch (error) {
        errorHandler(url, JSON.stringify(data), config, error)
    } finally {
        // global.currentRequstCount = global.currentRequstCount - 1
    }
}

const errorHandler = (url, params, config, error) => {
    let stack = `${error.message}, url: ${url}, params: ${params}`
    if (config) {
        stack = `${stack}, config: ${JSON.stringify(config)}, ${error.stack}`
    }
    if (error.response && error.response.data) {
        stack = `${stack}, ${JSON.stringify(error.response.data)}`
    }
    throw new RemoteError(error.message, stack)
}

module.exports = {
    get,
    post
}