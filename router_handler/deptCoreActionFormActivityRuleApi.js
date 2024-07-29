const biResponse = require("@/utils/biResponse")
const joiUtil = require("@/utils/joiUtil")
const {saveParamsSchema, updateParamsSchema} = require("@/schema/deptCoreActionFormActivityRuleSchema")
const deptCoreActionFormActivityRuleService = require('@/service/activity/actionConfig/deptCoreActionFormActivityRuleService')

const getFormActivityRules = async (req, res, next) => {
    try {
        const {formRuleId} = req.query
        joiUtil.validate({
            formRuleId: {value: formRuleId, schema: joiUtil.commonJoiSchemas.numberRequired},
        })
        const ruledFormActivities = await deptCoreActionFormActivityRuleService.getFormActivityRules(formRuleId)
        return res.send(biResponse.success(ruledFormActivities))
    } catch (e) {
        next(e)
    }
}

const getFormActivities = async (req, res, next) => {
    try {
        const {formId, formRuleId} = req.query
        joiUtil.validate({
            formId: {value: formId, schema: joiUtil.commonJoiSchemas.strRequired},
            formRuleId: {value: formRuleId, schema: joiUtil.commonJoiSchemas.numberRequired},
        })
        const ruledFormActivities = await deptCoreActionFormActivityRuleService.getFormActivities(formId, formRuleId)
        return res.send(biResponse.success(ruledFormActivities))
    } catch (e) {
        next(e)
    }
}

const saveFormActivityRule = async (req, res, next) => {
    try {
        const data = req.body
        joiUtil.clarityValidate(saveParamsSchema, data)
        const formActivityRule = await deptCoreActionFormActivityRuleService.saveFormActivityRule(data)
        return res.send(biResponse.success(formActivityRule))
    } catch (e) {
        next(e)
    }
}

const updateFormActivityRule = async (req, res, next) => {
    try {
        const data = req.body
        joiUtil.clarityValidate(updateParamsSchema, data)
        const formActivityRule = await deptCoreActionFormActivityRuleService.updateFormActivityRule(data)
        return res.send(biResponse.success(formActivityRule))
    } catch (e) {
        next(e)
    }
}

const deleteFormActivityRule = async (req, res, next) => {
    try {
        const {id} = req.query
        joiUtil.validate({id})
        const formActivityRule = await deptCoreActionFormActivityRuleService.deleteFormActivityRule(id)
        return res.send(biResponse.success(formActivityRule))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getFormActivities,
    getFormActivityRules,
    updateFormActivityRule,
    saveFormActivityRule,
    deleteFormActivityRule
}