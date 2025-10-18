const joiUtil = require("@/utils/joiUtil")

const saveTagSchema = {
    tagCode: joiUtil.commonJoiSchemas.strRequired,
    tagName: joiUtil.commonJoiSchemas.strRequired
}

module.exports = {
    saveTagSchema
}