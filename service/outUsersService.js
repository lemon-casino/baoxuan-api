const outUsersRepo = require('@/repository/outUsersRepo')

const getOutUsers = async () => {
    return (await outUsersRepo.getOutUsers())
}

const updateOutUsers = async (id, data) => {
    return (await outUsersRepo.updateOutUsers(id, data))
}

module.exports = {
    getOutUsers,
    updateOutUsers
}