const models = require('@/model')
const processModel = models.processModel
const processReviewModel = models.processReviewModel
const processDetailsModel = models.processDetailsModel
const flowFormDetailsModel = models.flowFormDetailsModel
const deptCoreActionModel = models.deptCoreActionModel

const NotFoundError = require("@/error/http/notFoundError")
const coreActionsConst = require("@/const/tmp/coreActionsConst")
const coreFormFlowConst = require("@/const/tmp/coreFormFlowConst")
const sequelizeUtil = require("@/utils/sequelizeUtil")
const dateUtil = require("@/utils/dateUtil")
const algorithmUtil = require("@/utils/algorithmUtil")
const sequelize = require('sequelize')

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

processModel.hasOne(flowFormDetailsModel,
    {
        sourceKey: "formUuid",
        foreignKey: "form_id",
        as: "flowFormDetails"
    }
)

const getProcessByIds = async (ids) => {
    const processRelatedInfo = await Promise.all([
        processModel.findAll({
            where: {processInstanceId: {$in: ids}}
        }),
        
        processReviewModel.findAll({
            where: {processInstanceId: {$in: ids}},
            order: [["order_index", "asc"]]
        }),
        
        processDetailsModel.findAll({
            where: {processInstanceId: {$in: ids}}
        })
    ])
    
    
    const processes = sequelizeUtil.extractDataValues(processRelatedInfo[0])
    const processesReviewItems = sequelizeUtil.extractDataValues(processRelatedInfo[1])
    const processesDetails = sequelizeUtil.extractDataValues(processRelatedInfo[2])
    const formIds = processes.map(item => item.formUuid)
    const tmpFlowsFormDetails = await flowFormDetailsModel.findAll({
        where: {formId: {$in: formIds}}
    })
    const flowsFormDetails = sequelizeUtil.extractDataValues(tmpFlowsFormDetails)
    for (const process of processes) {
        
        if (process.processInstanceId === "35773449-999e-47c8-8d7d-7b003fe5e177") {
            console.log("-----")
        }
        
        process.createTimeGMT = dateUtil.format2Str(process.createTime, "YYYY-MM-DDTHH:mm:ss") + "Z"
        process.modifiedTimeGMT = dateUtil.format2Str(process.doneTime, "YYYY-MM-DDTHH:mm:ss") + "Z"
        
        let processReviewItems = processesReviewItems.filter(item => item.processInstanceId === process.processInstanceId)
        processReviewItems = processReviewItems.map(item => {
            return {...item, operateTimeGMT: dateUtil.format2Str(item.doneTime, "YYYY-MM-DDTHH:mm:ss") + "Z"}
        })
        process.overallprocessflow = processReviewItems
        
        const processDetails = processesDetails.filter(item => item.processInstanceId === process.processInstanceId)
        const processFlowFormDetails = flowsFormDetails.filter(item => item.formId === process.formUuid)
        process.data = {}
        for (const item of processDetails) {
            process.data[item.fieldId] = item.fieldValue
        }
        
        process.dataKeyDetails = {}
        for (const item of processFlowFormDetails) {
            process.dataKeyDetails[item.fieldId] = item.fieldName
        }
    }
    return processes
}

