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

// 获得Flow.showName是'项目负责人确认到货'的 .domainList.map(item => item.operator)

    function extractUserIdList(fightingFlows, targetShowName, userIdListVar) {
        for (const fightingFlow of fightingFlows) {
            for (const flow of fightingFlow.overallprocessflow) {
                if (flow.showName === targetShowName && flow.domainList.length > 0) {
                    userIdListVar = flow.domainList.map(item => item.operator);
                    return; // 找到后退出整个函数
                }
            }
        }
    }

// 使用该函数
    let procureUserIdList = [];
    let runningUserIdList = [];

    extractUserIdList(procureFightingFlows, "项目负责人确认到货", procureUserIdList);
    extractUserIdList(runningFightingFlows, "项目负责人确认到货", runningUserIdList);

// 抽象出公共逻辑
    function pushToRedisPresenceToday(flow, fightingFlow,i) {
        return {
            formUuid: fightingFlow.formUuid,
            title: fightingFlow.title,
            showName: flow.showName,
            code: fightingFlow.processInstanceId,
            createTime: fightingFlow.createTimeGMT,
            receiverUserIdList: flow.domainList.length > 0 ? flow.domainList.map(item => item.operator) : (i===1) ? procureUserIdList : runningUserIdList.filter(item => item !== '014668034529316')
        };
    }

// 采购任务运营发布 全平台
    for (const procureFightingFlow of procureFightingFlows) {
        for (const flow of procureFightingFlow.overallprocessflow) {
            if (flow.showName === "各平台负责人填写订货量" && flow.actionExit === "doing") {
                redisPresenceTodayPlatform.push({
                    formUuid: procureFightingFlow.formUuid,
                    title: procureFightingFlow.title,
                    showName: flow.showName,
                    code: procureFightingFlow.processInstanceId,
                    createTime: procureFightingFlow.createTimeGMT,
                    receiverUserIdList: flow.domainList.map(item => item.operator)
                });
            } else if (["运营成本是否选中", "运营确认样品是否选中"].includes(flow.showName) && (flow.actionExit === "doing" || flow.actionExit === "agree")) {
                redisPresenceToday.push(pushToRedisPresenceToday(flow, procureFightingFlow,1));
            }
        }
    }

// 采购选品会
    for (const runningFightingFlow of runningFightingFlows) {
        for (const flow of runningFightingFlow.overallprocessflow) {
            if (flow.showName === "审核产品" && (flow.actionExit === "doing" || flow.actionExit === "agree")) {
                // 移除特定元素
                redisPresenceToday.push(pushToRedisPresenceToday(flow, runningFightingFlow,2));
            } else if (flow.showName === "各平台负责人填写订货量" && flow.actionExit === "doing") {
                redisPresenceTodayPlatform.push({
                    formUuid: runningFightingFlow.formUuid,
                    title: runningFightingFlow.title,
                    showName: flow.showName,
                    code: runningFightingFlow.processInstanceId,
                    createTime: runningFightingFlow.createTimeGMT,
                    receiverUserIdList: flow.domainList.map(item => item.operator)
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
// 通用的处理逻辑封装为一个函数
    async function processItem(item, token, isDeferred = false) {
        // 判断 receiverUserIdList 中是否有 '014668034529316173'，没有就追加

       // item.receiverUserIdList.push('014668034529316173', '223851243926081600','222367240636161397');

        // 根据 isDeferred 参数决定是否要处理 deferredDing 字段
        const dingParams = {
            'code': item.code,
            'formUuid': item.formUuid,
            'receiverUserIds':item.receiverUserIdList.join(','),
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
        // 使用 Promise.all 来并行处理项目，加快执行速度
        await Promise.all(filteredItems.map(async (item, index) => {
            await new Promise(resolve => setTimeout(resolve, index * 10000)); // 延迟 1 秒，按序列加延迟
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