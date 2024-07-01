const attendanceService = require('@/service/attendanceService')
const biResponse = require("@/utils/biResponse")
const joiUtil = require("@/utils/joiUtil")

const getAttendances = async (req, res, next) => {
    try {
        const {page, pageSize, startTime, endTime, userId} = req.query
        joiUtil.validate({
            page,
            pageSize,
            startTime: {value: startTime, schema: joiUtil.commonJoiSchemas.dateRequired},
            endTime: {value: endTime, schema: joiUtil.commonJoiSchemas.dateRequired}
        })
        const deptUsers = await attendanceService.getPagingAttendance(page - 1, pageSize, startTime, endTime, userId)
        return res.send(biResponse.success(deptUsers))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getAttendances
}