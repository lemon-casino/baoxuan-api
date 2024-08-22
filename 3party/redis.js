const redis = require("redis");
const redisConfig = require("@/config/index").redisConfig;
const userLogRepo = require("@/repository/userLogRepo");
const {procurementSelection} = require("@/router_handler/procurementSelectionEetingApi");

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




            //采购选品会  procurementSelectionMeeting
            const procurementSelectionMeeting = objects.filter(obj => obj.formUuid === 'FORM-33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP');
            // 采购任务运营发布(全流程)
            const procurementTaskOperationRelease = objects.filter(obj => obj.formUuid === 'FORM-6A9E954714A64B8FA38BA44320CA928FDPBO');


            // 存储符合条件的对象到新的键
            await client.set('flows:today:form:495A1584CBE84928BB3B1E0D4AA4B56AYN1J', JSON.stringify(Cat_lLink));
            await client.set('flows:today:form:51A6DCCF660B4C1680135461E762AC82JV53', JSON.stringify(linking_issues));
            await client.set('flows:today:form:0X966971LL0EI3OC9EJWUATDC84838H8V09ML1', JSON.stringify(Cat_linkListing));
            await client.set('flows:today:form:6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3', JSON.stringify(operationNewFlowFormId));
            await client.set('flows:today:form:CC0B476071F24581B129A24835910B81AK56', JSON.stringify(baoKeMengNewFlowFormId));
            await client.set('flows:today:form:33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP', JSON.stringify(procurementSelectionMeeting));
            await client.set('flows:today:form:6A9E954714A64B8FA38BA44320CA928FDPBO', JSON.stringify(procurementTaskOperationRelease));

            console.log('Data set successfully.');
        }
    });
    await subscriber.subscribe('__keyspace@0__:flows:today:form:33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP', async (message) => {

        const  procurement = []
        // 采购选品会
        if (message === 'set') {
            const data = await client.get('flows:today:form:33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP');

            // 解析数据
            let objects;
            try {
                objects = JSON.parse(data);
            } catch (parseErr) {
                console.error('Error parsing data:', parseErr);
                return;
            }

            for (const flow of objects) {
                if (!flow.data) {
                    continue
                }
                const originator = flow.originator.name.nameInChinese;
                const productName = flow.data["textField_lii9qtrm"]
                const vendorName = flow.data["textField_lii9qtro"]
                const duration = flow.data["textField_lii9qtrx"]
                const productAttributes = flow.data["radioField_lruf2zuu"]
                const patentOwnership = flow.data["textareaField_lruf2zuw"]
                //推品产品线
                const pushProductLine = flow.data["selectField_ly8fgd3l"]!==undefined ? flow.data["selectField_ly8fgd3l"] : ""
                //运营负责人
                const headOfOperations = flow.data["employeeField_lii9qts2"]!==undefined ? flow.data["employeeField_lii9qts2"][0] : ""
                const  creationTime = flow.createTimeGMT
                const updatedTime = flow.modifiedTimeGMT
                const optimizationSuggestions=flow.data["textareaField_lutoemnz"]
                const selectionAttributes =flow.data["radioField_lrhgr6i7"]

                const processInstanceId = flow.processInstanceId
                procurement.push({
                    "originator":originator,
                    "productName":productName,
                    "vendorName":vendorName,
                    "duration":duration,
                    "productAttributes":productAttributes,
                    "patentOwnership":patentOwnership,
                    "pushProductLine":pushProductLine,
                    "headOfOperations":headOfOperations,
                    "creationTime":creationTime,
                    "updatedTime":updatedTime,
                    "optimizationSuggestions":optimizationSuggestions,
                    "processInstanceId":processInstanceId,
                    "selectionAttributes":selectionAttributes
                });
            }
            await procurementSelection(procurement);
        }
    });

})();

module.exports = client;
