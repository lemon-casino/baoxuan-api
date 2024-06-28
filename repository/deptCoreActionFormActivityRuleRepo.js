const models = require('../model')
const deptCoreActionFormActivityRuleModel = models.deptCoreActionFormActivityRuleModel
const sequelizeUtil = require("../utils/sequelizeUtil")

const save = async (model) => {
    const result = await deptCoreActionFormActivityRuleModel.create(model)
    return sequelizeUtil.extractDataValues(result)
}

module.exports = {
    save
}