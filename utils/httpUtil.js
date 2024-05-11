const axios = require("axios")
const dateUtil = require("./dateUtil")
const RemoteError = require("../error/remoteError")

// 状态码不一定准确，故使用关键词 [400, 403]
const dingDingRateLimitErrorKeywords = ["过多", "频繁", "流控", "限制"]

const delayTime = 0
const get = async (url, params, token) => {
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
        if (error.response) {
            // 如果出现限流错误，则重试
            const {data} = error.response
            let isRateLimited = false
            if (data.message) {
                for (const errKeyword of dingDingRateLimitErrorKeywords) {
                    if (data.message.includes(errKeyword)) {
                        isRateLimited = true
                        break
                    }
                }
            }
            if (isRateLimited) {
                await dateUtil.delay(1000)
                return await get(url, params, token)
            } else {
                errorHandler(url, query, config, error)
            }
        } else {
            errorHandler(url, JSON.stringify(params), config, error)
        }
    }
}

const post = async (url, data, token) => {
    logger.info(`${process.pid}:${url}`)
    let config = null
    if (token) {
        config = {headers: {"x-acs-dingtalk-access-token": token}}
    }

    try {
        const response = await axios.post(url, data, config);
        return response.data;
    } catch (error) {
        // 如果出现限流错误，则重试
        if (error.response) {
            const errData = error.response.data
            let isRateLimited = false
            if (errData.message) {
                for (const errKeyword of dingDingRateLimitErrorKeywords) {
                    if (errData.message.includes(errKeyword)) {
                        isRateLimited = true
                        break
                    }
                }
            }
            if (isRateLimited) {
                await dateUtil.delay(1000)
                return await post(url, data, token)
            } else {
                errorHandler(url, JSON.stringify(data), config, error)
            }
        } else {
            errorHandler(url, JSON.stringify(data), config, error)
        }
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