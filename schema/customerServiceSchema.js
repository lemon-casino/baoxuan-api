const joiUtil = require("@/utils/joiUtil")
const customerServiceSchema = {}
customerServiceSchema.requiredDateSchema = {
    startDate: joiUtil.commonJoiSchemas.dateRequired,
    endDate: joiUtil.commonJoiSchemas.dateRequired,
}

module.exports = customerServiceSchema