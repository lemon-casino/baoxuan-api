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
            console.log("发生了变化")
            // 解析数据
            let objects;
            try {
                objects = JSON.parse(data);
            } catch (parseErr) {
                console.error('Error parsing data:', parseErr);
                return;
            }
//
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
            // 京东链接问题异常上架流程
            const jdLinkException = objects.filter(obj => obj.formUuid === 'FORM-KW766OD1UJ0E80US7YISQ9TMNX5X36QZ18AMLW');
            const caigouLinkData = objects.filter(obj => obj.formUuid === 'FORM-33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP');
            // 存储符合条件的对象到新的键
            await client.set('flows:today:form:495A1584CBE84928BB3B1E0D4AA4B56AYN1J', JSON.stringify(Cat_lLink));
            await client.set('flows:today:form:51A6DCCF660B4C1680135461E762AC82JV53', JSON.stringify(linking_issues));
            await client.set('flows:today:form:0X966971LL0EI3OC9EJWUATDC84838H8V09ML1', JSON.stringify(Cat_linkListing));
            await client.set('flows:today:form:6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3', JSON.stringify(operationNewFlowFormId));
            await client.set('flows:today:form:CC0B476071F24581B129A24835910B81AK56', JSON.stringify(baoKeMengNewFlowFormId));
            await client.set('flows:today:form:33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP', JSON.stringify(procurementSelectionMeeting));
            await client.set('flows:today:form:6A9E954714A64B8FA38BA44320CA928FDPBO', JSON.stringify(procurementTaskOperationRelease));
            await client.set('flows:today:form:KW766OD1UJ0E80US7YISQ9TMNX5X36QZ18AMLW', JSON.stringify(jdLinkException));
            await client.set('flows:today:form:33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP', JSON.stringify(caigouLinkData));
            console.log('Data set successfully.');
        }
    });
    function getValueFromPath(flow, path) {
        const value = path.reduce((acc, val) => acc?.[val] ?? '', flow) || '';
        return Array.isArray(value) ? value.join(', ') : value;
    }
    async function handleSubscription(key, mappings,type) {
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
                updated: flow.modifiedTimeGMT,
                reciprocaltype: type
            });
        }

        await procurementSelection(procurement);
    }




    //采购选品会
    await subscriber.subscribe('__keyspace@0__:flows:today:form:33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP', async (message) => {
        if (message === 'set') {
            await handleSubscription('flows:today:form:33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP',  {
                //
                productName: ['data', 'textField_lii9qtrm'],
                vendorName: ['data', 'textField_luxnuynv'],
                duration: ['data', 'textField_lii9qtrx'],
                productAttributes: ['data', 'radioField_lruf2zuu'],
                patentOwnership: ['data', 'textareaField_lruf2zuw'],
                pushProductLine: ['data', 'selectField_ly8fgd3l'],
                headOfOperations: ['data', 'employeeField_lii9qts2', 0],
                optimizationSuggestions: ['data', 'textareaField_lutoemnz'],
                selectionAttributes: ['data', 'radioField_lrhgr6i7'],
                designDefinition: ['data', 'checkboxField_lydscsls'],
        /*        marketAnalysis: ['data', 'attachmentField_lii9qtrn'],*/
                selectionDataSource: ['data', 'radioField_lydysy4b'],
                moq: ['data', 'textField_lii9qtry'],
                headOfJDComOperations: ['data', 'employeeField_lwzz87ob'],
                headOfTmallOperations: ['data', 'employeeField_lii9qts2'],
                whetherTmallIsSelected: ['data', 'radioField_lwzz87oa'],
                whetherJDIsSelected: ['data', 'radioField_lychsyyi'],
                pinduoduoIsSelected: ['data', 'radioField_lychsyyj'],
                whetherTmallSupermarketIsSelected: ['data', 'radioField_ly6wgbgy'],
                whetherTheTaoFactoryIsSelected: ['data', 'radioField_lychsyyl'],
                dewuVipshopWillBeSelected: ['data', 'radioField_lychsyyn'],
                douyinKuaishouIsSelected: ['data', 'radioField_lychsyyk'],
                tmallSupermarketOperationSampleIsNotSelected: ['data', 'radioField_lychsyym'],
                uncheckedAlibaba: ['data', 'radioField_lychsyyo'],
                whetherOrNotCoupangIsSelected: ['data', 'radioField_lyrzy6xl'],
                whetherTheTmallOperationSampleIsSelected: ['data', 'radioField_ly6wgbgt'],
                whetherToChooseTheJDOperationSample: ['data', 'radioField_ly6wgbgu'],
                whetherThePinduoduoOperationSampleIsSelected: ['data', 'radioField_ly6wgbgv'],
                tikTokWhetherTheKuaishouOperationSampleIsSelected: ['data', 'radioField_ly6wgbgw'],
                gainsVipshopWhetherToChooseTheOperationSample: ['data', 'radioField_ly6wgbgx'],
                TaoFactorOperationSampleWhetherChoose: ['data', 'radioField_ly6wgbgz'],
                whetherOrNotToChooseAnOperationSa: ['data', 'radioField_ly6wgbh0'],
                coupangOperationSampleIsSelected: ['data', 'radioField_lyrzy6xm'],
                tmallRefused: ['data', 'radioField_lyi7loxq'],
                jdComRefused: ['data', 'radioField_lyi7loxr'],
                pinduoduoRefused: ['data', 'radioField_lyi7loxs'],
                tmallSupermarketRefused: ['data', 'radioField_lyi7loxt'],
                theTaoFactoryRefused: ['data', 'radioField_lyi7loxu'],
                dewuVipshopWillRefuse: ['data', 'radioField_lyi7loxv'],
                tmallDevelopmentRejection: ['data', 'radioField_lyi7loxw'],
                deniedAlibaba: ['data', 'radioField_lyi7loxx'],
                coupangRefuse: ['data', 'radioField_lyrzy6xn'],
             /*   developmentRejection: ['data', 'checkboxField_lzal1evd'],*/
            },1);




  /*          productName                                        '产品名称',
                vendorName                                         '供应商名称',
                selectionAttributes                                '选品属性',
                duration                                           '工期',
                productAttributes                                  '产品属性',
                patentOwnership                                    '专利归属',
                optimizationSuggestions                            '优化建议',
                pushProductLine                                    '推品产品线',
                creationTime                                       '创建时间', VVVV
            updated                                            '更新时间',
                completionTime                                     '完成-结束时间',
                designDefinition                                   '设计款定义',
                headOfOperations                                   '运营负责人',
                headOfThePlatform                                  '平台负责人',
                platform                                           '平台',
                marketAnalysis                                     '市场分析',
                selectionDataSource                                '选品数据来源',
                costIsSelected                                     '成本选中',
                estimatedSales                                     '预估销量',
                reasonForRejection                                 '拒绝原因',
                moq                                                '起订量',
                preEncoded                                         '预编码',
                headOfTmallOperations                              '天猫运营负责人',
                counterElectTheHeadOfOperations                    '反选运营负责人',
                headOfJDComOperations                              '京东运营负责人',
                headOfTmallSupermarketOperations                   '天猫超市运营负责人',
                headOfOperationsAtAmoyFactory                      '淘工厂运营负责人',
                gainHeadOfOperationsAtVipshop                      '得物、唯品会运营负责人',
                tmallVerticalStoreXiaohongshuOperationLeader       '天猫垂类店、小红书运营负责人',
                headOfOperationsAtCoupang                          'Coupang运营负责人',
                douyinHeadOfKuaishouOperations                     '抖音、快手运营负责人',
                headOfOperationsOf1688                             '1688运营负责人',
                whetherTmallIsSelected                             '天猫运营成本是否选中',
                whetherJDIsSelected                               '京东运营成本是否选中',
                pinduoduoIsSelected                               '拼多多运营成本是否选中',
                whetherTmallSupermarketIsSelected                 '天猫运营成本是否选中 & 天猫产品审核',
                whetherTheTaoFactoryIsSelected                    '淘工厂运营成本是否选中 & 淘工厂产品审核',
                dewuVipshopWillBeSelected                         '得物,唯品会运营运营成本是否选中 & 得物,唯品会得物产品审核',
                tmallVerticalStoreXiaohongshuIsSelected           '天猫垂类店,小红书运营成本是否选中',
                whetherOrNotCoupangIsSelected                     'Coupang运营成本是否选中  & coupang产品审核',
                douyinKuaishouIsSelected                          '抖音, 快手运营成本是否选中 &  抖音,快手产品审核',
                uncheckedAlibaba                                  '1688运营成本是否选中 & 1688产品审核',
                whetherToChooseTheJDOperationSample               '京东运营样品是否选中 & 京东市场',
                whetherTheTmallOperationSampleIsSelected          '天猫运营样品是否选中 & 天猫市场',
                whetherThePinduoduoOperationSampleIsSelected      '拼多多运营样品是否选中 & 拼多多市场',
                tmallSupermarketOperationSampleIsNotSelected      '天猫超市运营样品是否选中 &  天猫超市产品审核',
                TaoFactorOperationSampleWhetherChoose             '淘工厂运营样品是否选中 & 淘工厂市场',
                gainsVipshopWhetherToChooseTheOperationSample     '得物, 唯品会运营样品是否选中 &  得物,唯品会市场',
                tmallVerticalStoreLittleRedBook                   '天猫垂类店、小红书运营样品是否选中',
                coupangOperationSampleIsSelected                  'Coupang运营样品是否选中 & coupang市场',
                tikTokWhetherTheKuaishouOperationSampleIsSelected '抖音,快手运营样品是否选中 & 抖音,快手市场',
                whetherOrNotToChooseAnOperationSa                 '1688运营样品是否选中 & 1688市场',
                tmallRefused                                       '天猫拒绝原因',
                jdComRefused                                       '京东拒绝原因',
                pinduoduoRefused                                   '拼多多拒绝原因',
                tmallSupermarketRefused                            '天猫超市拒绝原因',
                theTaoFactoryRefused                               '淘工厂拒绝原因',
                dewuVipshopWillRefuse                              '得物、唯品会拒绝原因',
                tmallVerticalShopXiaohongshuRefuses                '天猫垂类店、小红书拒绝原因',
                coupangRefuse                                      'Coupang拒绝原因',
                deniedAlibaba                                      '1688拒绝原因',
                tmallDevelopmentRejection                          '抖音、快手拒绝原因',
                developmentRejection                               '开发拒绝原因',
                reciprocaltype                                     '正推反推类型',   VVVV*/






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
                douyinHeadOfKuaishouOperations: ['data', 'employeeField_lxn3p28o', 0],
                headOfOperationsAtCoupang: ['data', 'employeeField_lxn3p28n', 0],
                tmallVerticalStoreXiaohongshuOperationLeader: ['data', 'employeeField_lxn3p28l', 0],
                gainHeadOfOperationsAtVipshop: ['data', 'employeeField_lxn3p28k', 0],
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
                dewuVipshopWillBeSelected: ['data', 'radioField_lxn4uin1'],
                tmallVerticalStoreXiaohongshuIsSelected: ['data', 'radioField_lxn4uin2'],
                whetherOrNotCoupangIsSelected: ['data', 'radioField_lxn4uin3'],
                douyinKuaishouIsSelected: ['data', 'radioField_lxn4uin4'],
                uncheckedAlibaba: ['data', 'radioField_lxn4uin5'],
                whetherToChooseTheJDOperationSample: ['data', 'radioField_lxn6zu7z'],
                whetherTheTmallOperationSampleIsSelected: ['data', 'radioField_lxn6zu7y'],
                whetherThePinduoduoOperationSampleIsSelected: ['data', 'radioField_lxn6zu80'],
                tmallSupermarketOperationSampleIsNotSelected: ['data', 'radioField_lxn6zu81'],
                TaoFactorOperationSampleWhetherChoose: ['data', 'radioField_lxn6zu82'],
                gainsVipshopWhetherToChooseTheOperationSample: ['data', 'radioField_lxn6zu83'],
                tmallVerticalStoreLittleRedBook: ['data', 'radioField_lxn7jgnp'],
                coupangOperationSampleIsSelected: ['data', 'radioField_lxn7jgnq'],
                tikTokWhetherTheKuaishouOperationSampleIsSelected: ['data', 'radioField_lxn7jgnr'],
                whetherOrNotToChooseAnOperationSample_1688: ['data', 'radioField_lxn7jgns'],
                tmallRefused: ['data', 'checkboxField_lxmsje9c'],
                jdComRefused: ['data', 'checkboxField_lxn4uinf'],
                pinduoduoRefused: ['data', 'checkboxField_lxn4uing'],
                tmallSupermarketRefused: ['data', 'checkboxField_lxn4uinh'],
                theTaoFactoryRefused: ['data', 'checkboxField_lxn4uini'],
                dewuVipshopWillRefuse: ['data', 'checkboxField_lxn4uinj'],
                tmallVerticalShopXiaohongshuRefuses: ['data', 'checkboxField_lxn4uink'],
                coupangRefuse: ['data', 'checkboxField_lxn4uinl'],
                deniedAlibaba: ['data', 'checkboxField_lxn4uinm'],
                tmallDevelopmentRejection: ['data', 'checkboxField_lxo324ao'],
                developmentRejection: ['data', 'checkboxField_lzal1evd'],
            },2);
        }
    });




})();

module.exports = client;
