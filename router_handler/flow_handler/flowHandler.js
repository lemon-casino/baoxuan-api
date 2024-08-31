const ExcelJS = require('exceljs')
const BigNumber = require("bignumber.js")
const flowService = require("@/service/flowService")
const visionCoreActionService = require("@/service/activity/deptCoreActionService/visionCoreActionService")
const universalCoreActionService = require("@/service/activity/deptCoreActionService/universalCoreActionService")
const turnoverCoreActionService = require("@/service/activity/deptCoreActionService/turnoverCoreActionService")
const flowFormService = require("@/service/flowFormService")
const joiUtil = require("@/utils/joiUtil")
const biResponse = require("@/utils/biResponse")
const flowSchema = require("@/schema/flowSchema")
const moment = require('moment')
const coreActionStatTypeConst = require("@/const/coreActionStatTypeConst")

const getCompletedFlowsByIds = async (req, res, next) => {
    try {
        joiUtil.clarityValidate(flowSchema.requiredIdsSchema, req.body)
        const {ids} = req.query
        const idsObj = JSON.parse(ids);
        const flows = await flowService.getCompletedFlowsByIds(idsObj)
        return res.send(biResponse.success(flows))
    } catch (e) {
        next(e)
    }
}

const getFlowsByIds = async (req, res, next) => {
    try {
        joiUtil.clarityValidate(flowSchema.requiredIdsSchema, req.body)
        const flows = await flowService.getFlowsByIds(req.body.ids)
        return res.send(biResponse.success(flows))
    } catch (e) {
        next(e)
    }
    
    return res.send(biResponse.serverError())
}

