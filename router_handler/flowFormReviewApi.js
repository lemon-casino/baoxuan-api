const formReviewService = require("../service/formReviewService")
const biResponse = require("../utils/biResponse")
const joiUtil = require("../utils/joiUtil")

const getFormReviews = async (req, res, next) => {
    try {
        const {formId} = req.query
        joiUtil.validate({formId: {value: formId, schema: joiUtil.commonJoiSchemas.strRequired}})
        const result = await formReviewService.getFormReviewByFormId(formId)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getFormReviews
}