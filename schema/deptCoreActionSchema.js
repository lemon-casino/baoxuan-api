const joiUtil = require("../utils/joiUtil")

const saveParamsSchema = {
    actionName: joiUtil.commonJoiSchemas.strRequired,
    parentId: joiUtil.commonJoiSchemas.numberRequired,
    deptId: joiUtil.commonJoiSchemas.strRequired,
    deptName: joiUtil.commonJoiSchemas.strRequired
}

module.exports = {
    saveParamsSchema
}