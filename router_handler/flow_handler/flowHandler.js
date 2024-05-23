const ExcelJS = require('exceljs')
const biResponse = require("../../utils/biResponse")
const flowService = require("../../service/flowService")
const joiUtil = require("../../utils/joiUtil")
const BigNumber = require("bignumber.js");

const getFlowsByIds = async (req, res) => {
    const {ids} = req.query
    if (ids) {
        const idsObj = JSON.parse(ids);
        const flows = await flowService.getFlowsByIds(idsObj)
        return res.send(biResponse.success(flows))
    }

    return res.send(biResponse.serverError())
}

const getTodayFlowsByIds = async (req, res) => {
    const {ids} = req.body
    if (ids && ids.length > 0) {
        const flows = await flowService.getTodayFlowsByIds(ids)
        return res.send(biResponse.success(flows))
    }

    return res.send(biResponse.serverError())
}

// 更新 Redis 中正在进行中的流程的紧急程度
const updateRunningFlowEmergency = async (req, res, next) => {
    try {
        const {ids, emergency} = req.body
        joiUtil.validate(
            {
                emergency: {value: emergency, schema: joiUtil.commonJoiSchemas.strRequired},
                ids: {value: ids, schema: joiUtil.commonJoiSchemas.arrayRequired}
            }
        )
        await flowService.updateRunningFlowEmergency(ids, emergency)
        return res.send(biResponse.success())
    } catch (e) {
        next(e)
    }
}

const getCoreDataByType = async (req, res, next) => {
    try {
        const {deptId, startDate, endDate} = req.query

        joiUtil.validate({
            deptId: {value: deptId, schema: joiUtil.commonJoiSchemas.required},
            startDate: {value: startDate, schema: joiUtil.commonJoiSchemas.dateRequired},
            endDate: {value: endDate, schema: joiUtil.commonJoiSchemas.dateRequired}
        })

        let result = []
        if (req.params.type === "action") {
            const userNames = req.query.userNames
            joiUtil.validate({
                userNames: {value: userNames, schema: joiUtil.commonJoiSchemas.strRequired}
            })
            result = await flowService.getCoreActionData(deptId, userNames, startDate, endDate)
        } else {
            // const userId = req.user.id
            const userNames = req.query.userNames
            joiUtil.validate({
                userNames: {value: userNames, schema: joiUtil.commonJoiSchemas.strRequired}
            })
            result = await flowService.getCoreFlowData(deptId, userNames, startDate, endDate)
        }
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
            {header: '流程名', key: 'processInstanceName', width: 100},
            {header: '当前所在部门', key: 'department', width: 20},
            {header: '当前节点', key: 'action', width: 30},
            {header: '操作人', key: 'operator', width: 10},
            {header: '操作时间', key: 'operateTime', width: 20},
            {header: '实际耗时', key: 'cost', width: 10},
            {header: '规定时长', key: 'requiredCost', width: 10},
            {header: '已卡滞时长', key: 'overDueDuration', width: 10}
        ]

        for (const flow of result) {
            for (const item of flow.overDueReviewItems) {
                worksheet.addRow(
                    {
                        id: flow.processInstanceId,
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
 * 获取全流程全节点的统计数据
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const getOverallFormsAndReviewItemsStat = async (req, res, next) => {
    try {
        const {startDate, endDate, formIds} = req.body
        joiUtil.validate({
            startDate: {value: startDate, schema: joiUtil.commonJoiSchemas.dateRequired},
            endDate: {value: endDate, schema: joiUtil.commonJoiSchemas.dateRequired}
        })
        const result = await flowService.getOverallFormsAndReviewItemsStat(startDate, endDate, formIds)
        return res.send(biResponse.success(result))
    } catch (e) {
        next(e)
    }
}


module.exports = {
    getFlowsByIds,
    getTodayFlowsByIds,
    updateRunningFlowEmergency,
    getCoreDataByType,
    getAllOverDueRunningFlows,
    getOverallFormsAndReviewItemsStat
}