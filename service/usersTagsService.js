const usersTagsRepo = require('@/repository/usersTagsRepo')
const uuidUtil = require("@/utils/uuidUtil")

const saveUserTag = async (data) => {
    data.id = uuidUtil.getId()
    data.createTime = new Date()
    return (await usersTagsRepo.saveUserTag(data))
}

const deleteUserTag = async (id) => {
    return (await usersTagsRepo.deleteTag(id))
}

module.exports = {
    saveUserTag,
    deleteUserTag
}