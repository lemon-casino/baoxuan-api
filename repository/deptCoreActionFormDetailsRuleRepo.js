const models = require('../model')
const deptCoreActionFormDetailsRuleModel = models.deptCoreActionFormDetailsRuleModel
const sequelizeUtil = require("../utils/sequelizeUtil")

const save = async (model) => {
    const result = await deptCoreActionFormDetailsRuleModel.create(model)
    return sequelizeUtil.extractDataValues(result)
}

module.exports = {
    save
}