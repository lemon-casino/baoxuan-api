const usersTagsService = require("@/service/usersTagsService")
const joiUtil = require("@/utils/joiUtil")
const {saveTagSchema} = require("@/schema/usersTagsSchema")
const biResponse = require("@/utils/biResponse")

const saveUserTag = async (req, res, next) => {
    try {
        const data = req.body
        joiUtil.clarityValidate(saveTagSchema, data)
        const result = await usersTagsService.saveUserTag(data)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const deleteUserTag = async (req, res, next) => {
    try {
        const {id} = req.params
        const result = await usersTagsService.deleteUserTag(id)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    saveUserTag,
    deleteUserTag
}