const models = require('../model');
const NotFoundError = require("../error/http/notFoundError")
const coreActionsConst = require("../const/tmp/coreActionsConst")
const coreFormFlowConst = require("../const/tmp/coreFormFlowConst")
const sequelizeUtil = require("../utils/sequelizeUtil")

models.processModel.hasMany(models.processReviewModel,
    {
        foreignKey: 'process_instance_id',
        as: "overallprocessflow"
    }
)

models.processModel.hasMany(models.processDetailsModel,
    {
        foreignKey: 'process_instance_id',
        as: "data"
    }
)

const getProcessByIds = async (ids) => {
    const processes = await models.processModel.findAll({
        include: [
            {
                model: models.processReviewModel,
                as: "overallprocessflow"
            }
        ],
        where: {
            processInstanceId: {$in: ids}
        }
    })

    return sequelizeUtil.extractDataValues(processes)
}

const getAllProcesses = async () => {
    const allProcesses = await models.processModel.findAll()
    return allProcesses
}

const updateProcess = async (process) => {
    await models.processModel.update(
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
 * @returns {Promise<[{actionStatus: [{children: [], nameCN: string, rules: [{formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}], formName: string}, {formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}], formName: string}, {formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}], formName: string}], nameEN: string}, {nameCN: string, rules: [{formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}], nameEN: string}, {nameCN: string, rules: [{formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}], nameEN: string}], actionCode: string, actionName: string}, {actionStatus: [{nameCN: string, rules: [{formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}], formName: string}, {formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}, {ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}, {ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}], formName: string}, {formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: string[]}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}], formName: string}], nameEN: string}, {nameCN: string, rules: [{formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}, {ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}, {ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}], nameEN: string}, {nameCN: string, rules: [{formId: string, flowNodeRules: [{ownerRule: {from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}], nameEN: string}], actionCode: string, actionName: string}, {actionStatus: [{nameCN: string, rules: [{formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}], formName: string}], nameEN: string}, {nameCN: string, rules: [{formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}], nameEN: string}, {nameCN: string, rules: [{formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}], nameEN: string}], actionCode: string, actionName: string}]>}
 */
const getCoreActionsConfig = async (deptId) => {
    if (!Object.keys(coreActionsConst).includes(deptId)) {
        throw new NotFoundError(`未找到部门：${deptId}的核心动作的配置信息`)
    }

    return coreActionsConst[deptId.toString()]
}

/**
 * 获取部门的核心流程下指定节点的配置信息
 * @param deptId
 * @returns {Promise<[{formId: string, formName: string, actions}, {formId: string, formName: string, actions}, {formId: string, formName: string, actions}, {formId: string, formName: string, actions}]|*>}
 */
const getCoreFormFlowConfig = async (deptId) => {
    if (!Object.keys(coreFormFlowConst).includes(deptId)) {
        throw new NotFoundError(`未找到部门：${deptId}的核心流程的配置信息`)
    }
    return coreFormFlowConst[deptId.toString()]
}

/**
 * 根据节点的完成时间获取流程的信息+审核信息
 *
 * process、process_details、 process_review 三表连接性能极差，顾拆开
 * @param id
 * @returns {Promise<[]|*>}
 */
const getProcessWithReviewByReviewItemDoneTime = async (startDoneDateTime, enDoneDateTime) => {
    const tempSQL = models.sequelize.dialect.QueryGenerator.selectQuery("process_review", {
            attributes: ['process_instance_id'],
            where: {done_time: {$between: [startDoneDateTime, enDoneDateTime]}}
        }
    ).slice(0, -1);

    const processWithReview = await models.processModel.findAll({
        include: [
            {
                model: models.processReviewModel,
                // where: {processReviewModel: models.Sequelize.col("models.processModel.process_instance_id")},
                as: "overallprocessflow"
            }
        ],
        where: {process_instance_id: {$in: models.sequelize.literal(`(${tempSQL})`)}},
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
    const tempSQL = models.sequelize.dialect.QueryGenerator.selectQuery("process_review", {
            attributes: ['process_instance_id'],
            where: {done_time: {$between: [startDoneDateTime, enDoneDateTime]}}
        }
    ).slice(0, -1);

    const processWithData = await models.processModel.findAll({
        include: [
            {
                model: models.processDetailsModel,
                // where: {processDetailsModel: models.Sequelize.col("models.processModel.process_instance_id")},
                as: "data"
            }
        ],
        where: {process_instance_id: {$in: models.sequelize.literal(`(${tempSQL})`)}},
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
