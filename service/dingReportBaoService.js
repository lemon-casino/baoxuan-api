const dingReportBaoRepo = require("../repository/dingReportBaoRepo")
const {getTodaySplitFlowsByFormIdAndFlowStatus} = require("@/service/flowService");
const {flowStatusConst} = require("@/const/flowConst");
const {sendDing} = require("@/core/dingDingReq/yiDaReq");
const redisRepo = require("@/repository/redisRepo");
const {
    getToken,
} = redisRepo;
const JsendDingFlowFormId = "FORM-33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP"
const procureDingFlowFormId = "FORM-6A9E954714A64B8FA38BA44320CA928FDPBO"
// 发起ding 功能
const sendDingReportBao= async () => {
// 查询流程中的数据
    const runningFightingFlows = await getTodaySplitFlowsByFormIdAndFlowStatus(JsendDingFlowFormId, flowStatusConst.RUNNING, `flows:today:form:${JsendDingFlowFormId.replace("FORM-", "")}`);
    const procureFightingFlows = await getTodaySplitFlowsByFormIdAndFlowStatus(procureDingFlowFormId, flowStatusConst.RUNNING, `flows:today:form:${procureDingFlowFormId.replace("FORM-", "")}`);

// 收集数据
    const redisPresenceToday = [];
    const redisPresenceTodayPlatform = [];

//

    for (const procureFightingFlow of procureFightingFlows) {
        for (const Flow of procureFightingFlow.overallprocessflow) {
            if (Flow.showName === "各平台负责人填写订货量" && Flow.actionExit === "doing") {
                redisPresenceTodayPlatform.push({
                    formUuid:procureFightingFlow.formUuid,
                    title: procureFightingFlow.title,
                    showName: Flow.showName,
                    code: procureFightingFlow.processInstanceId,
                    createTime: procureFightingFlow.createTimeGMT,
                    receiverUserIdList: Flow.domainList.map(item => item.operator)
                });
            }
        }
    }






// 各平台负责人
    for (const runningFightingFlow of runningFightingFlows) {
        for (const Flow of runningFightingFlow.overallprocessflow) {
            if (Flow.showName === "审核产品" && Flow.actionExit === "doing") {

                redisPresenceToday.push({
                    formUuid:runningFightingFlow.formUuid,
                    title: runningFightingFlow.title,
                    showName: Flow.showName,
                    code: runningFightingFlow.processInstanceId,
                    createTime: runningFightingFlow.createTimeGMT,
                    receiverUserIdList: Flow.domainList.map(item => item.operator)
                });
            } else if (Flow.showName === "各平台负责人填写订货量" && Flow.actionExit === "doing") {
                redisPresenceTodayPlatform.push({
                    formUuid:runningFightingFlow.formUuid,
                    title: runningFightingFlow.title,
                    showName: Flow.showName,
                    code: runningFightingFlow.processInstanceId,
                    createTime: runningFightingFlow.createTimeGMT,
                    receiverUserIdList: Flow.domainList.map(item => item.operator)
                });
            }
        }
    }

// 将截止日期定义为 2024-09-25
    const cutoffDate = new Date('2024-09-25T00:00:00Z');

// 过滤掉 2024-09-25 号之前的数据
    const filteredRedisPresenceToday = redisPresenceToday.filter(item => {
        const itemDate = new Date(item.createTime);
        return itemDate >= cutoffDate;
    });

    const filteredRedisPresenceTodayPlatform = redisPresenceTodayPlatform.filter(item => {
        const itemDate = new Date(item.createTime);
        return itemDate >= cutoffDate;
    });

    //只保留filteredRedisPresenceToday 第一个


// 通用的处理逻辑封装为一个函数
    async function processItem(item, token, isDeferred = false) {
        // 判断 receiverUserIdList 中是否有 '014668034529316173'，没有就追加
        if (!item.receiverUserIdList.includes('014668034529316173')) {
            item.receiverUserIdList.push('014668034529316173', '223851243926081600','222367240636161397');
        }

        // 根据 isDeferred 参数决定是否要处理 deferredDing 字段
        const dingParams = {
            'code': item.code,
            'formUuid': item.formUuid,
            ...(isDeferred ? { 'deferredDing': 1 } : { 'productAudits': 1 })
        };

        // 查找或创建DingId
        const ding = await dingReportBaoRepo.findOrCreateDingId(dingParams);
        const url = `https://t8sk7d.aliwork.com/APP_BXS79QCC8MY5ZV0EZZ07/processDetail?formUuid=${item.formUuid}&procInsId=${item.code}&isAdmin=true&navConfig.layout=1180`;

        if (ding.carryOut) {
            const dingid = await sendDing(token, "dingxv2iv4m4r2th5edi", 1, item.receiverUserIdList, `${item.title}的流程，请 ${item.showName} ${url}`);
            await dingReportBaoRepo.updateDingId({
                'code': item.code,
                'dingId': dingid
            });
        }
    }

    async function processItems(filteredItems, isDeferred = false) {
        const { access_token: token } = await getToken(); // 提前获取 token
console.log(filteredItems)
        // 使用 Promise.all 来并行处理项目，加快执行速度
        await Promise.all(filteredItems.map(async (item, index) => {
            await new Promise(resolve => setTimeout(resolve, index * 1000)); // 延迟 1 秒，按序列加延迟
            await processItem(item, token, isDeferred);
        }));
    }

// 处理 filteredRedisPresenceToday 数据
    await processItems(filteredRedisPresenceToday);

// 处理 filteredRedisPresenceTodayPlatform 数据（使用 isDeferred 参数）
    await processItems(filteredRedisPresenceTodayPlatform, true);


}



module.exports = {
    sendDingReportBao
}