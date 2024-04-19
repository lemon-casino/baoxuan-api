const axios = require("axios")
const dateUtil = require("./dateUtil")
const RemoteError = require("../error/remoteError")

const delayTime = 500

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
        config = {headers: {"x-acs-dingtalk-access-token": token}}
    }

    try {
        const response = await axios.get(newUrl, config);
        return response.data;
    } catch (error) {
        errorHandler(url, query, config, error)
    }
}

const post = async (url, data, token) => {
    let config = null
    if (token) {
        config = {headers: {"x-acs-dingtalk-access-token": token}}
    }

    try {
        await dateUtil.delay(delayTime)
        const response = await axios.post(url, data, config);
        return response.data;
    } catch (error) {
        errorHandler(url, JSON.stringify(data), config, error)
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