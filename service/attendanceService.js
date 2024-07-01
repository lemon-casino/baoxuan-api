const attendanceRepo = require("@/repository/attendanceRepo")
const dateUtil = require("@/utils/dateUtil")

const save = async (model) => {
    return await attendanceRepo.save(model)
}

const getPagingAttendance = async (pageIndex, pageSize, startTime, endTime, userId) => {
    const where = {
        userCheckTime: {
            $between: [dateUtil.startOfDay(startTime), dateUtil.endOfDay(endTime)]
        }
    }
    if (userId) {
        where.userId = userId
    }
    return attendanceRepo.getPagingAttendance(pageIndex, pageSize, where)
}

module.exports = {
    save,
    getPagingAttendance
}