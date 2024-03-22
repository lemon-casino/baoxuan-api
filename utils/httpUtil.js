const axios = require("axios")
const {logger} = require("./log")
const dateUtil = require("./dateUtil")

const delayTime = 300

const get = async (url, params, token) => {
    await dateUtil.delay(delayTime)
    let query = "";
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
        config = {
            headers: {
                "x-acs-dingtalk-access-token": token
            }
        }
    }

    try {
        await dateUtil.delay(80)
        const response = await axios.get(newUrl, config);
        return response.data;
    } catch (error) {

        let message = `${error.message}, url: ${newUrl}`
        if (config) {
            message = `${message}, config: ${JSON.stringify(config)}`
        }
        logger.error(message);
        throw new Error("请求处理异常")
    }
}

const post = async (url, data, token) => {
    let config = null
    if (token) {
        config = {
            headers: {
                "x-acs-dingtalk-access-token": token
            }
        }
    }

    try {
        await dateUtil.delay(delayTime)
        const response = await axios.post(url, data, config);
        return response.data;
    } catch (error) {
        let message = `${error.message}, url: ${url}`
        if (data) {
            message = `${message}, data: ${JSON.stringify(data)}`
        }
        if (config) {
            message = `${message}, data: ${JSON.stringify(config)}`
        }
        logger.error(message);
        throw new Error("请求处理异常")
    }
}


module.exports = {
    get,
    post
}