const models = require('../model');
const NotFoundError = require("../error/http/notFoundError")
const coreActionsConst = require("../const/tmp/coreActionsConst")
const coreFormFlowConst = require("../const/tmp/coreFormFlowConst")
const sequelizeUtil = require("../utils/sequelizeUtil")
const dateUtil = require("../utils/dateUtil")

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
    let processes = await models.processModel.findAll({
        include: [
            {
                model: models.processReviewModel,
                as: "overallprocessflow",
                order: [["order_index", "asc"]]
            }
        ],
        where: {
            processInstanceId: {$in: ids}
        }
    })

    processes = sequelizeUtil.extractDataValues(processes)
    // 兼容未入库的数据
    return processes.map((process) => {
        process.overallprocessflow = sequelizeUtil.extractDataValues(process.overallprocessflow).sort((curr, next) => {
            //相邻的节点完成时间会有相同的情况，顾增加两层判断（ orderIndex 为入库时添加的）
            const timeDuration = curr.doneTime - next.doneTime
            if (timeDuration === 0) {
                return curr.orderIndex - next.orderIndex
            }
            return timeDuration
        })
        process.overallprocessflow = process.overallprocessflow.map(item => {
            return {...item, operateTimeGMT: dateUtil.format2Str(item.doneTime, "YYYY-MM-DDTHH:mm:ss") + "Z"}
        })
        return {
            ...process,
            createTimeGMT: dateUtil.format2Str(process.createTime, "YYYY-MM-DDTHH:mm:ss") + "Z",
            modifiedTimeGMT: dateUtil.format2Str(process.doneTime, "YYYY-MM-DDTHH:mm:ss") + "Z"
        }
    })
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
const getProcessWithReviewByReviewItemDoneTime = async (startDoneDateTime, enDoneDateTime, formIds) => {
    const where = {}
    if (formIds && formIds.length > 0) {
        where.formUuid = {$in: formIds}
    }
    let processWithReview = await models.processModel.findAll({
        include: [
            {
                model: models.processReviewModel,
                as: "overallprocessflow",
                where: {done_time: {$between: [startDoneDateTime, enDoneDateTime]}}
            }
        ],
        where,
        order: [["process_instance_id", "desc"]]
    })
    processWithReview = processWithReview.map((item) => {
        return item.get({plain: true})
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
const getProcessDataByReviewItemDoneTime = async (startDoneDateTime, enDoneDateTime, formIds) => {
    const tempSQL = models.sequelize.dialect.QueryGenerator.selectQuery("process_review", {
            attributes: ['process_instance_id'],
            where: {done_time: {$between: [startDoneDateTime, enDoneDateTime]}}
        }
    ).slice(0, -1);

    const where = {
        process_instance_id: {$in: models.sequelize.literal(`(${tempSQL})`)},
    }
    if (formIds && formIds.length > 0) {
        where.formUuid = {$in: formIds}
    }
    let processWithData = await models.processModel.findAll({
        include: [
            {
                model: models.processDetailsModel,
                as: "data"
            }
        ],
        where,
        order: [["process_instance_id", "desc"]]
    })

    processWithData = processWithData.map((item) => {
        return item.get({plain: true})
    })
    return processWithData
}

const getAloneProcessByIds = async (ids) => {
    const result = await models.processModel.findAll({
        where: {processInstanceId: {$in: ids}}
    })
    return result.map(item => item.get({plain: true}))
}

module.exports = {
    getAloneProcessByIds,
    getProcessByIds,
    getAllProcesses,
    updateProcess,
    getCoreActionsConfig,
    getCoreFormFlowConfig,
    getProcessDataByReviewItemDoneTime,
    getProcessWithReviewByReviewItemDoneTime
}
