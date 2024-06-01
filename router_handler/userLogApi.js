const userLogService = require("../service/userLogService")
const biResponse = require("../utils/biResponse")
const dateUtil = require("../utils/dateUtil")
const joiUtil = require("../utils/joiUtil")
const onlineCheckConst = require("../const/onlineCheckConst")

const getUserLogs = async (req, res, next) => {
    try {
        const {pageIndex, pageSize, userId, startDate, endDate, isOnline} = req.query
        const validateItems = {pageIndex, pageSize, startDate, endDate}
        joiUtil.validate(validateItems)
        const data = await userLogService.getUserLogs(pageIndex, pageSize, userId,
            [dateUtil.startOfDay(startDate), dateUtil.endOfDay(endDate)], isOnline)
        return res.send(biResponse.success(data))
    } catch (e) {
        next(e)
    }
}

const getOnlineCheckConfig = async (req, res, next) => {
    try {
        return res.send(biResponse.success(onlineCheckConst.intervalConfig))
    } catch (e) {
        next(e)
    }
}

const iAmOnline = async (req, res, next) => {
    try {
        const {id} = req.user
        await userLogService.iAmOnline(id)
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

const iAmDown = async (req, res, next) => {
    try {
        const {id} = req.user
        await userLogService.iAmDown(id)
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

const durationStatistic = async (req, res, next) => {
    try {
        const {userId, startDate, endDate, isOnline} = req.query
        const validateItems = {startDate, endDate}
        joiUtil.validate(validateItems)
        const result = await userLogService.durationStatistic(
            userId,
            [dateUtil.startOfDay(startDate), dateUtil.endOfDay(endDate)],
            isOnline)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getUserLogs,
    getOnlineCheckConfig,
    iAmOnline,
    iAmDown,
    durationStatistic
}