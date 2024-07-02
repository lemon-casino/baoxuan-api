const models = require('@/model')
const usersTagsModel = models.usersTagsModel

const saveUserTag = async (data) => {
    return (await usersTagsModel.create(data))
}

const deleteTag = async (id) => {
    return (await usersTagsModel.destroy({where: {id}}))
}

module.exports = {
    saveUserTag,
    deleteTag
}