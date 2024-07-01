const httpUtil = require("@/utils/httpUtil");
const ParameterError = require("@/error/parameterError");

/**
 * 获取离职的员工信息
 *
 * @param token
 * @returns {Promise<*|undefined>}
 */
const getPagingResignEmployees = async (token, nextToken = 0) => {
    const url = "https://api.dingtalk.com/v1.0/hrm/employees/dismissions"
    // 接口单次最大查询条数为50
    const params = {nextToken, maxResults: 30}
    return await httpUtil.get(url, params, token)
}

/**
 * 人员离职的信息
 *
 * @param token
 * @param userIds 最大长度为50
 * @returns {Promise<*|undefined>}
 */
const getResignInfo = async (token, userIds) => {
    if (userIds.length > 50) {
        throw new ParameterError("参数userIds的最大长度为50")
    }
    const url = "https://api.dingtalk.com/v1.0/hrm/employees/dimissionInfos"
    const params = {userIdList: JSON.stringify(userIds)}
    return await httpUtil.get(url, params, token)
}

const getResignEmployees = async (token) => {
    // 分页获取所有离职人员id列表
    const getAllResignEmployees = async (token, nextToken) => {
        let {
            nextToken: dNextToken,
            hasMore,
            userIdList: allResignEmployees
        } = await getPagingResignEmployees(token, nextToken)

        if (hasMore) {
            const data = await getAllResignEmployees(token, dNextToken)
            allResignEmployees = allResignEmployees.concat(data)
        }
        return allResignEmployees
    }

    let allResignEmployees = await getAllResignEmployees(token, 0)

    let allResignEmployeesDetails = []
    while (allResignEmployees.length > 0) {
        // 根据ids获取人员离职详情，单次最大支持50
        const pagingResignEmployees = allResignEmployees.splice(0, 50)
        const usersResignInfo = await getResignInfo(token, pagingResignEmployees)
        allResignEmployeesDetails = allResignEmployeesDetails.concat(usersResignInfo.result)
    }
    return allResignEmployeesDetails
}

module.exports = {
    getResignEmployees
}