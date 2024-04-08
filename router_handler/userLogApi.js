const userLogService = require("../service/userLogService")
const biResponse = require("../utils/biResponse")
const dateUtil = require("../utils/dateUtil")
const joiUtil = require("../utils/joiUtil")

const getUserLogs = async (req, res, next) => {
    try {
        const {pageIndex, pageSize, userId, startDate, endDate} = req.query
        const validateItems = {pageIndex, pageSize, startDate, endDate}
        joiUtil.validate(validateItems)
        const data = await userLogService.getUserLogs(pageIndex, pageSize, userId,
            [dateUtil.startOfDay(startDate), dateUtil.endOfDay(endDate)])
        return res.send(biResponse.success(data))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getUserLogs
}