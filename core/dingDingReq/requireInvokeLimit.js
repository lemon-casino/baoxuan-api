const redisUtil = require("@/utils/redisUtil")
const dateUtil = require("@/utils/dateUtil")
const redisConst = require("@/const/redisConst")
const ForbiddenError = require("@/error/http/forbiddenError")

const count = async (count = 200) => {
    const limitKey = redisConst.redisKeys.StatCountTodayDingDingApiInvoke
    const todayHasInvokedCount = Number(await redisUtil.get(limitKey) || "0")
    if (todayHasInvokedCount >= count) {
        throw new ForbiddenError(`bi中设置的钉钉付费接口每天可调用的最大次数为:${count}，当前已经都消耗完了`)
    } else {
        const secondsTo24PM = dateUtil.getSecondsFromNowToSomeHour(24)
        await redisUtil.set(limitKey, todayHasInvokedCount + 1, secondsTo24PM)
    }
}

module.exports = {
    count
}