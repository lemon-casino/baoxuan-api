const userLogService = require("../service/userLogService")
const biResponse = require("../utils/biResponse")

const getUserLogs = async (req, res, next) => {
    try {
        const {pageIndex, pageSize, userId, timeRange} = req.query
        const data = await userLogService.getUserLogs(pageIndex, pageSize, userId, timeRange)
        return res.send(biResponse.success(data))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getUserLogs
}