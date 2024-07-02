const models = require('@/model')
const outUsersModel = models.outUsersModel
const usersTagsModel = models.usersTagsModel
const sequelizeUtil = require("@/utils/sequelizeUtil")

outUsersModel.hasMany(usersTagsModel, {
    sourceKey: "id", foreignKey: "userId", as: "tags"
})

const getOutUsers = async (where = {}) => {
    const outUsers = await outUsersModel.findAll({
        where, order: [["createTime", "desc"]]
    })
    return sequelizeUtil.extractDataValues(outUsers)
}

const getOutUsersWithTags = async (where = {}) => {
    const outUsers = await outUsersModel.findAll({
        where, include: [{model: usersTagsModel, as: "tags"}]
    })
    return sequelizeUtil.extractDataValues(outUsers)
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
    updateOutUsers
}
