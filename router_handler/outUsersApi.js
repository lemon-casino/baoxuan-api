const outUsersService = require('@/service/outUsersService')
const biResponse = require("@/utils/biResponse")
const joiUtil = require("@/utils/joiUtil")
const {updateParamsSchema} = require("@/schema/outUsersSchema")

const getOutUsers = async (req, res, next) => {
    try {
        const outUsers = await outUsersService.getOutUsersWithTags()
        return res.send(biResponse.success(outUsers))
    } catch (e) {
        next(e)
    }
}

const getPagingOutUsers = async (req, res, next) => {
    try {
        let page = req.query.page
        let pageSize = req.query.pageSize
        const userName = req.query.userName
        let enabled = req.query.enabled
        joiUtil.validate({page, pageSize})
        if (enabled) {
            joiUtil.validate({enabled: {value: enabled, schema: joiUtil.commonJoiSchemas.validBoolStrValue}})
            enabled = enabled === "true"
        }

        const outUsers = await outUsersService.getPagingOutUsersWithTags(Number(page) - 1, Number(pageSize), userName, enabled)
        return res.send(biResponse.success(outUsers))
    } catch (e) {
        next(e)
    }
}

const getOutUsersWithTags = async (req, res, next) => {
    try {
        const outUsers = await outUsersService.getOutUsersWithTags()
        return res.send(biResponse.success(outUsers))
    } catch (e) {
        next(e)
    }
}

const updateOutUsers = async (req, res, next) => {
    try {
        const data = req.body
        joiUtil.clarityValidate(updateParamsSchema, data)
        const outUsers = await outUsersService.updateOutUsers(req.params.id, data)
        return res.send(biResponse.success(outUsers))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getOutUsers,
    updateOutUsers,
    getOutUsersWithTags,
    getPagingOutUsers
}
