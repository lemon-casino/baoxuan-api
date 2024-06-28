const deptCoreActionRepo = require("../repository/deptCoreActionRepo")

const getDeptCoreActions = async (deptId) => {
    const data = await deptCoreActionRepo.getDeptCoreActions(deptId)
    // 根据 parentId 转化数据结构
    return _collapseCoreActions(data)
}

const save = async (model) => {
    // 找到父节点的path
    const parentConfig = await deptCoreActionRepo.getDeptCoreActionConfig(model.parentId)
    // 保存成功后，需要将该数据的id信息连同parentId更新到当前数据的path中
    const savedResult = await deptCoreActionRepo.save(model)
    if (parentConfig) {
        savedResult.path = `${parentConfig.path}${savedResult.id}-`
    } else {
        savedResult.path = `-${savedResult.id}-`
    }
    await deptCoreActionRepo.update(savedResult)
    return savedResult
}

const delDeptCoreAction = async (id) => {
    return deptCoreActionRepo.delDeptCoreAction(id)
}

const getDeptCoreActionsWithRules = async (deptId) => {
    const originCoreActions = await deptCoreActionRepo.getDeptCoreActionsWithRules(deptId)
    return _collapseCoreActions(originCoreActions)
}

/**
 * 将扁平的结构转成children包裹的结构
 *
 * @param coreActions
 * @returns {*}
 * @private
 */
const _collapseCoreActions = (coreActions) => {
    coreActions = coreActions.sort((curr, next) => next.id - curr.id)

    let currData = coreActions.find(item => !item.children)
    while (currData) {
        // 获取匹配的子项
        const children = coreActions.filter(item => item.parentId === currData.id)
        currData.children = children
        // 从原数据sortedData中移除已经匹配过的数据
        const childrenIds = children.map(item => item.id)
        coreActions = coreActions.filter(item => !childrenIds.includes(item.id))
        currData = coreActions.find(item => !item.children)
    }
    return coreActions
}

module.exports = {
    save,
    getDeptCoreActions,
    getDeptCoreActionsWithRules,
    delDeptCoreAction
}