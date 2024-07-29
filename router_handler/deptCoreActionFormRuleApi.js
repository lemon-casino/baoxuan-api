const biResponse = require("@/utils/biResponse")
const joiUtil = require("@/utils/joiUtil")
const deptCoreActionFormRuleService = require('@/service/activity/actionConfig/deptCoreActionFormRuleService')
const deptCoreActionRuleSchema = require("@/schema/deptCoreActionFormRuleSchema")

const saveFormRule = async (req, res, next) => {
    try {
        const data = req.body
        joiUtil.clarityValidate(deptCoreActionRuleSchema.saveParamsSchema, data)
        const rule = await deptCoreActionFormRuleService.saveFormRule(data)
        return res.send(biResponse.success(rule))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    saveFormRule
}