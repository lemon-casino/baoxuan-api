const joiUtil = require("@/utils/joiUtil")

const saveSchema = {
    data: joiUtil.commonJoiSchemas.arrayRequired
}

module.exports = {
    saveSchema
}