/**
 * 获取流程表单以及表头
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
const getFlows = async (req, res, next) => {
    try {
        const flows = await flowService.getFlows(req.query)
        return res.send(biResponse.success(flows))
    } catch (e) {
        next(e)
    }
    return res.send(biResponse.serverError())
}
/**
 * 获取流程表单详细的工单数据
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
const getFlowsProcessByIds = async (req, res, next) => {
    try {
        joiUtil.clarityValidate(flowSchema.getFlowsProcessSchema, req.query)
        const limit = parseInt(req.query.pageSize)
        const page = parseInt(req.query.currentPage)
        const offset = (page - 1) * limit
        const process = await flowService.getFlowsProcesses(req.query, offset, limit)
        return res.send(biResponse.success(process))
    } catch (e) {
        next(e)
    }

    return res.send(biResponse.serverError)
}

const getFlowProcessActions = async (req, res, next) => {
    try {
        joiUtil.clarityValidate(flowSchema.getFlowsActionsSchema, req.query)
        const actions = await flowService.getFlowsActions(req.query.id)
        return res.send(biResponse.success(actions))
    } catch (e) {
        next(e)
    }

    return res.send(biResponse.serverError)
}

/**
 * 流程表单导出
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
const exportFlowsProcess = async (req, res, next) => {
    try {
        joiUtil.clarityValidate(flowSchema.requiredIdSchema, req.body)
        const flows = await flowService.getFlowsInfoById(req.body.id)
        if (!flows?.length) return res.send(biResponse.canTFindIt)
        const data = await flowService.getFlowsProcessById(req.body.id)
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet(flows[0].flowFormName)
        let tmpDefault = {
            processInstanceId: null,
            title: null,
            createTime: null
        }
        let columns = [
            { header: '实例ID', key: 'processInstanceId', isDefault: true },
            { header: '实例标题', key: 'title', isDefault: true },
            { header: '状态', key: 'instanceStatus', isDefault: true },
            { header: '创建时间', key: 'createTime', isDefault: true },
            { header: '操作时间', key: 'operateTime', isDefault: true },
            { header: '入库时间', key: 'stockedTime', isDefault: true }
        ]
        for (let i = 0; i < flows[0].flowFormDetails.length; i++) {
            columns.push({
                header: flows[0].flowFormDetails[i].fieldName,
                key: flows[0].flowFormDetails[i].fieldId,
                isDefault: true
            })
            tmpDefault[flows[0].flowFormDetails[i].fieldId] = null
        }

        worksheet.columns = columns

        for (let i = 0; i < data.data.length; i++) {
            let tmp = {...tmpDefault}
            
            tmp['processInstanceId'] = data.data[i].processInstanceId,
            tmp['title'] = data.data[i].title,
            tmp['instanceStatus'] = data.data[i].instanceStatus
            tmp['createTime'] = data.data[i].createTime
            tmp['stockedTime'] = data.data[i].stockedTime
            tmp['doneTime'] = data.data[i].doneTime
            for (let j = 0; j < data.data[i].data.length; j++) {
                tmp[data.data[i].data[j].fieldId] = data.data[i].data[j].fieldValue
            }

            worksheet.addRow(tmp)
        }

        const buffer = await workbook.xlsx.writeBuffer()
        res.setHeader('Content-Disposition', `attachment; filename="flows-process-export-${moment().format('YYYY-MM-DD')}.xlsx"`)
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')        
        return res.send(buffer)
    } catch (e) {
        next(e)
    }
}

// 更新 Redis 中正在进行中的流程的紧急程度
const updateRunningFlowEmergency = async (req, res, next) => {
    try {
        joiUtil.clarityValidate(flowSchema.updateRunningFlowEmergencySchema, req.body)
        const {ids, emergency} = req.body
        await flowService.updateRunningFlowEmergency(ids, emergency)
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

const getVisionCoreActionStat = async (req, res, next) => {
    try {
        joiUtil.clarityValidate(flowSchema.getCoreActionsSchema, req.body)
        const {statType, tags, deptIds, startDate, endDate, userNames} = req.body
        const userId = req.user.userId
        const result = await visionCoreActionService.getCoreActionStat(statType, tags, userId, deptIds, userNames, startDate, endDate)
        res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getVisionUsersStat = async (req, res, next) => {
    try {
        joiUtil.clarityValidate(flowSchema.getCoreActionsSchema, req.body)
        const {statType, tags, deptIds, startDate, endDate, userNames} = req.body
        const userId = req.user.userId
        const result = statType === coreActionStatTypeConst.StatAction ?
            await visionCoreActionService.getCoreActionStat(statType, tags, userId, ["482162119", "933412643", "962724541", "962893128"], userNames, startDate, endDate) : 
            await visionCoreActionService.getUsersStat(tags, ["482162119", "933412643", "962724541", "962893128"], userId, userNames, startDate, endDate)
        res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getUniversalCoreActionStat = async (req, res, next) => {
    try {
        joiUtil.clarityValidate(flowSchema.getCoreActionsSchema, req.body)
        const {statType, deptIds, startDate, endDate, userNames} = req.body
        const userId = req.user.userId
        const result = await universalCoreActionService.getCoreActionStat(statType, userId, deptIds, userNames, startDate, endDate)
        res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

const getTurnoverCoreActionStat = async (req, res, next) => {
    try {
        joiUtil.clarityValidate(flowSchema.getCoreActionsSchema, req.body)
        const {statType, deptIds, startDate, endDate, userNames} = req.body
        const userId = req.user.userId
        const result = await turnoverCoreActionService.getCoreActionStat(statType, userId, deptIds, userNames, startDate, endDate)
        res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}


const getAllOverDueRunningFlows = async (req, res, next) => {
    try {
        const result = await flowService.getAllOverDueRunningFlows()
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('runningOverdueFlows');
        
        worksheet.columns = [
            {header: '流程表单名', key: 'flowFromName', width: 30},
            {header: '流程名', key: 'processInstanceName', width: 100},
            {header: '当前所在部门', key: 'department', width: 20},
            {header: '当前节点', key: 'action', width: 30},
            {header: '操作人', key: 'operator', width: 10},
            {header: '操作时间', key: 'operateTime', width: 20},
            {header: '实际耗时', key: 'cost', width: 10},
            {header: '规定时长', key: 'requiredCost', width: 10},
            {header: '已卡滞时长', key: 'overDueDuration', width: 10}
        ]
        
        const flowFormMap = {}
        for (const flow of result) {
            let flowForm = flowFormMap[flow.formUuid]
            
            if (!flowForm) {
                flowForm = await flowFormService.getFlowForm(flow.formUuid)
                flowFormMap[flow.formUuid] = flowForm
            }
            
            for (const item of flow.overDueReviewItems) {
                worksheet.addRow(
                    {
                        id: flow.processInstanceId,
                        flowFromName: flowForm.flowFormName,
                        processInstanceName: flow.title,
                        department: item.department,
                        action: item.showName,
                        operator: item.operatorName,
                        operateTime: item.activeTimeGMT,
                        cost: item.cost,
                        requiredCost: item.requiredCost,
                        overDueDuration: new BigNumber(parseFloat(item.cost)).minus(parseFloat(item.requiredCost.toString()))
                    }
                );
            }
        }
        
        const buffer = await workbook.xlsx.writeBuffer();
        
        res.setHeader('Content-Disposition', 'attachment; filename="overdueRunningFlows.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        
        return res.send(buffer)
    } catch (e) {
        next(e)
    }
}

/**
 * 获取全流程全节点的统计数据(可以分部门)
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const getFormsFlowsActivitiesStat = async (req, res, next) => {
    try {
        const {startDate, endDate, formIds, deptIds} = req.body
        const userId = req.user.id
        joiUtil.validate({
            startDate: {value: startDate, schema: joiUtil.commonJoiSchemas.dateRequired},
            endDate: {value: endDate, schema: joiUtil.commonJoiSchemas.dateRequired},
            deptIds: {value: deptIds, schema: joiUtil.commonJoiSchemas.arrayRequired}
        })
        if (deptIds.includes("933412643")) {
            deptIds.push("962724541", "962893128")
        }
        const result = await flowService.getFormsFlowsActivitiesStat(userId, startDate, endDate, formIds, deptIds)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getCompletedFlowsByIds,
    getFlowsByIds,
    getFlows,
    getFlowsProcessByIds,
    exportFlowsProcess,
    getFlowProcessActions,
    updateRunningFlowEmergency,
    getVisionCoreActionStat,
    getVisionUsersStat,
    getUniversalCoreActionStat,
    getTurnoverCoreActionStat,
    getAllOverDueRunningFlows,
    getFormsFlowsActivitiesStat
}