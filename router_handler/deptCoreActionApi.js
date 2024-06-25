const biResponse = require("../utils/biResponse")
const joiUtil = require("../utils/joiUtil")
const deptCoreActionService = require('../service/deptCoreActionService')

const save = async (req, res, next) => {
    try {
        const data = req.body
        joiUtil.validate({
            deptId: {value: deptId, schema: joiUtil.commonJoiSchemas.strRequired}
        })
        const deptFlowForms = await deptCoreActionService.save(data)
        return res.send(biResponse.success(deptFlowForms))
    } catch (e) {
        next(e)
    }
}

const getDeptCoreActions = async (req, res, next) => {
    try {
        const {deptId} = req.query
        joiUtil.validate({
            deptId: {value: deptId, schema: joiUtil.commonJoiSchemas.strRequired}
        })
        const deptFlowForms = await deptCoreActionService.getDeptCoreActions(deptIds)
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

module.exports = {
    save,
    delDeptCoreAction,
    getDeptCoreActions
}