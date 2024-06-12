/*
 * @Author: 陈晓飞 481617494@qq.com
 * @Date: 2024-01-08 19:53:47
 * @LastEditors: 陈晓飞 481617494@qq.com
 * @LastEditTime: 2024-03-05 09:06:01
 * @FilePath: /Bi-serve/utils/redisUtil.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const redis = require("../3party/redis")
const set = async (key, value, expire) => {
    try {
        // 检查 expire 是否为有效数值，如果是，则使用 'EX' 选项设置过期时间
        if (!isNaN(expire) && expire > 0) {
            await redis.setEx(key, expire, value);
        } else {
            // 如果没有提供有效的 expire，只设置键值对，不设置过期时间
            await redis.set(key, value);
        }
        return value;
    } catch (err) {
        throw err;
    }
}

const get = async (key) => {
    return await redis.get(key)
}

const getKeys = async (keyPattern) => {
    return await redis.keys(keyPattern)
}

const rPush = async (key, value) => {
    return await redis.rPush(key, value)
}

const lRange = async (key, start, end) => {
    return await redis.lRange(key, start, end)
}

const sAdd = async (key, value) => {
    return await redis.sAdd(key, value)
}

const sMembers = async (key) => {
    return await redis.sMembers(key)
}

module.exports = {
    setValue: set,
    getValue: get,
    getKeys,
    rPush,
    lRange,
    sAdd,
    sMembers
};
