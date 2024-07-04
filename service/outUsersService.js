const outUsersRepo = require('@/repository/outUsersRepo')

const getOutUsers = async () => {
    return (await outUsersRepo.getOutUsers())
}

const updateOutUsers = async (id, data) => {
    return (await outUsersRepo.updateOutUsers(id, data))
}

const getOutUsersWithTags = async()=>{
    return (await outUsersRepo.getOutUsersWithTags())
}

module.exports = {
    getOutUsers,
    updateOutUsers,
    getOutUsersWithTags
}