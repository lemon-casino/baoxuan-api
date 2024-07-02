const models = require('@/model')
const tagsModel = models.tagsModel
const pagingUtil = require("@/utils/pagingUtil")

const saveTag = async (data) => {
    return (await tagsModel.create(data))
}

const getPagingTags = async (pageIndex, pageSize, tagName) => {
    pageIndex = parseInt(pageIndex)
    pageSize = parseInt(pageSize)
    const where = {}
    if (tagName) {
        where.tagName = {$like: `%${tagName}%`}
    }
    const result = await tagsModel.findAndCountAll({
        where,
        offset: pageIndex * pageSize,
        limit: pageSize,
        order: [["createTime", "desc"]]
    })
    return pagingUtil.defaultPaging(result, pageSize)
}

const deleteTag = async (tagCode) => {
    return (await tagsModel.destroy({where: {tagCode}}))
}

const getTags = async (where) => {
    return (await tagsModel.findAll({where}))
}

module.exports = {
    saveTag,
    getPagingTags,
    deleteTag,
    getTags
}