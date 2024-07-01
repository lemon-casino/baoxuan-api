const biResponse = require("@/utils/biResponse")
const joiUtil = require("@/utils/joiUtil")
const deptCoreActionService = require('@/service/deptCoreActionService')
const {saveParamsSchema, updateParamsSchema} = require("@/schema/deptCoreActionSchema")

const getDeptCoreActions = async (req, res, next) => {
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

const saveDeptCoreAction = async (req, res, next) => {
    try {
        const data = req.body
        joiUtil.clarityValidate(saveParamsSchema, data)
        const deptFlowForms = await deptCoreActionService.saveDeptCoreAction(data)
        return res.send(biResponse.success(deptFlowForms))
    } catch (e) {
        next(e)
    }
}

const updateDeptCoreAction = async (req, res, next) => {
    try {
        const data = req.body
        joiUtil.clarityValidate(updateParamsSchema, data)
        const deptFlowForms = await deptCoreActionService.updateDeptCoreAction(data)
        return res.send(biResponse.success(deptFlowForms))
    } catch (e) {
        next(e)
    }
}

const delDeptCoreAction = async (req, res, next) => {
    try {
        const {id} = req.query
        joiUtil.validate({id})
        const deptFlowForms = await deptCoreActionService.delDeptCoreAction(id)
        return res.send(biResponse.success(deptFlowForms))
    } catch (e) {
        next(e)
    }
}

const getDeptCoreActionForms = async (req, res, next) => {
    try {
        const {id} = req.query
        joiUtil.validate({id})
        const deptFlowForms = await deptCoreActionService.getDeptCoreActionForms(id)
        return res.send(biResponse.success(deptFlowForms))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getDeptCoreActions,
    updateDeptCoreAction,
    saveDeptCoreAction,
    delDeptCoreAction,
    getDeptCoreActionForms
}