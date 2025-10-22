const joiUtil = require("@/utils/joiUtil")

const saveTagSchema = {
    tagCode: joiUtil.commonJoiSchemas.strRequired,
    userId: joiUtil.commonJoiSchemas.strRequired,
    isOut: joiUtil.commonJoiSchemas.booleanRequired
}

module.exports = {
    saveTagSchema
}