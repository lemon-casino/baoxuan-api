const deptCoreActionRepo = require("@/repository/deptCoreActionRepo")
const algorithmUtil = require("@/utils/algorithmUtil");

const getDeptCoreActions = async (deptIds) => {
    return (await deptCoreActionRepo.getDeptCoreActions(deptIds))
}

const getTreedDeptCoreActions = async (deptIds) => {
    const data = await deptCoreActionRepo.getDeptCoreActions(deptIds)
    // 根据 parentId 转化数据结构
    return _collapseCoreActions(data)
}

const saveDeptCoreAction = async (model) => {
    // 找到父节点的path
    const parentConfig = await deptCoreActionRepo.getDeptCoreAction(model.parentId)
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

const updateDeptCoreAction = async (model) => {
    return (await deptCoreActionRepo.update(model))
}

const getDeptCoreActionForms = async (coreActionId) => {
    return (await deptCoreActionRepo.getDeptCoreActionForms(coreActionId))
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

const _convert2TreeFormat = (coreActions) => {
    const treeFormatResult = []
    while (coreActions.length > 0) {
        const coreAction = coreActions.splice(0, 1)[0]
        delete coreAction["deptId"]
        delete coreAction["deptName"]
        delete coreAction["path"]
        const parentCoreAction = algorithmUtil.getJsonFromUnionFormattedJsonArr(treeFormatResult, "children", "id", coreAction.parentId)
        if (parentCoreAction) {
            coreAction.children = []
            parentCoreAction.children.push(coreAction)
        } else {
            treeFormatResult.push({...coreAction, children: []})
        }
    }
    
    return treeFormatResult
}

module.exports = {
    saveDeptCoreAction,
    getTreedDeptCoreActions,
    getDeptCoreActions,
    getDeptCoreActionsWithRules,
    delDeptCoreAction,
    updateDeptCoreAction,
    getDeptCoreActionForms
}