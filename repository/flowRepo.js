const sequelize = require('../model/init');
const getProcessModel = require("../model/processModel")
const processModel = getProcessModel(sequelize)
const NotFoundError = require("../error/http/notFoundError")
const tmCoreActionsConst = require("../const/tmp/tmCoreActionsConst")

const getProcessByIds = async (ids) => {
    const processes = await processModel.findAll({
        where: {
            processInstanceId: ids
        }
    })
    return processes;
}

const getAllProcesses = async () => {
    const allProcesses = await processModel.findAll()
    return allProcesses
}

const updateProcess = async (process) => {
    await processModel.update(
        {...process},
        {
            where: {processInstanceId: process.processInstanceId}
        })
    return true
}

/**
 * 当前仅有天猫的
 * @param deptId
 * @returns {Promise<[{actionStatus: [{nameCN: string, origins: [{formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, Id: string, status: string[]}, to: {name: string, id: string, status: string[]}}], formName: string}, {formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}], formName: string}, {formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}], formName: string}], nameEN: string}, {name: string, origins: [{formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, actionOwnerFrom: {name: string, from: string, id: string}, actionStartNodes: [{name: string, id: string, status: [string]}], formName: string, actionEndNodes: [{name: string, id: string, status: [string]}]}, {formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}], nameEN: string}, {name: string, origins: [{formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}], nameEN: string}], actionName: string}, {actionStatus: [{nameCN: string, origins: [{formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}], formName: string}, {formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}, {owner: {name: string, from: string, id: string}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}, {owner: {name: string, from: string, id: string}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}], formName: string}, {formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}], formName: string}], nameEN: string}, {nameCN: string, origins: [{formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}, {owner: {name: string, from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}, {owner: {name: string, from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}], nameEN: string}, {nameCN: string, origins: [{formId: string, countNodePairs: [{owner: {from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, countNodePairs: [{owner: {from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}], nameEN: string}], actionName: string}, {actionStatus: [{nameCN: string, origins: [{formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}], formName: string}], nameEN: string}, {nameCN: string, origins: [{formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}], nameEN: string}, {nameCN: string, origins: [{formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}], nameEN: string}], actionName: string}]>}
 */
const getCoreActionsConfig = async (deptId) => {
    if (deptId === "903075138") {
        return tmCoreActionsConst
    }
    throw new NotFoundError(`未找到部门：${deptId}的核心动作的配置信息`)
}

module.exports = {
    getProcessByIds,
    getAllProcesses,
    updateProcess,
    getCoreActionsConfig
}
