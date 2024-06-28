const biResponse = require("../utils/biResponse")
const joiUtil = require("../utils/joiUtil")
const deptCoreActionService = require('../service/deptCoreActionService')
const {saveParamsSchema} = require("../schema/deptCoreActionSchema")

const save = async (req, res, next) => {
    try {
        const data = req.body
        joiUtil.clarityValidate(saveParamsSchema, data)
        const deptFlowForms = await deptCoreActionService.save(data)
        return res.send(biResponse.success(deptFlowForms))
    } catch (e) {
        next(e)
    }
}

const getDeptCoreActionsConfig = async (req, res, next) => {
    try {
        const {deptId} = req.query
        joiUtil.validate({
            deptId: {value: deptId, schema: joiUtil.commonJoiSchemas.strRequired}
        })
        const deptFlowForms = await deptCoreActionService.getDeptCoreActionsWithRules(deptId)
        return res.send(biResponse.success(deptFlowForms))
    } catch (e) {
        next(e)
    }
}

const delDeptCoreActionConfig = async (req, res, next) => {
    try {
        const {id} = req.query
        joiUtil.validate({id})
        const deptFlowForms = await deptCoreActionService.delDeptCoreAction(id)
        return res.send(biResponse.success(deptFlowForms))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    save,
    delDeptCoreActionConfig,
    getDeptCoreActionsConfig
}