const getFlowsProcessById = async (id, offset, limit) => {
    let sql = '', replacements = [id]
    if (limit) {
        sql = `SELECT p.*, d.field_id AS fieldId, d.field_name AS fieldName, 
            d.field_value AS fieldValue FROM (
                SELECT title, process_instance_id AS processInstanceId, (CASE instance_status 
                    WHEN 'RUNNING' THEN '运行中' 
                    WHEN 'TERMINATED' THEN '已终止' 
                    WHEN 'COMPLETED' THEN '已完成' 
                    ELSE '异常' END
                ) AS instanceStatus, create_time AS createTime, 
                stocked_time AS stockedTime, operate_time AS operateTime FROM process_tmp
                WHERE form_uuid = ? ORDER BY create_time DESC LIMIT ?, ?
            ) AS p LEFT JOIN process_details_tmp AS d ON 
            p.processInstanceId = d.process_instance_id`
        replacements.push(offset, limit)
    } else {
        sql = `SELECT p.title, p.process_instance_id AS processInstanceId, (CASE p.instance_status 
                WHEN 'RUNNING' THEN '运行中' 
                WHEN 'TERMINATED' THEN '已终止' 
                WHEN 'COMPLETED' THEN '已完成' 
                ELSE '异常' END
            ) AS instanceStatus, p.create_time AS createTime, 
            p.stocked_time AS stockedTime, p.operate_time AS operateTime, d.field_id AS fieldId, 
            d.field_name AS fieldName, d.field_value as fieldValue FROM process_tmp p 
            LEFT JOIN process_details_tmp AS d ON p.process_instance_id = d.process_instance_id
            WHERE p.form_uuid = ? ORDER BY p.create_time DESC`
    }
    let processes = [], tmp = {}, j = 0
    const process = await processModel.sequelize.query(sql, 
        {
            replacements,
            type: sequelize.QueryTypes.SELECT
        })

    for (let i = 0; i < process.length; i++) {
        if (tmp[process[i]['processInstanceId']] != undefined) {
            processes[tmp[process[i]['processInstanceId']]]['data'].push({
                fieldId: process[i]['fieldId'],
                fieldName: process[i]['fieldName'],
                fieldValue: process[i]['fieldValue']
            })
        } else {
            tmp[process[i]['processInstanceId']] = j
            processes.push({
                title: process[i]['title'],
                processInstanceId: process[i]['processInstanceId'],
                instanceStatus: process[i]['instanceStatus'],
                createTime: process[i]['createTime'],
                stockedTime: process[i]['stockedTime'],
                doneTime: process[i]['doneTime'],
                data: [{
                    fieldId: process[i]['fieldId'],
                    fieldName: process[i]['fieldName'],
                    fieldValue: process[i]['fieldValue']
                }]
            })
            j++
        }
    }

    return processes
}

const getFlowsProcessCountById = async (id) => {
    const count = await processModel.sequelize.query(`
        SELECT COUNT(process_instance_id) AS count FROM process_tmp WHERE form_uuid = ?`, 
        {
            replacements: [id],
            type: sequelize.QueryTypes.SELECT
        })

    return count[0].count
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
 *
 *
 * @param deptIds
 * @returns {Promise<[{actionStatus: [{children: [], nameCN: string, rules: [{formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}], formName: string}, {formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}], formName: string}, {formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}], formName: string}], nameEN: string}, {nameCN: string, rules: [{formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}], nameEN: string}, {nameCN: string, rules: [{formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}], nameEN: string}], actionCode: string, actionName: string}, {actionStatus: [{nameCN: string, rules: [{formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}], formName: string}, {formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}, {ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}, {ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}], formName: string}, {formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: string[]}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}], formName: string}], nameEN: string}, {nameCN: string, rules: [{formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}, {ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}, {ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}], nameEN: string}, {nameCN: string, rules: [{formId: string, flowNodeRules: [{ownerRule: {from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}], nameEN: string}], actionCode: string, actionName: string}, {actionStatus: [{nameCN: string, rules: [{formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, from: {name: string, id: string, status: string[]}, to: {name: string, id: string, status: string[]}}], formName: string}], nameEN: string}, {nameCN: string, rules: [{formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}], nameEN: string}, {nameCN: string, rules: [{formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}, {formId: string, flowNodeRules: [{ownerRule: {name: string, from: string, id: string}, overdue: {name: string, id: string, status: [string]}, from: {name: string, id: string, status: [string]}, to: {name: string, id: string, status: [string]}}], formName: string}], nameEN: string}], actionCode: string, actionName: string}]>}
 */
const getCoreActionsConfig = async (deptIds) => {
    for (const key of Object.keys(coreActionsConst)) {
        if (deptIds.includes(key)) {
            return coreActionsConst[key]
        }
    }
    throw new NotFoundError(`未找到部门：${deptIds}的核心动作的配置信息`)
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
    let processWithReview = await processModel.findAll({
        include: [
            {
                model: processReviewModel,
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
    let processWithData = await processModel.findAll({
        include: [
            {
                model: processDetailsModel,
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
    const result = await processModel.findAll({
        where: {processInstanceId: {$in: ids}}
    })
    return result.map(item => item.get({plain: true}))
}

module.exports = {
    getAloneProcessByIds,
    getProcessByIds,
    getFlowsProcessById,
    getFlowsProcessCountById,
    getAllProcesses,
    updateProcess,
    getCoreActionsConfig,
    getCoreFormFlowConfig,
    getProcessDataByReviewItemDoneTime,
    getProcessWithReviewByReviewItemDoneTime
}
