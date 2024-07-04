const models = require('@/model')
const usersTagsModel = models.usersTagsModel

const getUsersTags = async (where) => {
    return (await usersTagsModel.findAll(
        {
            where,
            order: [["tagCode", "asc"]]
        }))
}

const saveUserTag = async (data) => {
const saveUserTag = async (data) => {
    return (await usersTagsModel.create(data))
}

const deleteTag = async (id) => {
    return (await usersTagsModel.destroy({where: {id}}))
}

module.exports = {
    saveUserTag,
    deleteTag,
    getUsersTags
}