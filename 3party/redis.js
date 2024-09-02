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
    function getValueFromPath(flow, path) {
        const value = path.reduce((acc, val) => acc?.[val] ?? '', flow) || '';
        return Array.isArray(value) ? value.join(', ') : value;
    }
    async function handleSubscription(key, mappings) {
        const procurement = [];

        const data = await client.get(key);
        let objects;
        try {
            objects = JSON.parse(data);
        } catch (parseErr) {
            console.error('Error parsing data:', parseErr);
            return;
        }

        for (const flow of objects) {
            if (!flow.data) continue;

            const procurementItem = {};
            for (const [key, path] of Object.entries(mappings)) {
                procurementItem[key] = getValueFromPath(flow, path);
            }

            procurement.push({
                ...procurementItem,
                originator: flow.originator.name.nameInChinese,
                processInstanceId: flow.processInstanceId,
                creationTime: flow.createTimeGMT,
                updatedTime: flow.modifiedTimeGMT,
            });
        }

        await procurementSelection(procurement);
    }




    await subscriber.subscribe('__keyspace@0__:flows:today:form:33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP', async (message) => {
        if (message === 'set') {
            await handleSubscription('flows:today:form:33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP',  {
                productName: ['data', 'textField_lii9qtrm'],
                vendorName: ['data', 'textField_lii9qtro'],
                duration: ['data', 'textField_lii9qtrx'],
                productAttributes: ['data', 'radioField_lruf2zuu'],
                patentOwnership: ['data', 'textareaField_lruf2zuw'],
                pushProductLine: ['data', 'selectField_ly8fgd3l'],
                headOfOperations: ['data', 'employeeField_lii9qts2', 0],
                optimizationSuggestions: ['data', 'textareaField_lutoemnz'],
                selectionAttributes: ['data', 'radioField_lrhgr6i7'],
                designDefinition: ['data', 'checkboxField_lydscsls'],
            });
        }
    });

    await subscriber.subscribe('__keyspace@0__:flows:today:form:6A9E954714A64B8FA38BA44320CA928FDPBO', async (message) => {
        if (message === 'set') {
            await handleSubscription('flows:today:form:6A9E954714A64B8FA38BA44320CA928FDPBO', {
                productName: ['data', 'textField_liiewljh'],
                pushProductLine: ['data', 'radioField_ly8fkgfp'],
                vendorName: ['data', 'textField_luxnuynv'],
                duration: ['data', 'textField_lii9qtrx'],
                productAttributes: ['data', 'radioField_lydslr5w'],
                designDefinition: ['data', 'checkboxField_lydslr5y'],
                platform: ['data', 'radioField_lxmrs12b'],
                marketAnalysis: ['data', 'radioField_lvesa8t4'],
                selectionDataSource: ['data', 'radioField_lyqx348a'],
                moq: ['data', 'textareaField_ly2rbbf6'],
                preEncoded: ['data', 'textareaField_ly8gdzed'],
                headOfOperationsOf1688: ['data', 'employeeField_lxn3p28p', 0],
                douyin_headOfKuaishouOperations: ['data', 'employeeField_lxn3p28o', 0],
                headOfOperationsAtCoupang: ['data', 'employeeField_lxn3p28n', 0],
                tmall_verticalStore_XiaohongshuOperationLeader: ['data', 'employeeField_lxn3p28l', 0],
                gain_headOfOperationsAtVipshop: ['data', 'employeeField_lxn3p28k', 0],
                headOfOperationsAtAmoyFactory: ['data', 'employeeField_lxn3p28g', 0],
                headOfTmallSupermarketOperations: ['data', 'employeeField_lxn3p28f', 0],
                headOfJDComOperations: ['data', 'employeeField_lxn3p28c', 0],
                counterElectTheHeadOfOperations: ['data', 'employeeField_lxn3p28q', 0],
                headOfTmallOperations: ['data', 'employeeField_lvesa8t3', 0],
                whetherTmallIsSelected: ['data', 'radioField_lxn4uimw'],
                whetherJDIsSelected: ['data', 'radioField_lxn4uimx'],
                pinduoduoIsSelected: ['data', 'radioField_lxn4uimy'],
                whetherTmallSupermarketIsSelected: ['data', 'radioField_lxn4uimz'],
                whetherTheTaoFactoryIsSelected: ['data', 'radioField_lxn4uin0'],
                dewu_vipshopWillBeSelected: ['data', 'radioField_lxn4uin1'],
                tmall_verticalStore_XiaohongshuIsSelected: ['data', 'radioField_lxn4uin2'],
                whetherOrNotCoupangIsSelected: ['data', 'radioField_lxn4uin3'],
                douyin_kuaishouIsSelected: ['data', 'radioField_lxn4uin4'],
                IsUnchecked_1688: ['data', 'radioField_lxn4uin5'],
                whetherToChooseTheJDOperationSample: ['data', 'radioField_lxn6zu7z'],
                whetherTheTmallOperationSampleIsSelected: ['data', 'radioField_lxn6zu7y'],
                whetherThePinduoduoOperationSampleIsSelected: ['data', 'radioField_lxn6zu80'],
                tmall_supermarket_operationSampleIsNotSelected: ['data', 'radioField_lxn6zu81'],
                Tao_factor_operation_sample_whether_choose: ['data', 'radioField_lxn6zu82'],
                gains_vipshop_WhetherToChooseTheOperationSample: ['data', 'radioField_lxn6zu83'],
                tmallVerticalStore_littleRedBook: ['data', 'radioField_lxn7jgnp'],
                coupang_OperationSample_IsSelected: ['data', 'radioField_lxn7jgnq'],
                tikTok_whetherTheKuaishouOperationSampleIsSelected: ['data', 'radioField_lxn7jgnr'],
                whetherOrNotToChooseAnOperationSample_1688: ['data', 'radioField_lxn7jgns'],
                tmallRefused: ['data', 'checkboxField_lxmsje9c'],
                jdComRefused: ['data', 'checkboxField_lxn4uinf'],
                pinduoduoRefused: ['data', 'checkboxField_lxn4uing'],
                tmallSupermarketRefused: ['data', 'checkboxField_lxn4uinh'],
                theTaoFactoryRefused: ['data', 'checkboxField_lxn4uini'],
                dewu_VipshopWillRefuse: ['data', 'checkboxField_lxn4uinj'],
                tmallVerticalShop_XiaohongshuRefuses: ['data', 'checkboxField_lxn4uink'],
                coupang_Refuse: ['data', 'checkboxField_lxn4uinl'],
                denied_1688: ['data', 'checkboxField_lxn4uinm'],
                tmall_development_rejection: ['data', 'checkboxField_lxo324ao'],
                developmentRejection: ['data', 'checkboxField_lzal1evd'],
            });
        }
    });




})();

module.exports = client;
