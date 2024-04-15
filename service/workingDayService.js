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
 * 注意： 需要上班小伙伴有打卡记录后统计， 确定今天是否工作日要9点后使用
 * @returns {Promise<boolean>}
 */
const isWorkingDayOrNotOf = async (date) => {
    const workingDayInDb = await workingDayRepo.isWorkingDayOf(date)
    if (workingDayInDb) {
        return true
    }
    // 如果date是今天，需要9点后调用
    if (date === dateUtil.format2Str(new Date(), "YYYY-MM-DD")) {
        const hours = new Date().getHours()
        if (hours < 9) {
            throw new ForbiddenError("为保证对今天是否为工作日判断的准确性，9点前不允许调用")
        }
    }

    const startDateTime = dateUtil.startOfDay(date)
    const endDateTime = dateUtil.endOfToday(date)
    // 设置50个小伙伴的userId（钉钉接口限制）
    const users = await globalGetter.getUsers()
    const limit = 40
    const userIds = []
    for (let i = 0; i < users.length - 1; i++) {
        if (i < limit - 1) {
            userIds.push(users[i].userid)
        }
    }

    // 按天统计，没人最多会有4条记录, 测试钉钉接口 pageSize最大为50， 否则会保存
    const result = await dingDingService.getAttendances(0, 50, startDateTime, endDateTime, userIds)
    const uniqueAttendances = {}
    for (const attendance of result.recordresult) {
        uniqueAttendances[attendance.userId] = 1
    }
    // 正常上班9点后打卡的人数会超过10（取50记录每人4条几率可以包含最多的打卡人数），不上班可能也会有人打卡，很少
    return Object.keys(uniqueAttendances).length > 10
}

/**
 * 计算时间区间内有效的工作时长（去掉休息日和下班时间）
 * @returns {Promise<void>}
 */
const computeValidWorkingDuration = async (startDateTime, endDateTime) => {
    // 算法：1、从startDateTime开始，结合节假日和9点上班的条件，重新确定新的startDateTime
    //      2、以18点下班和endDateTime为条件计算开始这天有效的工作时长
    //      3、下班后时间 < endDateTime, 确定第二天的9点位新的 startDateTime， 如果此时 startDateTime > endDateTime,
    //         则计算结束，否则继续开始新一轮的循环
    let sumDuration = 0
    const days = []
    // 确定所跨度的所有的日期
    const durationOfDays = dateUtil.duration(endDateTime, startDateTime, "days")
    if (durationOfDays < 0) {
        throw new ParameterError("结束日期必须大于开始日期")
    }
    days.push(dateUtil.format2Str(startDateTime, "YYYY-MM-DD"))
    for (let i = 0; i < parseInt(durationOfDays); i++) {
        days.push(dateUtil.add(days[0], i + 1))
    }

    for (const day of durationOfDays) {
        const currDate = dateUtil.format2Str(startDateTime, "YYYY-MM-DD")
        const isWorkingDay = isWorkingDayOrNotOf(currDate)
        if (isWorkingDay) {
            // 确定是否已经上班时间
            const current9AmDate = dateUtil.format2Str(startDateTime, "YYYY-MM-DD 09:00:00")
            const currentDuration = dateUtil.duration(startDateTime, current9AmDate)
            if (currentDuration < 0) {
                startDateTime = current9AmDate
            }

        } else {
            startDateTime = ""
        }
    }
}

module.exports = {
    saveWorkingDay,
    getWorkingDayByRange,
    isWorkingDayOrNotOf
}