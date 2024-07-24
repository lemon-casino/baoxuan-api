const deptCoreActionRepo = require("@/repository/deptCoreActionRepo")
const deptCoreActionFormRuleRepo = require("@/repository/deptCoreActionFormRuleRepo")
const deptCoreActionFormDetailsRuleRepo = require("@/repository/deptCoreActionFormDetailsRuleRepo")
const deptCoreActionFormActivityRuleRepo = require("@/repository/deptCoreActionFormActivityRuleRepo")
const redisUtil = require("@/utils/redisUtil")
const algorithmUtil = require("@/utils/algorithmUtil")
const redisConst = require("@/const/redisConst")
const models = require("@/model")
const NotFoundError = require("@/error/http/notFoundError")
const ForbiddenError = require("@/error/http/forbiddenError")

const getDeptCoreActions = async (deptIds) => {
    return (await deptCoreActionRepo.getDeptCoreActions(deptIds))
}

const getTreedDeptCoreActions = async (deptIds) => {
    const data = await deptCoreActionRepo.getDeptCoreActions(deptIds)
    // 根据 parentId 转化数据结构
    return convertToTreeFormat(data)
}

const getDeptCoreActionsRules = async (deptIds) => {
    const coreActions = await deptCoreActionRepo.getDeptCoreActions(deptIds)
    const coreActionIds = coreActions.map(item => item.id)
    const deptCoreActionFormRules = await deptCoreActionFormRuleRepo.getRulesByCoreActionIds(coreActionIds)
    const coreActionFormRuleIds = deptCoreActionFormRules.map(item => item.id)
    const coreActionFormDetailsRules = await deptCoreActionFormDetailsRuleRepo.getFormDetailsRuleByFormRuleIds(
        coreActionFormRuleIds
    )
    
    const coreActionFormActivityRules = await deptCoreActionFormActivityRuleRepo.getFormActivityRulesByFormRuleIds(coreActionFormRuleIds)
    const treeFormatResult = []
    while (coreActions.length > 0) {
        const coreAction = coreActions.splice(0, 1)[0]
        delete coreAction["deptId"]
        delete coreAction["deptName"]
        delete coreAction["path"]
        
        const currCoreActionFormRules = deptCoreActionFormRules.filter(item => item.deptCoreActionId === coreAction.id)
        if (currCoreActionFormRules.length > 0) {
            coreAction.rules = []
            for (const currCoreActionFormRule of currCoreActionFormRules) {
                const formRule = {
                    formId: currCoreActionFormRule.formId,
                    formName: currCoreActionFormRule.formName,
                    flowDetailsRules: [],
                    flowNodeRules: []
                }
                const currCoreActionFormRuleDetailsRules = coreActionFormDetailsRules.filter(item => item.deptCoreActionFormRuleId === currCoreActionFormRule.id)
                const pureCoreActionFormDetailsRules = currCoreActionFormRuleDetailsRules.map(item => {
                    return {
                        fieldId: item.fieldId,
                        fieldName: item.fieldName,
                        opCode: item.opCode,
                        value: item.value,
                        condition: item.condition,
                        conditionCode: item.conditionCode
                    }
                })
                formRule.flowDetailsRules = pureCoreActionFormDetailsRules
                
                const currCoreActionFormRuleActivityRules = coreActionFormActivityRules.filter(item => item.deptCoreActionFormRuleId === currCoreActionFormRule.id)
                const pureCoreActionFormActivityRules = currCoreActionFormRuleActivityRules.map(item => {
                    return {
                        activityId: item.activityId,
                        activityName: item.activityName,
                        status: item.status,
                        owner: item.owner
                    }
                })
                formRule.flowNodeRules = pureCoreActionFormActivityRules
                coreAction.rules.push(formRule)
            }
        }
        
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
    return convertToTreeFormat(originCoreActions)
}

const updateDeptCoreAction = async (model) => {
    return (await deptCoreActionRepo.update(model))
}

const getDeptCoreActionForms = async (coreActionId) => {
    return (await deptCoreActionRepo.getDeptCoreActionForms(coreActionId))
}

const syncDeptCoreActionsRules = async (deptIds) => {
    const deptCoreActionRules = await getDeptCoreActionsRules(deptIds)
    await redisUtil.set(`${redisConst.redisKeys.CoreActionRules}:${deptIds.join(",")}`, JSON.stringify(deptCoreActionRules))
}

const copyActionRules = async (srcActionId, targetActionId) => {
    const srcFormRules = await deptCoreActionFormRuleRepo.getRulesByCoreActionIds([srcActionId])
    if (srcFormRules.length === 0) {
        throw new NotFoundError(`根据参数srcActionId：${srcActionId}未找到动作配置信息`)
    }
    
    const targetAction = await deptCoreActionRepo.getDeptCoreAction(targetActionId)
    if (!targetAction) {
        throw new NotFoundError(`根据参数targetActionId：${targetActionId}未找到该动作信息`)
    }
    
    // 如果已经配置了信息则不用复制
    const targetFormRules = await deptCoreActionFormRuleRepo.getRulesByCoreActionIds([targetActionId])
    const targetFormRuleIds = targetFormRules.map(item => item.id)
    const targetFormDetailsRules = await deptCoreActionFormDetailsRuleRepo.getFormDetailsRuleByFormRuleIds(targetFormRuleIds)
    if (targetFormDetailsRules.length > 0) {
        throw new ForbiddenError(`目标动作id：${targetActionId}已经添加了表单配置`)
    }
    
    const targetFormActivitiesRules = await deptCoreActionFormActivityRuleRepo.getFormActivityRulesByFormRuleIds(targetFormRuleIds)
    if (targetFormActivitiesRules.length > 0) {
        throw new ForbiddenError(`目标动作id：${targetActionId}已经添加了节点配置`)
    }
    
    const formRuleIds = srcFormRules.map(item => item.id)
    
    const formDetailsRules = await deptCoreActionFormDetailsRuleRepo.getFormDetailsRuleByFormRuleIds(formRuleIds)
    const formActivitiesRules = await deptCoreActionFormActivityRuleRepo.getFormActivityRulesByFormRuleIds(formRuleIds)
    
    const transaction = await models.sequelize.transaction()
    try {
        for (const formRule of srcFormRules) {
            
            const targetActionFormRule = {
                formId: formRule.formId,
                formName: formRule.formName,
                deptCoreActionId: targetActionId
            }
            
            const tmpResult = await deptCoreActionFormRuleRepo.saveFormRule(targetActionFormRule, transaction)
            const targetActionFormRuleId = tmpResult.id
            const currFormRuleDetailsRules = formDetailsRules.filter(item => item.deptCoreActionFormRuleId === formRule.id)
            const targetActionFormRuleDetailsRules = currFormRuleDetailsRules.map(item => {
                delete item["id"]
                return {...item, deptCoreActionFormRuleId: targetActionFormRuleId}
            })
            await deptCoreActionFormDetailsRuleRepo.bulkCreate(targetActionFormRuleDetailsRules, transaction)
            
            const currFormRuleActivitiesRules = formActivitiesRules.filter(item => item.deptCoreActionFormRuleId === formRule.id)
            const targetActionFormRuleActivitiesRules = currFormRuleActivitiesRules.map(item => {
                delete item["id"]
                return {...item, deptCoreActionFormRuleId: targetActionFormRuleId}
            })
            await deptCoreActionFormActivityRuleRepo.bulkCreate(targetActionFormRuleActivitiesRules, transaction)
        }
        
        await transaction.commit()
        return true
    } catch (e) {
        await transaction.rollback()
        throw e
    }
    
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

const convertToTreeFormat = (coreActions) => {
    const treeFormatResult = []
    while (coreActions.length > 0) {
        const coreAction = coreActions.splice(0, 1)[0]
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
    getDeptCoreActions,
    getDeptCoreActionsWithRules,
    getDeptCoreActionsRules,
    getTreedDeptCoreActions,
    getDeptCoreActionForms,
    delDeptCoreAction,
    updateDeptCoreAction,
    saveDeptCoreAction,
    syncDeptCoreActionsRules,
    copyActionRules
}