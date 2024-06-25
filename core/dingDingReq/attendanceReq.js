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
        const result = {
            "errcode": 0,
            "hasMore": false,
            "errmsg": "ok",
            "recordresult": [
                {
                    "checkType": "OffDuty",
                    "corpId": "dingf5e887e4d232b1b835c2f4657eb6378f",
                    "locationResult": "Normal",
                    "baseCheckTime": 1719199800000,
                    "groupId": 518395063,
                    "timeResult": "Normal",
                    "userId": "156133016423090865",
                    "recordId": 159882794617,
                    "workDate": 1719158400000,
                    "sourceType": "ATM",
                    "userCheckTime": 1719199872000,
                    "planId": 679524338008,
                    "id": 335080541886
                },
                {
                    "checkType": "OnDuty",
                    "corpId": "dingf5e887e4d232b1b835c2f4657eb6378f",
                    "locationResult": "Normal",
                    "baseCheckTime": 1719203400000,
                    "groupId": 518395063,
                    "timeResult": "Normal",
                    "userId": "156133016423090865",
                    "recordId": 159376385918,
                    "workDate": 1719158400000,
                    "sourceType": "ATM",
                    "userCheckTime": 1719201879000,
                    "planId": 679524338009,
                    "id": 335087763842
                },
                {
                    "checkType": "OnDuty",
                    "corpId": "dingf5e887e4d232b1b835c2f4657eb6378f",
                    "locationResult": "Normal",
                    "baseCheckTime": 1719190800000,
                    "groupId": 518395063,
                    "timeResult": "Normal",
                    "userId": "156133016423090865",
                    "recordId": 160354215851,
                    "workDate": 1719158400000,
                    "sourceType": "ATM",
                    "userCheckTime": 1719190408000,
                    "planId": 679524338007,
                    "id": 336262866118
                }
            ]
        }//await getPagingAttendances(pageIndex, workDateFrom, workDateTo, userIds, token)
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