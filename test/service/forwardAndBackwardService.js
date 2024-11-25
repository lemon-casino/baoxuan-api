const {getTodaySplitFlowsByFormIdAndFlowStatus} = require("@/service/flowService");
const {flowStatusConst} = require("@/const/flowConst");
const {sendDing, getFlowsByFormIdTo} = require("@/core/dingDingReq/yiDaReq");
const redisRepo = require("@/repository/redisRepo");
const {
    getToken,
} = redisRepo;


async function handleSubscription(key, mappings,type) {
    const procurement = [];
    const { access_token: token } = await getToken(); // 提前获取 token
    const platformMapping = [
        { field: "numberField_m1g2w3gs", platform: "天猫" },
        { field: "numberField_m1g2w3gu", platform: "京东" },
        { field: "numberField_m1g2w3gv", platform: "拼多多" },
        { field: "numberField_m1g2w3gw", platform: "天猫超市" },
        { field: "numberField_m1g2w3gy", platform: "的雾, 唯品会" },
        { field: "numberField_m1g2w3gx", platform: "淘工厂" },
        { field: "numberField_m1g2w3gz", platform: "抖音, 快手" },
        { field: "numberField_m1g2w3h0", platform: "alibaba" },
        { field: "numberField_m1g2w3h1", platform: "coupang" }
    ];
   await getFlowsByFormIdTo(token, key, "073105202321093148", flowStatusConst.RUNNING)
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
            procurementItem["platformSelection"] = procurementItem["platformSelection"] || [];
            if (path[1] === 'radioField_m1ujs0qq' && getValueFromPath(flow, path) === "否") {
                if (flow.data.tableField_m1g2w3gr !== undefined) {
                    for (const item of flow.data.tableField_m1g2w3gr) {
                        // 遍历映射表，动态检查字段值并推送到 platformSelection 中
                        for (const { field, platform } of platformMapping) {
                            if (item[field] > 0) {
                                procurementItem["platformSelection"].push({
                                    productName: item.textField_m1lrc3mo,
                                    platform: platform,
                                    typology: "产品"
                                });
                            }
                        }
                    }

                }
            } else if (path[1] === 'radioField_m1ujs0qq' && getValueFromPath(flow, path) === "是") {
                if (flow.data.radioField_m1udoubu !== "是") {
                    procurementItem["platformSelection"].push({
                        productName: item.title,
                        platform: "天猫市场",
                        typology: "市场"
                    });
                }
            }


        }
        procurementItem["platformSelection"] = JSON.stringify(procurementItem["platformSelection"]);
        //JSON.parse(“”) 转成数组
        console.log(procurementItem)


        procurement.push({
            ...procurementItem,
            originator: flow.originator.name.nameInChinese,
            processInstanceId: flow.processInstanceId,
            creationTime: flow.createTimeGMT,
            updated: flow.modifiedTimeGMT,
            reciprocaltype: type
        });
    }

    // await procurementSelection(procurement);
}


const forwardAndBackwardProcess= async () => {
    await handleSubscription('FORM-289502852E9747FCB8EB10427BC2870F3LTZ', {
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
        //天猫选中 -
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

module.exports = {
    forwardAndBackwardProcess
}