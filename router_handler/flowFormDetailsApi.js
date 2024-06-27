const flowFormDetailsService = require("../service/flowFormDetailsService")
const biResponse = require("../utils/biResponse")
const joiUtil = require("../utils/joiUtil")

const getFormDifferentVersionDetails = async (req, res, next) => {
    try {
        const {formId} = req.params
        joiUtil.validate({formId: {value: formId, schema: joiUtil.commonJoiSchemas.strRequired}})
        const result = await flowFormDetailsService.getFormDifferentVersionsDetails(formId)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getFormDifferentVersionDetails
}