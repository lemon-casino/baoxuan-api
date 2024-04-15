const workingDayRepo = require("../repository/workinDayRepo")
const dingDingService = require("../service/dingDingService")
const ForbiddenError = require("../error/http/forbiddenError")
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
 * 注意： 需要上班小伙伴有打卡记录后统计， 确定9点后可以正常使用
 * @returns {Promise<boolean>}
 */
const isWorkingDayOrNotOf = async (date) => {
    // 如果date是今天，需要9点后调用
    if (date === dateUtil.format2Str(new Date(), "YYYY-MM-DD")) {
        const hours = new Date().getHours()
        if (hours < 9 || hours > 11) {
            throw new ForbiddenError("为保证对今天是否为工作日判断的准确性，该方法当前仅允许9-11点间调用")
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
    } else {
        return workingDayRepo.isWorkingDayOf(date)
    }
}

module.exports = {
    saveWorkingDay,
    getWorkingDayByRange,
    isWorkingDayOrNotOf
}