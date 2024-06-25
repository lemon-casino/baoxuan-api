const models = require('../model')
const deptCoreActionModel = models.deptCoreActionModel

const getDeptCoreActions = async (deptId) => {
    const result = await deptCoreActionModel.findAll({
        where: {deptId}
    })
    return result
}

const save = async (model) => {
    const result = await models.deptCoreActionModel.create(model)
    return result
}

const delDeptCoreAction = async (id) => {
    const result = await models.deptCoreActionModel.destory({
        where: {path: {$like: id}}
    })
    return result
}

module.exports = {
    save,
    getDeptCoreActions,
    delDeptCoreAction
}