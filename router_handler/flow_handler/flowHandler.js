const ExcelJS = require('exceljs')
const BigNumber = require("bignumber.js")
const flowService = require("@/service/flowService")
const visionCoreActionService = require("@/service/core/visionCoreActionService")
const tmCoreActionService = require("@/service/core/tmCoreActionService")
const flowFormService = require("@/service/flowFormService")
const joiUtil = require("@/utils/joiUtil")
const biResponse = require("@/utils/biResponse")
const flowSchema = require("@/schema/flowSchema")

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

const getTMCoreActionStat = async (req, res, next) => {
    try {
        joiUtil.clarityValidate(flowSchema.getCoreActionsSchema, req.body)
        const {statType, deptIds, startDate, endDate, userNames} = req.body
        const userId = req.user.userId
        const result = await tmCoreActionService.getCoreActionStat(statType, userId, deptIds, userNames, startDate, endDate)
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
        const result = await flowService.getFormsFlowsActivitiesStat(userId, startDate, endDate, formIds, deptIds)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}

module.exports = {
    getCompletedFlowsByIds,
    getFlowsByIds,
    updateRunningFlowEmergency,
    getVisionCoreActionStat,
    getTMCoreActionStat,
    getAllOverDueRunningFlows,
    getFormsFlowsActivitiesStat
}