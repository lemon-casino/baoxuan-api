const httpUtil = require("../../utils/httpUtil")
const requireInvokeLimit = require("./requireInvokeLimit")
const RemoteError = require("../../error/remoteError")
const dateUtil = require("../../utils/dateUtil")

const pageSize = 50

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
const getPagingAttendances = async (pageIndex, workDateFrom, workDateTo, userIds, token) => {
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
const getAttendances = async (workDateFrom, workDateTo, userIds, token) => {
    let pageIndex = 0
    let hasMore = true
    let attendances = []
    while (hasMore) {
        const result = await getPagingAttendances(pageIndex, workDateFrom, workDateTo, userIds, token)
        if (result.errmsg !== "ok") {
            throw new RemoteError(errmsg)
        }
        attendances = attendances.concat(result.recordresult)
        pageIndex = pageIndex + 1
        hasMore = result.hasMore
    }
    return attendances
}

const getTodayAttendances = async (userIds, token) => {
    return await getAttendances(dateUtil.startOfToday(), dateUtil.endOfToday(), userIds, token)
}

module.exports = {
    getAttendances,
    getTodayAttendances
}