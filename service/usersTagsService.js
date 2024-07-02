const usersTagsRepo = require('@/repository/usersTagsRepo')

const saveUserTag = async (data) => {
    return (await usersTagsRepo.saveUserTag(data))
}

const deleteUserTag = async (id) => {
    return (await usersTagsRepo.deleteTag(id))
}

module.exports = {
    saveUserTag,
    deleteUserTag
}