const models = require('@/model')
const usersTagsModel = models.usersTagsModel
const tagsModel = models.tagsModel

usersTagsModel.hasOne(tagsModel, {
    sourceKey: "tagCode",
    foreignKey: "tagCode",
    as: "tag"
})

const getUsersTags = async (where) => {
    return (await usersTagsModel.findAll(
            {
                // [models.sequelize.col('tag.tag_name'), "tagName"]
                // attributes: ["id", "tagCode"],
                // attributes: ["tagName"]
                include: [{model: tagsModel, as: "tag"}],
                where,
                order: [["tagCode", "asc"]]
            })
    )
}

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