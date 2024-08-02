const setGlobalUsers = (users) => {
    global.users = users
}

const setGlobalDepartments = (departments) => {
    global.departments = departments
}

const setGlobalUsersOfDepartments = (usersOfDepartments) => {
    global.usersOfDepartments = usersOfDepartments
}

const setGlobalTodayRunningAndFinishedFlows = (todayRunningAndFinishedFlows) => {
    global.todayRunningAndFinishedFlows = todayRunningAndFinishedFlows
}

const setMaxDataAuthorityUsers = (users) => {
    global.maxDataAuthorityUsers = users
}

module.exports = {
    setGlobalUsers,
    setGlobalDepartments,
    setGlobalUsersOfDepartments,
    setGlobalTodayRunningAndFinishedFlows,
    setMaxDataAuthorityUsers
}