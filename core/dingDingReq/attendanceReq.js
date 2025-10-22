const httpUtil = require("@/utils/httpUtil")
const requireInvokeLimit = require("./requireInvokeLimit")
const RemoteError = require("@/error/remoteError")
const dateUtil = require("@/utils/dateUtil")

/**
 * 获取分页的打卡记录
 *
 * @param pageIndex
 * @param pageSize
 * @param workDateFrom
 * @param workDateTo
 * @param userIds
 * @param token
 * @returns {Promise<any|undefined>}
 */
const getPagingAttendances = async (pageIndex, pageSize = 50, workDateFrom, workDateTo, userIds, token) => {
    await requireInvokeLimit.count()

    const url = `https://oapi.dingtalk.com/attendance/list?access_token=${token}`
    const body = {
        workDateFrom,
        workDateTo,
        "offset": pageIndex * pageSize,
        "limit": pageSize,
        "userIdList": userIds,
        "isI18n": false,
    }
    return await httpUtil.post(url, body)
}

/**
 * 获取打卡记录
 *
 * @param workDateFrom
 * @param workDateTo
 * @param userIds
 * @param token
 * @returns {Promise<*[]>}
 */
const getWorkingDaysRangAttendances = async (workDateFrom, workDateTo, userIds, token) => {
    let hasMore = true
    let attendances = []
    let pageIndex = 0
    const pageSize = 50
    while (hasMore) {
        const result = await getPagingAttendances(pageIndex, pageSize, workDateFrom, workDateTo, userIds, token)
        if (result.errmsg !== "ok") {
            throw new RemoteError(result.errmsg)
        }
        attendances = attendances.concat(result.recordresult)
        pageIndex = pageIndex + 1
        hasMore = result.hasMore
    }
    return attendances
}

/**
 * 获取今天当前用户的打卡情况
 *
 * @param userIds
 * @param token
 * @returns {Promise<*[]>}
 */
const getTodayAttendances = async (userIds, token) => {
    return await getWorkingDaysRangAttendances(dateUtil.startOfToday(), dateUtil.endOfToday(), userIds, token)
}

module.exports = {
    getWorkingDaysRangAttendances,
    getPagingAttendances,
    getTodayAttendances
}