const redisRepo = require("../repository/redisRepo")

const getTodayFlows = async () => {
    let todayFlows = global.todayRunningAndFinishedFlows
    if (!todayFlows || todayFlows.length === 0) {
        todayFlows = await redisRepo.getTodayRunningAndFinishedFlows();
    }
    return todayFlows
}

const getUsers = async () => {
    let users = global.users
    if (!users || users.length === 0) {
        users = await redisRepo.getAllUsersDetail()
    }
    return users;
}

const getDepartments = async () => {
    let departments = global.departments
    if (!departments || departments.length === 0) {
        departments = await redisRepo.getDepartments()
    }
    return departments;
}

const getUsersOfDepartments = async () => {
    let usersOfDepartments = global.usersOfDepartments
    if (!usersOfDepartments || usersOfDepartments.length === 0) {
        usersOfDepartments = await redisRepo.getUsersUnderDepartment()
    }
    return usersOfDepartments;
}

module.exports = {
    getTodayFlows,
    getUsers,
    getDepartments,
    getUsersOfDepartments
}