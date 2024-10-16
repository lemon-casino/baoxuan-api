const biResponse = require("@/utils/biResponse");

const moment =  require('moment')
const dd = require("@/core/dingDingReq/yiDaReq");
const credentialsReq = require("@/core/dingDingReq/credentialsReq");
const {getTodaySplitFlowsByFormIdAndFlowStatus} = require("@/service/flowService");
const {flowStatusConst} = require("@/const/flowConst");
const purchaseFlowFormId = "FORM-33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP"

const getpurchaseworkflow = async (req, res, next) => {
    try {
        const runningFightingFlows = await getTodaySplitFlowsByFormIdAndFlowStatus(purchaseFlowFormId, flowStatusConst.RUNNING,`flows:today:form:${purchaseFlowFormId.replace("FORM-", "")}`)
        const isToday = (dateString) => {
            const date = new Date(dateString);
            const today = new Date();
            console.log(  )
            return (
                date.getFullYear() === today.getFullYear() &&
                date.getMonth() === today.getMonth() &&
                date.getDate() === today.getDate()
            );
        };

        const todayRunningFlows = runningFightingFlows.filter(item =>
            item.instanceStatus === flowStatusConst.RUNNING && isToday(item.createTimeGMT)
        );
        let list=[]
        for (const fightingFlow of todayRunningFlows) {
            list.push({name:fightingFlow.title})
        }
        return res.send(biResponse.success(list))
    } catch (e) {
        next(e)
    }
}

module.exports = {

    getpurchaseworkflow
}