const joiUtil = require("@/utils/joiUtil")
const operationSchema = {}
operationSchema.requiredDateSchema = {
    startDate: joiUtil.commonJoiSchemas.dateRequired,
    endDate: joiUtil.commonJoiSchemas.dateRequired,
}

operationSchema.requiredDataSchema = {
    startDate: joiUtil.commonJoiSchemas.dateRequired,
    endDate: joiUtil.commonJoiSchemas.dateRequired,
    currentPage: joiUtil.commonJoiSchemas.numberRequired,
    pageSize: joiUtil.commonJoiSchemas.numberRequired,
}

module.exports = operationSchema