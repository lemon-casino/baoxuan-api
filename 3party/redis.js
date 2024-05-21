const redis = require("redis");
const redisConfig = require("../config/index").redisConfig;
const userLogRepo = require("../repository/userLogRepo")

const options = {
    url: `redis://${redisConfig.url}:${redisConfig.port}`,
}
if (redisConfig.password) {
    options["password"] = redisConfig.password
}

const client = redis.createClient(options);

(async () => {
    await client.connect()
    const subscriber = client.duplicate();
    await subscriber.connect();
    await subscriber.subscribe('__keyevent@0__:expired', async (key) => {
        // 仅监听登录相关的过期key
        if (key.includes("login:")) {
            const userId = key.split(":")[1]
            const userLog = await userLogRepo.getLatestUserLog(userId)
            if (userLog && userLog.id) {
                await userLogRepo.updateFields(userLog.id, {isOnline: false})
            }
        }
    })
})();

client.on("connect", () => {
    console.log("Redis 连接成功");
})
client.on("ready", () => {
    console.log("Redis 连接成功，准备好接收命令");
})
client.on("error", (err) => {
    console.log("Redis 失败日志：" + err);
})

module.exports = client