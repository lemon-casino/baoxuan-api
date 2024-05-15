/*
 * @Author: 陈晓飞 481617494@qq.com
 * @Date: 2024-01-08 19:53:47
 * @LastEditors: 陈晓飞 481617494@qq.com
 * @LastEditTime: 2024-03-05 09:06:01
 * @FilePath: /Bi-serve/utils/redisUtil.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const redis = require("../3party/redis")
const setKey = async (key, value, expire) => {
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
        console.error("redisUtil 存储出错了======》", err);
        throw err;
    }
};

const getKey = async (key) => {
    try {
        return await redis.get(key);
    } catch (error) {
    }
    return null;
};

module.exports = {
    setKey,
    getKey
};
