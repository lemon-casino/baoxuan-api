const outUsersRepo = require('@/repository/outUsersRepo')

const getOutUsers = async () => {
    return (await outUsersRepo.getOutUsers())
}

const updateOutUsers = async (id, data) => {
    return (await outUsersRepo.updateOutUsers(id, data))
}

const getOutUsersWithTags = async () => {
    return (await outUsersRepo.getOutUsersWithTags())
}

const getPagingOutUsersWithTags = async (pageIndex, pageSize, userName, enabled) => {
    return (await outUsersRepo.getPagingOutUsersWithTags(pageIndex, pageSize, userName, enabled))
}

module.exports = {
    getOutUsers,
    updateOutUsers,
    getOutUsersWithTags,
    getPagingOutUsersWithTags
}