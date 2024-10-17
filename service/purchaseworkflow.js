const biResponse = require("@/utils/biResponse");

const moment =  require('moment')
const dd = require("@/core/dingDingReq/yiDaReq");
const credentialsReq = require("@/core/dingDingReq/credentialsReq");
const {getTodaySplitFlowsByFormIdAndFlowStatus} = require("@/service/flowService");
const {flowStatusConst} = require("@/const/flowConst");
const {getFlowsByFormIdTo} = require("@/core/dingDingReq/yiDaReq");
const {getToken} = require("@/repository/redisRepo");
const purchaseFlowFormId = "FORM-33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP"
const xxFlowFormId = "FORM-6A9E954714A64B8FA38BA44320CA928FDPBO"
const getpurchaseworkflow = async (req, res, next) => {
    try {

        const { access_token: token } = await getToken(); // 提前获取 token

// 并行请求两个表单的流数据
        const [xxResult, xxxResult] = await Promise.all([
            getFlowsByFormIdTo(token, purchaseFlowFormId, "073105202321093148", flowStatusConst.RUNNING),
            getFlowsByFormIdTo(token, xxFlowFormId, "073105202321093148", flowStatusConst.RUNNING)
        ]);

        const runningFightingFlows = xxResult.data;
        const xxFightingFlows = xxxResult.data;

// 优化的日期判断函数
        const isTodayOrYesterday = (dateString) => {
            const date = new Date(dateString);
            const now = new Date();

            // 当前时间的UTC日期
            const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
            const timeDiff = todayUTC - date;

            // 时间差在0到1天内就是今天或昨天
            return timeDiff <= 24 * 60 * 60 * 1000 && timeDiff >= -24 * 60 * 60 * 1000;
        };

// 通用过滤器
        const filterRunningFlows = (flows, type) => {
            return flows
                .filter(item => item.instanceStatus === flowStatusConst.RUNNING && isTodayOrYesterday(item.createTimeGMT))
                .map(item => ({ name: item.title, create: item.createTimeGMT, type }));
        };

// 过滤并组合流数据
        const list = [
            ...filterRunningFlows(runningFightingFlows, '采购选品会'),
            ...filterRunningFlows(xxFightingFlows, '采购任务运营发布（全平台）')
        ];


        return res.send(biResponse.success(list))
    } catch (e) {
        next(e)
    }
}

module.exports = {

    getpurchaseworkflow
}