const BigNumber = require("bignumber.js")
const workingDayRepo = require("../repository/workinDayRepo")
const redisRepo = require("../repository/redisRepo")
const dateUtil = require("../utils/dateUtil")
const {dateFormatReg} = require("../const/regexConst")


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
    const allWorkingDays = await redisRepo.getAllWorkingDays()
    return allWorkingDays.filter(day => day === date).length > 0
    // const result = await workingDayRepo.isWorkingDayOf(date)
    // return result
}

/**
 * 对于执行流程计算第一天的截止时间为20点，后面还是18点
 * @param startDateTime
 * @param endDateTime
 * @returns {Promise<number>}
 */
const computeValidWorkingDurationOfExecutionFlow = async (startDateTime, endDateTime) => {
    if (!startDateTime || !endDateTime) {
        return 0
    }
    if (!dateFormatReg.test(startDateTime) || !dateFormatReg.test(endDateTime)) {
        return 0
    }

    // 18点前开始的，首日的截止时间为20点
    const isStartBefore18Pm = dateUtil.duration(
        dateUtil.format2Str(startDateTime, "YYYY-MM-DD 18:00:00"),
        startDateTime) >= 0
    // 是否是工作日
    const isWorkingDay = await isWorkingDayOf(dateUtil.format2Str(startDateTime, "YYYY-MM-DD"))

    if (isWorkingDay && isStartBefore18Pm) {
        const dayOf20Pm = dateUtil.format2Str(startDateTime, "YYYY-MM-DD 20:00:00")
        const isEndBefore20Pm = dateUtil.duration(dayOf20Pm, endDateTime) >= 0
        if (isEndBefore20Pm) {
            return dateUtil.duration(endDateTime, startDateTime)
        }
        const firstDayCost = dateUtil.duration(dayOf20Pm, startDateTime)

        const newStartDateTime = dateUtil.add(startDateTime, 1).format("YYYY-MM-DD 09:00:00")
        // 如果新的开始时间 > 结束时间 则直接返回
        if (dateUtil.duration(newStartDateTime, endDateTime) >= 0) {
            return firstDayCost
        }
        const otherDayCost = await computeValidWorkingDuration(newStartDateTime, endDateTime)
        return new BigNumber(firstDayCost).plus(otherDayCost).toNumber()
    }
    // 18点之后开始的
    else {
        // 计算新的开始时间
        const newStartDateTime = dateUtil.add(startDateTime, 1).format("YYYY-MM-DD 09:00:00")
        // 如果新的开始时间 > 结束时间 则返回0
        if (dateUtil.duration(newStartDateTime, endDateTime) >= 0) {
            return 0
        }
        return await computeValidWorkingDuration(newStartDateTime, endDateTime)
    }
}

/**
 * 计算时间区间内有效的工作时长（去掉休息日和下班时间）
 * @param startDateTime
 * @param endDateTime
 * @returns {Promise<number>}
 */
const computeValidWorkingDuration = async (startDateTime, endDateTime) => {
    if (!startDateTime || !endDateTime) {
        return 0
    }
    if (!dateFormatReg.test(startDateTime) || !dateFormatReg.test(endDateTime)) {
        return 0
    }
    // 算法：1、从startDateTime开始，结合节假日和9点上班的条件，重新确定新的startDateTime
    //      2、以18点下班和endDateTime为条件计算开始这天有效的工作时长
    //      3、下班后时间 < endDateTime, 确定第二天的9点位新的 startDateTime， 如果此时 startDateTime > endDateTime,
    //         则计算结束，否则继续开始新一轮的循环
    const durationOfDays = dateUtil.duration(endDateTime, startDateTime)
    if (durationOfDays <= 0) {
        return 0
    }

    let sumDuration = 0
    while (startDateTime < endDateTime) {
        const currDate = dateUtil.format2Str(startDateTime, "YYYY-MM-DD")
        const curr9AmDate = dateUtil.format2Str(currDate, "YYYY-MM-DD 09:00:00")
        const current18PmDate = dateUtil.format2Str(currDate, "YYYY-MM-DD 18:00:00")
        let currEndDateTime = endDateTime

        const isWorkingDay = await isWorkingDayOf(currDate)
        if (isWorkingDay) {
            // 确定是否已经上班时间: startDateTime  9am
            // -- 9点前开始
            const currentStart9AmDuration = dateUtil.duration(curr9AmDate, startDateTime)
            if (currentStart9AmDuration > 0) {
                startDateTime = curr9AmDate
            }
            // 18点后开始
            const currentStart18PmDuration = dateUtil.duration(current18PmDate, startDateTime)
            if (currentStart18PmDuration > 0) {
                // 确定这一天的结束时间(以18点为计算的最终截止时间:9am 18pm enDate)
                const currentEnd9AmDuration = dateUtil.duration(endDateTime, curr9AmDate)
                if (currentEnd9AmDuration <= 0) {
                    currEndDateTime = curr9AmDate
                } else {
                    const currentEnd18PmDuration = dateUtil.duration(endDateTime, current18PmDate)
                    if (currentEnd18PmDuration > 0) {
                        currEndDateTime = current18PmDate
                    }
                }
                const currentCost = dateUtil.duration(currEndDateTime, startDateTime)
                sumDuration = new BigNumber(sumDuration).plus(currentCost).toFixed(2)
            }

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
    computeValidWorkingDuration,
    computeValidWorkingDurationOfExecutionFlow
}