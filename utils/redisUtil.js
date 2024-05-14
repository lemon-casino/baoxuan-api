/*
 * @Author: 陈晓飞 481617494@qq.com
 * @Date: 2024-01-08 19:53:47
 * @LastEditors: 陈晓飞 481617494@qq.com
 * @LastEditTime: 2024-03-05 09:06:01
 * @FilePath: /Bi-serve/utils/redisUtil.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const redisUtil = require("redis");
const redisConfig = require("../config/index").redisConfig;
// 创建客户端实例的方式已经改变
// 现在使用 createClient 方法接受一个对象参数
const options = {
    url: `redis://${redisConfig.url}:${redisConfig.port}`,
}
if (redisConfig.password) {
    options["password"] = redisConfig.password
}

const client = redisUtil.createClient(options);

(async () => {
    await client.connect()
    const subscriber = client.duplicate();
    await subscriber.connect();
    await subscriber.subscribe('__keyevent@0__:expired', (message) => {
        logger.warn("__keyevent@0__:expire")
        logger.warn(message)
    });
    await subscriber.subscribe('__keyespace@0__:login* del', (message) => {
        logger.warn("__keyespace@0__:login* del")
        logger.warn(message)
    });
})();

client.on("error", (err) => {
    console.log("Redis 失败日志：" + err);
});

client.on("connect", () => {
    console.log("Redis 已启动");
});


const setKey = async (key, value, expire) => {
    try {
        // 检查 expire 是否为有效数值，如果是，则使用 'EX' 选项设置过期时间
        if (!isNaN(expire) && expire > 0) {
            await client.setEx(key, expire, value);
        } else {
            // 如果没有提供有效的 expire，只设置键值对，不设置过期时间
            await client.set(key, value);
        }
        return value;
    } catch (err) {
        console.error("redisUtil 存储出错了======》", err);
        throw err;
    }
};

const getKey = async (key) => {
    try {
        return await client.get(key);
    } catch (error) {
    }
    return null;
};

module.exports = {
    setKey,
    getKey
};
