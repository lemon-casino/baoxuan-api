const attendanceRepo = require("../repository/attendanceRepo")

const save = async (model) => {
    return await attendanceRepo.save(model)
}

const getPagingAttendance = async (pageIndex, pageSize, startTime, endTime, userId) => {
    const where = {
        userCheckTime: {
            $in: [startTime, endTime]
        },
        userId
    }
    return attendanceRepo.getPagingAttendance(pageIndex, pageSize, where)
}

module.exports = {
    save,
    getPagingAttendance
}