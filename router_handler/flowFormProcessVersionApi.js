const flowFormProcessVersionService = require("@/service/flowFormProcessVersionService")
const biResponse = require("@/utils/biResponse")
const joiUtil = require("@/utils/joiUtil")
const flowFormProcessVersionSchema = require("@/schema/flowFormProcessVersionSchema")

const save = async (req, res, next) => {
    try {
        joiUtil.clarityValidate(flowFormProcessVersionSchema.saveSchema, req.body)
        await flowFormProcessVersionService.save(req.body.data)
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

module.exports = {
    save
}