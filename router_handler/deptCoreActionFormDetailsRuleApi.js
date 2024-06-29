const biResponse = require("../utils/biResponse")
const joiUtil = require("../utils/joiUtil")
const {saveParamsSchema, updateParamsSchema} = require("../schema/deptCoreActionFormDetailsRuleSchema")
const deptCoreActionFormDetailsRuleService = require('../service/deptCoreActionFormDetailsRuleService')

const getFormDetailsRule = async (req, res, next) => {
    try {
        const {formRuleId, formId} = req.query
        joiUtil.validate(
            {
                formRuleId: {value: formRuleId, schema: joiUtil.commonJoiSchemas.strRequired},
                formId: {value: formId, schema: joiUtil.commonJoiSchemas.strRequired}
            }
        )
        const formDetailsRule = await deptCoreActionFormDetailsRuleService.getFormDetailsRule(formId, formRuleId)
        return res.send(biResponse.success(formDetailsRule))
    } catch (e) {
        next(e)
    }
}

const saveFormDetailsRule = async (req, res, next) => {
    try {
        const data = req.body
        joiUtil.clarityValidate(saveParamsSchema, data)
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
    getFormDetailsRule,
    saveFormDetailsRule,
    updateFormDetailsRule,
    deleteFormDetailsRule,
}