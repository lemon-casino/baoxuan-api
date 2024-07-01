const joiUtil = require("../utils/joiUtil")

const updateParamsSchema = {
    userName: joiUtil.commonJoiSchemas.strRequired,
    group: joiUtil.commonJoiSchemas.strRequired
}

module.exports = {
    updateParamsSchema
}