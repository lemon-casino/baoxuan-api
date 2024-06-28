const biResponse = require("../utils/biResponse")
const joiUtil = require("../utils/joiUtil")
const deptCoreActionRuleConfigService = require('../service/deptCoreActionFormRuleService')
const deptCoreActionRuleSchema = require("../schema/deptCoreActionFormRuleSchema")
const ParameterError = require("../error/parameterError")

const saveFormRule = async (req, res, next) => {
    try {
        const data = req.body
        joiUtil.clarityValidate(deptCoreActionRuleSchema.saveParamsSchema, data)
        const rule = await deptCoreActionRuleConfigService.save(data)
        return res.send(biResponse.success(rule))
    } catch (e) {
        next(e)
    }
}

const getDeptCoreActionFormRules = async (req, res, next) => {
    try {
        const {id, type} = req.query
        joiUtil.validate({id, type: {value: type, schema: joiUtil.commonJoiSchemas.strRequired}})
        let result = []
        if (type === "single") {
            result = await deptCoreActionRuleConfigService.getRulesById(id)
        } else if (type === "multiple") {
            result = await deptCoreActionRuleConfigService.getRulesByDeptCoreActionId(id)
        } else {
            throw new ParameterError("参数type的可选项：single、multiple")
        }
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const delCoreActionFormRule = async (req, res, next) => {
    try {
        const {id, type} = req.query
        joiUtil.validate({id, type: {value: type, schema: joiUtil.commonJoiSchemas.strRequired}})
        let result = null
        if (type === "single") {
            result = await deptCoreActionRuleConfigService.deleteRuleById(id)
        } else if (type === "multiple") {
            result = await deptCoreActionRuleConfigService.deleteRuleByFormId(id)
        } else {
            throw new ParameterError("参数type的可选项：single、multiple")
        }
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    saveFormRule,
    getDeptCoreActionFormRules,
    delCoreActionFormRule
}