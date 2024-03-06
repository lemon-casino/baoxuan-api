/*
 * @Author: 陈晓飞 481617494@qq.com
 * @Date: 2024-01-08 19:53:47
 * @LastEditors: 陈晓飞 481617494@qq.com
 * @LastEditTime: 2024-03-05 09:06:01
 * @FilePath: /Bi-serve/utils/redis.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const redis = require("redis");
const redisConfig = require("../config/index").redisConfig;
// 创建客户端实例的方式已经改变
// 现在使用 createClient 方法接受一个对象参数
const client = redis.createClient({
  // 注意：port 和 host 参数应该放在一个对象中传递
  // 如果你的 Redis 服务器运行在标准端口（6379）上，并且是本地的，这些参数可以省略
  url: `redis://${redisConfig.url}:${redisConfig.port}`,
  // 如果 Redis 服务器需要密码，可以这样传递
  // password: config.password,
});
(async () => { await client.connect() })();


client.on("error", (err) => {
  console.log("Redis 失败日志：" + err);
});

client.on("connect", () => {
  console.log("Redis 已启动");
});
// 在 Redis 4.x 中，不需要显式调用 auth 方法
// 如果提供了 password 配置，客户端会自动尝试认证

// 连接到 Redis
const redisConnect = {};
// 延迟函数
const delay = (ms = 800) => new Promise((res) => setTimeout(res, ms));
redisConnect.setKey = async (key, value, expire) => {
  try {
    // await client.connect();
    let reply;
    // 检查 expire 是否为有效数值，如果是，则使用 'EX' 选项设置过期时间
    if (!isNaN(expire) && expire > 0) {
      console.log("加时间=========>");
      reply = await client.set(key, value);
      await client.expire(key, expire);
    } else {
      console.log("不加时间=========>");
      // 如果没有提供有效的 expire，只设置键值对，不设置过期时间
      reply = await client.set(key, value);
    }
    return reply;
  } catch (err) {
    console.error("redis 存储出错了======》", err);
    throw err;
  }
};


redisConnect.getKey = async (key) => {
  try {
    let reply;
    reply = await client.get(key);
    return reply;
  } catch (error) {
  }
  return;
};

module.exports = redisConnect;
