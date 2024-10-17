const biResponse = require("@/utils/biResponse");

const moment =  require('moment')
const dd = require("@/core/dingDingReq/yiDaReq");
const credentialsReq = require("@/core/dingDingReq/credentialsReq");
const {getTodaySplitFlowsByFormIdAndFlowStatus} = require("@/service/flowService");
const {flowStatusConst} = require("@/const/flowConst");
const purchaseFlowFormId = "FORM-33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP"
const xxFlowFormId = "FORM-6A9E954714A64B8FA38BA44320CA928FDPBO"
const getpurchaseworkflow = async (req, res, next) => {
    try {
        console.log(12121212)
        const runningFightingFlows = await getTodaySplitFlowsByFormIdAndFlowStatus(purchaseFlowFormId, flowStatusConst.RUNNING,`flows:today:form:${purchaseFlowFormId.replace("FORM-", "")}`)
        const xxFightingFlows = await getTodaySplitFlowsByFormIdAndFlowStatus(xxFlowFormId, flowStatusConst.RUNNING,`flows:today:form:${xxFlowFormId.replace("FORM-", "")}`)

        const isToday = (dateString) => {
            const date = new Date(dateString);
            // 获取当前本地时间的年、月、日
            const now = new Date();
            // 将本地时间转换为 UTC 时间
            const todayUTC = new Date(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate()
            );
            // 将 UTC 时间转换为北京时间（UTC+8）
            const todayBeijingTime = new Date(todayUTC.getTime() + (8 * 60 * 60 * 1000));
            todayBeijingTime.setUTCHours(0, 0, 0, 0); // 重置时间为北京时间午夜
            console.log(  date.getUTCFullYear(),todayBeijingTime.getUTCFullYear() ," === ", date.getUTCMonth() , todayBeijingTime.getUTCMonth()  ," === ", date.getUTCDate() , todayBeijingTime.getUTCDate())
            return (
                date.getUTCFullYear() === todayBeijingTime.getUTCFullYear() &&
                date.getUTCMonth() === todayBeijingTime.getUTCMonth() &&
                date.getUTCDate() >= todayBeijingTime.getUTCDate()-1
            );
        };
        const todayRunningFlows = runningFightingFlows.filter(item =>
            item.instanceStatus === flowStatusConst.RUNNING && isToday(item.createTimeGMT)
        );


        const xxRunningFlows = xxFightingFlows.filter(item =>
            item.instanceStatus === flowStatusConst.RUNNING && isToday(item.createTimeGMT)
        );


        let list=[]
        for (const fightingFlow of todayRunningFlows) {
            list.push({name:fightingFlow.title,create:fightingFlow.createTimeGMT,type:'采购选品会'})
        }
        for (const fightingFlow of xxRunningFlows) {
            list.push({name:fightingFlow.title,create:fightingFlow.createTimeGMT,type:'采购任务运营发布（全平台）'})
        }
        return res.send(biResponse.success(list))
    } catch (e) {
        next(e)
    }
}

module.exports = {

    getpurchaseworkflow
}