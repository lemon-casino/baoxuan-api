const Sequelize = require('sequelize')
const sequelize = require('../model/init');
const getProcessModel = require("../model/processModel")
const processModel = getProcessModel(sequelize)
const getProcessReviewModel = require("../model/processReviewModel")
const processReviewModel = getProcessReviewModel(sequelize)
const getProcessDetailsModel = require("../model/processDetailsModel")
const processDetailsModel = getProcessDetailsModel(sequelize)
const NotFoundError = require("../error/http/notFoundError")
const {tmCoreActionsConfig} = require("../const/tmp/coreActionsConst")
const {tmCoreFormFlowConfig, mbCoreFormFlowConfig} = require("../const/tmp/coreFormFlowConst")

processModel.hasMany(processReviewModel,
    {
        foreignKey: 'process_instance_id',
        as: "overallprocessflow"
    }
)

processModel.hasMany(processDetailsModel,
    {
        foreignKey: 'process_instance_id',
        as: "data"
    }
)

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
 *
 * @param deptId
 * @returns {Promise<[{actionStatus: [{nameCN: string, origins: [{formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, Id: string, status: string[]}, to: {name: string, id: string, status: string[]}}], formName: string}, {formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}], formName: string}, {formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}], formName: string}], nameEN: string}, {name: string, origins: [{formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, actionOwnerFrom: {name: string, from: string, id: string}, actionStartNodes: [{name: string, id: string, status: [string]}], formName: string, actionEndNodes: [{name: string, id: string, status: [string]}]}, {formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}], nameEN: string}, {name: string, origins: [{formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}], nameEN: string}], actionName: string}, {actionStatus: [{nameCN: string, origins: [{formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}], formName: string}, {formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}, {owner: {name: string, from: string, id: string}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}, {owner: {name: string, from: string, id: string}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}], formName: string}, {formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}], formName: string}], nameEN: string}, {nameCN: string, origins: [{formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}, {owner: {name: string, from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}, {owner: {name: string, from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}], nameEN: string}, {nameCN: string, origins: [{formId: string, countNodePairs: [{owner: {from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, countNodePairs: [{owner: {from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}], nameEN: string}], actionName: string}, {actionStatus: [{nameCN: string, origins: [{formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}], formName: string}], nameEN: string}, {nameCN: string, origins: [{formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}], nameEN: string}, {nameCN: string, origins: [{formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, countNodePairs: [{owner: {name: string, from: string, id: string}, overdue: {name: string, id: string}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}], nameEN: string}], actionName: string}]>}
 */
const getCoreActionsConfig = async (deptId) => {
    // 天猫组
    if (deptId === "903075138") {
        return tmCoreActionsConfig
    }
    throw new NotFoundError(`未找到部门：${deptId}的核心动作的配置信息`)
}

/**
 * 获取部门的核心流程下指定节点的配置信息
 * @param deptId
 * @returns {Promise<[{formId: string, formName: string, actions}, {formId: string, formName: string, actions}, {formId: string, formName: string, actions}, {formId: string, formName: string, actions}]|*>}
 */
const getCoreFormFlowConfig = async (deptId) => {
    // 天猫组
    if (deptId === "903075138") {
        return tmCoreFormFlowConfig
    }
    // 视觉部
    else if (deptId === "482162119") {
        return mbCoreFormFlowConfig
    }

    throw new NotFoundError(`未找到部门：${deptId}的核心流程的配置信息`)
}

/**
 * 根据节点的完成时间获取流程的信息+审核信息
 *
 * process、process_details、 process_review 三表连接性能极差，顾拆开
 * @param id
 * @returns {Promise<[]|*>}
 */
const getProcessWithReviewByReviewItemDoneTime = async (startDoneDateTime, enDoneDateTime) => {
    const tempSQL = sequelize.dialect.QueryGenerator.selectQuery("process_review", {
            attributes: ['process_instance_id'],
            where: {done_time: {$between: [startDoneDateTime, enDoneDateTime]}}
        }
    ).slice(0, -1);

    const processWithReview = await processModel.findAll({
        include: [
            {
                model: processReviewModel,
                where: {processReviewModel: Sequelize.col("processModel.process_instance_id")},
                as: "overallprocessflow"
            }
        ],
        where: {process_instance_id: {$in: sequelize.literal(`(${tempSQL})`)}},
        order: [["process_instance_id", "desc"]]
    })
    return processWithReview
}

/**
 * 根据节点的完成时间获取流程的信息+表单信息
 *
 * process、process_details、 process_review 三表连接性能极差，顾拆开
 * @param startDoneDateTime
 * @param enDoneDateTime
 * @returns {Promise<*>}
 */
const getProcessDataByReviewItemDoneTime = async (startDoneDateTime, enDoneDateTime) => {
    const tempSQL = sequelize.dialect.QueryGenerator.selectQuery("process_review", {
            attributes: ['process_instance_id'],
            where: {done_time: {$between: [startDoneDateTime, enDoneDateTime]}}
        }
    ).slice(0, -1);

    const processWithData = await processModel.findAll({
        include: [
            {
                model: processDetailsModel,
                where: {processDetailsModel: Sequelize.col("processModel.process_instance_id")},
                as: "data"
            }
        ],
        where: {process_instance_id: {$in: sequelize.literal(`(${tempSQL})`)}},
        order: [["process_instance_id", "desc"]]
    })

    return processWithData
}


module.exports = {
    getProcessByIds,
    getAllProcesses,
    updateProcess,
    getCoreActionsConfig,
    getCoreFormFlowConfig,
    getProcessDataByReviewItemDoneTime,
    getProcessWithReviewByReviewItemDoneTime
}
