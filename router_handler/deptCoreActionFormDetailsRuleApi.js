const biResponse = require("@/utils/biResponse")
const joiUtil = require("@/utils/joiUtil")
const {saveParamsSchema, updateParamsSchema} = require("@/schema/deptCoreActionFormDetailsRuleSchema")
const deptCoreActionFormDetailsRuleService = require('@/service/activity/actionConfig/deptCoreActionFormDetailsRuleService')
const operatorConst = require("@/const/ruleConst/operatorConst");

const getUnSettledFormFields = async (req, res, next) => {
    try {
        const {formRuleId, formId} = req.query
        joiUtil.validate(
            {
                formRuleId: {value: formRuleId, schema: joiUtil.commonJoiSchemas.strRequired},
                formId: {value: formId, schema: joiUtil.commonJoiSchemas.strRequired}
            }
        )
        const formDetailsRule = await deptCoreActionFormDetailsRuleService.getUnSettledFormFields(formId, formRuleId)
        return res.send(biResponse.success(formDetailsRule))
    } catch (e) {
        next(e)
    }
}

const getFormDetailsRules = async (req, res, next) => {
    try {
        const {formRuleId} = req.query
        joiUtil.validate(
            {formRuleId: {value: formRuleId, schema: joiUtil.commonJoiSchemas.strRequired}}
        )
        const formDetailsRule = await deptCoreActionFormDetailsRuleService.getFormDetailsRules(formRuleId)
        return res.send(biResponse.success(formDetailsRule))
    } catch (e) {
        next(e)
    }
}

const saveFormDetailsRule = async (req, res, next) => {
    try {
        const data = req.body
        joiUtil.clarityValidate(saveParamsSchema, data)
        // 如果是要进行数值比较的要校验Value是数字
        if (operatorConst.opCodesValueMustBeStrNum.includes(data.opCode)) {
            joiUtil.validate({value: {value: data.value, schema: joiUtil.commonJoiSchemas.strNumRequired}})
        }
        
        const formDetailsRule = await deptCoreActionFormDetailsRuleService.saveFormDetailsRule(data)
        return res.send(biResponse.success(formDetailsRule))
    } catch (e) {
        next(e)
    }
}

const updateFormDetailsRule = async (req, res, next) => {
    try {
        const data = req.body
        joiUtil.clarityValidate(updateParamsSchema, data)
        const formDetailsRule = await deptCoreActionFormDetailsRuleService.updateFormDetailsRule(data)
        return res.send(biResponse.success(formDetailsRule))
    } catch (e) {
        next(e)
    }
}

const deleteFormDetailsRule = async (req, res, next) => {
    try {
        const {id} = req.query
        joiUtil.validate({id})
        const result = await deptCoreActionFormDetailsRuleService.deleteFormDetailsRule(id)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getFormDetailsRules,
    getUnSettledFormFields,
    saveFormDetailsRule,
    updateFormDetailsRule,
    deleteFormDetailsRule,
}