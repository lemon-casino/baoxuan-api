const redisService = require("../service/redisService")
const setter = require("./setter")

global.users = []
global.departments = []
global.usersOfDepartments = []
global.todayRunningAndFinishedFlows = []

const initial = async () => {
    await initGlobalUsers();
    await initGlobalDepartments()
    await initGlobalUsersOfDepartments()
    await initGlobalTodayRunningAndFinishedFlows()
}

const initGlobalTodayRunningAndFinishedFlows = async () => {
    const todayRunningAndFinishedFlows = await redisService.getFlowsOfRunningAndFinishedOfToday();
    setter.setGlobalTodayRunningAndFinishedFlows(todayRunningAndFinishedFlows)
}

const initGlobalUsers = async () => {
    const users = await redisService.getAllUsersDetail();
    // 去掉不需要的内容
    const newUsers = users.map((user) => {
        return {...user, "faqi_liu": null, "canyu_liu": null}
    })
    setter.setGlobalUsers(newUsers)
}

const initGlobalDepartments = async () => {
    const departments = await redisService.getDepartments();
    setter.setGlobalDepartments(departments)
}

const initGlobalUsersOfDepartments = async () => {
    const usersOfDepartments = await redisService.getUsersWithJoinLaunchDataUnderDepartment();
    let newUsersOfDepartments = []
    for (const usersOfDepartment of usersOfDepartments) {
        const newUsersOfDepartment = clearFlowsDataOfUser(usersOfDepartment);
        newUsersOfDepartments.push(newUsersOfDepartment)
    }
    setter.setGlobalUsersOfDepartments(newUsersOfDepartments)
}

const clearFlowsDataOfUser = (dept) => {
    const users = dept.dep_user;
    if (users && users.length > 0) {
        for (let i = 0; i < users.length; i++) {
            users[i] = {...users[i], canyu_liu: null, faqi_liu: null}
        }
    }
    const subDepts = dept.dep_chil
    if (subDepts && subDepts.length > 0) {
        for (let i = 0; i < subDepts.length; i++) {
            dept.dep_chil[i] = clearFlowsDataOfUser(subDepts[i])
        }
    }
    return dept
}

module.exports = {
    initial
}