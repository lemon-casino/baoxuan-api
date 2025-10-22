const joiUtil = require("@/utils/joiUtil")

const syncProcessVersionsSchema = {
    cookies: joiUtil.commonJoiSchemas.strRequired
}

module.exports = {
    syncProcessVersionsSchema
}