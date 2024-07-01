const httpUtil = require("@/utils/httpUtil")

/**
 * 根据unionid和企业内部应用token获取userId
 *
 * @param token
 * @param unionid
 * @returns {Promise<*|undefined>}
 */
const getUserIdByUnionIdAndToken = async (token, unionid) => {
    const url = `https://oapi.dingtalk.com/topapi/user/getbyunionid?access_token=${token}`
    const data = {unionid: unionid}
    return await httpUtil.post(url, data)
}

/**
 * 根据userid获取用户详情
 *
 * @param token
 * @param userid
 * @returns {Promise<*|undefined>}
 */
const getUserInfoByUserIdAndToken = async (token, userid) => {
    const url = `https://oapi.dingtalk.com/topapi/v2/user/get?access_token=${token}`
    const data = {language: "zh_CN", userid}
    return await httpUtil.post(url, data)
}

/**
 * 获取部门用户的userid列表
 *
 * @param access_token
 * @param dept_id
 * @returns {Promise<*|undefined>}
 */
const getDeptUserList = async (access_token, dept_id) => {
    const url = `https://oapi.dingtalk.com/topapi/user/listid?access_token=${access_token}`
    const data = {
        dept_id: dept_id,
    }
    return await httpUtil.post(url, data)
}

/**
 * 获取用户部门层级
 *
 * @param access_token
 * @param userid
 * @returns {Promise<*|undefined>}
 */
const getDeptLevel = async (access_token, userid) => {
    const url = `https://oapi.dingtalk.com/topapi/v2/department/listparentbyuser?access_token=${access_token}`
    const data = {userid: userid}
    return await httpUtil.post(url, data)
}

/**
 * 获取子部门id详情
 *
 * @param access_token
 * @param dept_id
 * @returns {Promise<*|undefined>}
 */
const getSubDept = async (access_token, dept_id) => {
    const url = `https://oapi.dingtalk.com/topapi/v2/department/listsubid?access_token=${access_token}`
    const data = {dept_id: dept_id}
    return await httpUtil.post(url, data)
}

/**
 * 获取部门用户基础信息
 *
 * @param access_token
 * @param dept_id
 * @param cursor
 * @param size
 * @returns {Promise<*|undefined>}
 */
const getDeptUser_def = async (access_token, dept_id, cursor, size) => {
    const url = `https://oapi.dingtalk.com/topapi/user/listsimple?access_token=${access_token}`
    const data = {cursor, size, dept_id}
    return await httpUtil.post(url, data)
}

/**
 * 获取所有一级部门列表
 *
 * @param access_token
 * @param dept_id
 * @returns {Promise<*|undefined>}
 */
const getSubDeptAll = async (access_token, dept_id = 1) => {
    const url = `https://oapi.dingtalk.com/topapi/v2/department/listsub?access_token=${access_token}`
    const data = {language: "zh_CN", dept_id: dept_id}
    return await httpUtil.post(url, data)
}

/**
 * 根据dingding用户id获取部门列表
 *
 * @param access_token
 * @param user_id
 * @returns {Promise<*|undefined>}
 */
const getDp = async (access_token, user_id) => {
    const url = `https://oapi.dingtalk.com/topapi/v2/department/listparentbyuser?access_token=${access_token}`
    const data = {userid: user_id}
    return await httpUtil.post(url, data)
}

/**
 * 获取部门详情
 *
 * @param access_token
 * @param dept_id
 * @returns {Promise<*|undefined>}
 */
const getDpInfo = async (access_token, dept_id) => {
    const url = `https://oapi.dingtalk.com/topapi/v2/department/get?access_token=${access_token}`
    const data = {language: "zh_CN", dept_id: dept_id}
    return await httpUtil.post(url, data)
}

/**
 * 根据用户token获取通讯录用户信息
 *
 * @param token
 * @returns {Promise<*|undefined>}
 */
const getUserInfoByToken = async (token) => {
    const url = "https://api.dingtalk.com/v1.0/contact/users/me"
    return await httpUtil.get(url, null, token)
}

module.exports = {
    getDpInfo,
    getUserIdByUnionIdAndToken,
    getDp,
    getDeptLevel,
    getSubDept,
    getSubDeptAll,
    getDeptUser_def,
    getDeptUserList,
    getUserInfoByUserIdAndToken,
    getUserInfoByToken
}