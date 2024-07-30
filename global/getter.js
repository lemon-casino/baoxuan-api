const _ = require("lodash")
const redisRepo = require("@/repository/redisRepo")

const getTodayFlows = async () => {
    let todayFlows = global.todayRunningAndFinishedFlows
    if (!todayFlows || todayFlows.length === 0) {
        todayFlows = await redisRepo.getTodayRunningAndFinishedFlows();
    }
    return _.cloneDeep(todayFlows)
}


const getUsers = async () => {
    let users = global.users
    if (!users || users.length === 0) {
        users = await redisRepo.getAllUsersDetail()
    }
    return _.cloneDeep(users)
}

const getDepartments = async () => {
    let departments = global.departments
    if (!departments || departments.length === 0) {
        departments = await redisRepo.getDepartments()
    }
    return _.cloneDeep(departments)
}

const getUsersOfDepartments = async () => {
    let usersOfDepartments = global.usersOfDepartments
    if (!usersOfDepartments || usersOfDepartments.length === 0) {
        usersOfDepartments = await redisRepo.getUsersUnderDepartment()
    }
    return _.cloneDeep(usersOfDepartments)
}

const getSplitTodayFlows = async (status) => {
    let parsedStatus;
    try {
        console.log("分流->",status)
        parsedStatus = await redisRepo.getSplitTodayRunningAndFinishedFlows(status);
    } catch (error) {
        console.error("Failed to parse status:", status);
        throw new Error("Invalid JSON format for status");
    }

    if (!Array.isArray(parsedStatus)) {
        console.error("Parsed status is not an array:", parsedStatus);
        throw new Error("Expected an array for todayFlows");
    }
    return _.cloneDeep(parsedStatus)
}
module.exports = {
    getTodayFlows,
    getUsers,
    getDepartments,
    getUsersOfDepartments,
    getSplitTodayFlows
}