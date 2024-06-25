const deptCoreActionRepo = require("../repository/deptCoreActionRepo")

const getDeptCoreActions = async (deptId) => {
    return deptCoreActionRepo.getDeptCoreActions(deptId)
}

const save = async (model) => {
    return deptCoreActionRepo.save(model)
}

const delDeptCoreAction = async (id) => {
    return deptCoreActionRepo.delDeptCoreAction(id)
}

module.exports = {
    save,
    getDeptCoreActions,
    delDeptCoreAction
}