const redis = require("redis");
const redisConfig = require("@/config/index").redisConfig;
const userLogRepo = require("@/repository/userLogRepo");

const options = {
    url: `redis://${redisConfig.url}:${redisConfig.port}/0`,
};

if (redisConfig.password) {
    options.password = redisConfig.password;
}

const client = redis.createClient(options);

client.on("connect", () => {
    console.log("Redis 连接成功");
});

client.on("ready", () => {
    console.log("Redis 连接成功，准备好接收命令");
});

client.on("error", (err) => {
    console.log("Redis 失败日志：" + err);
});

(async () => {
    await client.connect();

    const subscriber = client.duplicate();
    await subscriber.connect();

    await subscriber.subscribe('__keyevent@0__:expired', async (key) => {
        // 仅监听登录相关的过期key
        if (key.includes("login:")) {
            const userId = key.split(":")[1];
            const userLog = await userLogRepo.getLatestUserLog(userId);
            if (userLog && userLog.id) {
                await userLogRepo.updateFields(userLog.id, { isOnline: false });
            }
        }
    });

    await subscriber.subscribe('__keyspace@0__:flows:today:running_and_finished', async (message) => {
        if (message === 'set') {
            const data = await client.get('flows:today:running_and_finished');

            // 解析数据
            let objects;
            try {
                objects = JSON.parse(data);
            } catch (parseErr) {
                console.error('Error parsing data:', parseErr);
                return;
            }

            // 过滤符合条件的对象
             //天猫链接打架流程表单id
            const Cat_lLink = objects.filter(obj => obj.formUuid === 'FORM-495A1584CBE84928BB3B1E0D4AA4B56AYN1J');
            //链接问题处理数据需要筛选的流程表单id
            const linking_issues = objects.filter(obj => obj.formUuid === 'FORM-51A6DCCF660B4C1680135461E762AC82JV53');
            //天猫链接上架流程
            const  Cat_linkListing= objects.filter(obj => obj.formUuid === 'FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1');
            //新品运营
            const operationNewFlowFormId = objects.filter(obj => obj.formUuid === 'FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3');
            // 宝可梦 新品开发流程
            const baoKeMengNewFlowFormId = objects.filter(obj => obj.formUuid === 'FORM-CC0B476071F24581B129A24835910B81AK56');

            // 存储符合条件的对象到新的键
            await client.set('flows:today:form:495A1584CBE84928BB3B1E0D4AA4B56AYN1J', JSON.stringify(Cat_lLink));
            await client.set('flows:today:form:51A6DCCF660B4C1680135461E762AC82JV53', JSON.stringify(linking_issues));
            await client.set('flows:today:form:0X966971LL0EI3OC9EJWUATDC84838H8V09ML1', JSON.stringify(Cat_linkListing));
            await client.set('flows:today:form:6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3', JSON.stringify(operationNewFlowFormId));
            await client.set('flows:today:form:CC0B476071F24581B129A24835910B81AK56', JSON.stringify(baoKeMengNewFlowFormId));
            console.log('Data set successfully.');
        }
    });
})();

module.exports = client;
