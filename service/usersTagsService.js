const usersTagsRepo = require('@/repository/usersTagsRepo')
const uuidUtil = require("@/utils/uuidUtil")
const ParameterError = require("@/error/parameterError")

const saveUserTag = async (data) => {
    const tmpUsersTags = await usersTagsRepo.getUsersTags({userId: data.userId, tagCode: data.tagCode})
    if (tmpUsersTags.length > 0) {
        throw new ParameterError(`用户已经配置了该标签`)
    }

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