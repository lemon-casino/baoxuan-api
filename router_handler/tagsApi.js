const tagsService = require("@/service/tagsService")
const joiUtil = require("@/utils/joiUtil")
const {saveTagSchema} = require("@/schema/tagSchema")
const biResponse = require("@/utils/biResponse")

const saveTag = async (req, res, next) => {
    try {
        const data = req.body
        joiUtil.clarityValidate(saveTagSchema, data)
        const result = await tagsService.saveTag(data, req.user)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getPagingTags = async (req, res, next) => {
    try {
        const {page, pageSize, tagName} = req.query
        joiUtil.validate({page, pageSize})
        const result = await tagsService.getPagingTags(page, pageSize, tagName)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const deleteTag = async (req, res, next) => {
    try {
        const {tagCode} = req.params
        const result = await tagsService.deleteTag(tagCode)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    saveTag,
    getPagingTags,
    deleteTag
}