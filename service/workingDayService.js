const BigNumber = require("bignumber.js")
const workingDayRepo = require("../repository/workinDayRepo")
const dingDingService = require("../service/dingDingService")
const ForbiddenError = require("../error/http/forbiddenError")
const ParameterError = require("../error/parameterError")
const dateUtil = require("../utils/dateUtil")
const globalGetter = require("../global/getter")


/**
 * 保存工作日日期数据
 * @param date
 * @returns {Promise<*>}
 */
const saveWorkingDay = async (date) => {
    return await workingDayRepo.saveWorkingDay(date)
}

/**
 * 获取指定范围内的日期数据
 * @param startDate
 * @param endDate
 * @returns {Promise<*>}
 */
const getWorkingDayByRange = async (startDate, endDate) => {
    return await workingDayRepo.getWorkingDayByRange(startDate, endDate)
}

/**
 * 判断某天是不是工作日
 * 注意： 需要上班小伙伴有打卡记录后统计， 确定今天是否工作日要等更新后才行
 * @returns {Promise<boolean>}
 */
const isWorkingDayOf = async (date) => {
    return await workingDayRepo.isWorkingDayOf(date)
}

/**
 * 计算时间区间内有效的工作时长（去掉休息日和下班时间）
 * @param startDateTime
 * @param endDateTime
 * @returns {Promise<number>}
 */
const computeValidWorkingDuration = async (startDateTime, endDateTime) => {
    // 算法：1、从startDateTime开始，结合节假日和9点上班的条件，重新确定新的startDateTime
    //      2、以18点下班和endDateTime为条件计算开始这天有效的工作时长
    //      3、下班后时间 < endDateTime, 确定第二天的9点位新的 startDateTime， 如果此时 startDateTime > endDateTime,
    //         则计算结束，否则继续开始新一轮的循环
    const durationOfDays = dateUtil.duration(endDateTime, startDateTime)
    if (durationOfDays <= 0) {
        throw new ParameterError("结束日期必须大于开始日期")
    }

    let sumDuration = 0
    while (startDateTime < endDateTime) {
        const currDate = dateUtil.format2Str(startDateTime, "YYYY-MM-DD")
        let curr9AmDate = dateUtil.format2Str(currDate, "YYYY-MM-DD 09:00:00")
        let currEndDateTime = endDateTime

        const isWorkingDay = await isWorkingDayOf(currDate)
        if (isWorkingDay) {
            // 确定是否已经上班时间
            const currentStartDuration = dateUtil.duration(curr9AmDate, startDateTime)
            if (currentStartDuration > 0) {
                startDateTime = curr9AmDate
            }
            // 确定这一天的结束时间
            const current18PmDate = dateUtil.format2Str(currDate, "YYYY-MM-DD 18:00:00")
            const currentEndDuration = dateUtil.duration(endDateTime, current18PmDate)
            if (currentEndDuration > 0) {
                currEndDateTime = current18PmDate
            }
            const currentCost = dateUtil.duration(currEndDateTime, startDateTime)
            sumDuration = new BigNumber(sumDuration).plus(currentCost).toFixed(2)
            // 更新开始时间为下一天的9点
            startDateTime = dateUtil.add(curr9AmDate, 1).format("YYYY-MM-DD HH:mm:ss")
        } else {
            // 直接跳到下一天
            startDateTime = dateUtil.add(curr9AmDate, 1).format("YYYY-MM-DD HH:mm:ss")
        }
    }
    return sumDuration
}

module.exports = {
    saveWorkingDay,
    getWorkingDayByRange,
    isWorkingDay: isWorkingDayOf,
    computeValidWorkingDuration
}