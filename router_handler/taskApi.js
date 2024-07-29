const taskService = require('@/service/taskService')
const biResponse = require("@/utils/biResponse")

/**
 * 同步工作日信息
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const syncWorkingDay = async (req, res, next) => {
    try {
        await taskService.syncWorkingDay()
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

/**
 * 同步今天进行中和今天完成的流程
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const syncTodayRunningAndFinishedFlows = async (req, res, next) => {
    try {
        await taskService.syncTodayRunningAndFinishedFlows()
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

/**
 * 同步今天（包含）已完成未入库的流程
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const syncMissingCompletedFlows = async (req, res, next) => {
    try {
        await taskService.syncMissingCompletedFlows()
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

/**
 * 同步钉钉token
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const syncDingDingToken = async (req, res, next) => {
    try {
        await taskService.syncDingDingToken()
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

/**
 * 同步部门信息
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const syncDepartment = async (req, res, next) => {
    try {
        await taskService.syncDepartment()
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

/**
 * 同步部门信息（带用户）
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const syncDepartmentWithUser = async (req, res, next) => {
    try {
        await taskService.syncDepartmentWithUser()
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

/**
 * 同步用户信息（带部门）
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const syncUserWithDepartment = async (req, res, next) => {
    try {
        await taskService.syncUserWithDepartment()
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

/**
 * 同步表单数据
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const syncForm = async (req, res, next) => {
    try {
        await taskService.syncForm()
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

const syncResignEmployeeInfo = async (req, res, next) => {
    try {
        await taskService.syncResignEmployeeInfo()
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

module.exports = {
    syncWorkingDay,
    syncTodayRunningAndFinishedFlows,
    syncMissingCompletedFlows,
    syncDepartment,
    syncDepartmentWithUser,
    syncUserWithDepartment,
    syncForm,
    syncDingDingToken,
    syncResignEmployeeInfo
}