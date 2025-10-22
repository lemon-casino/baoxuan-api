const tagsRepo = require("@/repository/tagsRepo")
const ParameterError = require("@/error/parameterError")

const saveTag = async (data, user) => {
    const tagCode = data.tagCode
    const tags = await tagsRepo.getTags({tagCode})
    if (tags.length > 0) {
        throw new ParameterError(`标签编码：${tagCode}已经存在不可用`)
    }

    data.creator = user.username
    data.creatorId = user.userId
    data.createTime = new Date()
    return (await tagsRepo.saveTag(data))
}

const getPagingTags = async (page, pageSize, tagName) => {
    const pageIndex = Math.max(Number(page) - 1, 0)
    pageSize = Number(pageSize)
    return (await tagsRepo.getPagingTags(pageIndex, pageSize, tagName))
}

const deleteTag = async (id) => {
    return (await tagsRepo.deleteTag(id))
}

module.exports = {
    saveTag,
    getPagingTags,
    deleteTag
}