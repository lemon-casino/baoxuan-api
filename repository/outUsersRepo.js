const models = require('@/model')
const outUsersModel = models.outUsersModel
const usersTagsModel = models.usersTagsModel
const tagsModel = models.tagsModel
const pagingUtil = require("@/utils/pagingUtil")

const sequelizeUtil = require("@/utils/sequelizeUtil")

outUsersModel.hasMany(usersTagsModel, {
    sourceKey: "id",
    foreignKey: "userId",
    as: "tags"
})

const getOutUsers = async (where = {}) => {
    const outUsers = await outUsersModel.findAll({
        where, order: [["createTime", "desc"]]
    })
    return sequelizeUtil.extractDataValues(outUsers)
}

const getOutUsersWithTags = async (where = {}) => {
    const outUsers = await outUsersModel.findAll({
        where,
        include: [
            {
                attributes: ["id", "tagCode", "userId", "isOut"],
                model: usersTagsModel,
                as: "tags",
                include: [
                    {
                        model: tagsModel,
                        as: "tag",
                        attributes: ["tagCode", "tagName"]
                    }
                ]
            }
        ]
    })
    return sequelizeUtil.extractDataValues(outUsers)
}

const getPagingOutUsersWithTags = async (pageIndex, pageSize, userName, enabled) => {
    const where = {}
    if (userName) {
        where.userName = {$like: `%${userName}%`}
    }
    if (enabled !== undefined) {
        where.enabled = enabled
    }


    const result = await outUsersModel.findAndCountAll({
        where,
        offset: pageIndex * pageSize,
        limit: pageSize,
        include: [
            {
                attributes: ["id", "tagCode", "userId", "isOut"],
                model: usersTagsModel,
                as: "tags",
                include: [
                    {
                        model: tagsModel,
                        as: "tag",
                        attributes: ["tagCode", "tagName"]
                    }
                ]
            }
        ]
    })
    return pagingUtil.defaultPaging(result, pageSize)
}

const updateOutUsers = async (id, data) => {
    return (await outUsersModel.update(data, {where: {id}}))
}

const saveOutUser = async (data) => {
    return (await outUsersModel.create(data))
}

module.exports = {
    saveOutUser,
    getOutUsers,
    getOutUsersWithTags,
    getPagingOutUsersWithTags,
    updateOutUsers,
}
