const outUsersService = require('../service/outUsersService')
const biResponse = require("../utils/biResponse")
const joiUtil = require("../utils/joiUtil")
const {updateParamsSchema} = require("../schema/outUsersSchema")

const getOutUsers = async (req, res, next) => {
    try {
        const outUsers = await outUsersService.getOutUsers()
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
    updateOutUsers
}
