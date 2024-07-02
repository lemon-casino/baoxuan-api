const joiUtil = require("@/utils/joiUtil")

const saveTagSchema = {
    tagCode: joiUtil.commonJoiSchemas.strRequired,
    userId: joiUtil.commonJoiSchemas.strRequired,
    isOUt: joiUtil.commonJoiSchemas.booleanRequired
}

module.exports = {
    saveTagSchema
}