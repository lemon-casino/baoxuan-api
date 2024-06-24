const httpUtil = require("../../utils/httpUtil");
const requireInvokeLimit = require("./requireInvokeLimit");

/**
 * 获取打卡记录
 *
 * @param pageIndex
 * @param pageSize
 * @param workDateFrom
 * @param workDateTo
 * @param userIds
 * @param token
 * @returns {Promise<any|undefined>}
 */
const getAttendances = async (pageIndex, pageSize, workDateFrom, workDateTo, userIds, token) => {
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

module.exports = {
    getAttendances
}