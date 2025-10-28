const processRepo = require("@/repository/processRepo")
const userRepo = require("@/repository/userRepo")
const processConst = require('@/const/processConst')
const { v4 } = require('uuid')
const developmentProcessesRepo = require("@/repository/process/developmentProcessRepo")
const actReProcdefRepo = require("@/repository/bpm/actReProcdefRepo")
const commonReq = require('@/core/bpmReq/commonReq')

const getLatestModifiedProcess = async () => {
    return await processRepo.getLatestModifiedProcess();
}

const saveProcess = async (process) => {
    return await processRepo.saveProcess(process)
}

/**
 * 将流程表中data和overallprocessflow为字符串的数据改为json
 * @returns {Promise<void>}
 */
const correctStrFieldToJson = async () => {
    return await processRepo.correctStrFieldToJson()
}

const getProcessByProcessInstanceId = async (processInstanceId) => {
    return await processRepo.getProcessByProcessInstanceId(processInstanceId)
}
//查询采购任务统计
const getProcurementProcessStatistics = async (startDate, endDate) => {
    const result = await processRepo.getProcurementProcessStatistics(startDate, endDate);
    //获取创建数量和进行中数量
    if (result && result.length > 0) {
        for (const item of result) {
            let createNumber = {
                numberTmp: await processRepo.getProcurementProcessTmpCreateNumber(item.nickname, startDate, endDate),
                number: await processRepo.getProcurementProcessCreateNumber(item.nickname, startDate, endDate)
            };
            item.createNmuber = createNumber;
            item.conductNumber = await processRepo.getProcurementProcessConductNumber(item.nickname, startDate, endDate);
        }
    }
    return result;
}
//查询已完成的流程id
const getProcessIdsData = async (dateType, nickname, startDate, endDate, isSelect) => {
    const isName = nickname !== undefined && nickname != null ? 'pd.field_value LIKE "%' + nickname + '%"' : "1=1";
    // 1查询创建时间 2查询完成时间
    const date = dateType === 1 ? "a.create_time" : "a.done_time";
    const fieldValue = isSelect !== undefined ? "WHERE pd.field_value = '"+isSelect+"'":"";
    if(fieldValue != null){
        return await processRepo.getProcessIdsData2(date, startDate, endDate,fieldValue, isName)
    }else{
        return await processRepo.getProcessIdsData(date, startDate, endDate, isName)
    }
}
//查询进行中的流程id
const getProcessIdsTmpData = async (dateType, nickname, startDate, endDate, isSelect) => {
    const isName = nickname !== undefined && nickname != null ? 'pd.field_value LIKE "%' + nickname + '%"' : "1=1";
    // 1查询创建时间 2查询完成时间
    const date = dateType === 1 ? "a.create_time between '"+startDate+"' and '"+endDate+"' and" : "";
    return await processRepo.getProcessIdsTmpData(date, startDate, endDate, isName)
}
const getProcessMergeIdsData = async (dateType, nickname, startDate, endDate, isSelect) => {
    const number = await getProcessIdsTmpData(dateType, nickname, startDate, endDate);
    const numberTmp = await getProcessIdsData(dateType, nickname, startDate, endDate);
    if(numberTmp.length>0){
        numberTmp.forEach(item=>{
            number.push(item)
        })
    }
    return number;
}

const getDevelopmentProcessTotal = async (type, startDate, endDate) => {
    const result = {columns: [], data: []}
    const counts = {
        supplier: 0,
        operator: 0,
        ip: 0,
        self: 0
    }

    let operatorInquiryStats = {running: 0, success: 0, fail: 0}
    let dailyInquiryStats = {running: 0, finish: 0}

    if (type === '0') {
        result.columns = processConst.dColumns
        const rows = await developmentProcessesRepo.countByType(startDate, endDate)
        rows && rows.forEach(row => {
            const count = Number(row.count) || 0
            switch (row.type) {
                case processConst.typeList.SUPPLIER:
                    counts.supplier = count
                    break
                case processConst.typeList.OPERATOR:
                    counts.operator = count
                    break
                case processConst.typeList.IP:
                    counts.ip = count
                    break
                case processConst.typeList.SELF:
                    counts.self = count
                    break
                default:
            }
        })

        operatorInquiryStats = await developmentProcessesRepo.countOperatorInquiryStats({ startDate, endDate })
        dailyInquiryStats = await developmentProcessesRepo.countDailyInquiryStats({ startDate, endDate })
    } else {
        result.columns = processConst.rColumns
        const rows = await developmentProcessesRepo.countByTypeWithStatus([1])
        rows && rows.forEach(row => {
            const count = Number(row.count) || 0
            switch (row.type) {
                case processConst.typeList.SUPPLIER:
                    counts.supplier = count
                    break
                case processConst.typeList.OPERATOR:
                    counts.operator = count
                    break
                case processConst.typeList.IP:
                    counts.ip = count
                    break
                case processConst.typeList.SELF:
                    counts.self = count
                    break
                default:
            }
        })

        operatorInquiryStats = await developmentProcessesRepo.countOperatorInquiryStats({ statusFilter: [1] })
        dailyInquiryStats = await developmentProcessesRepo.countDailyInquiryStats({ statusFilter: [1] })
    }

    operatorInquiryStats = operatorInquiryStats || {running: 0, success: 0, fail: 0}
    dailyInquiryStats = dailyInquiryStats || {running: 0, finish: 0}

    const operatorInquiryTotal = type === '0'
        ? operatorInquiryStats.running + operatorInquiryStats.success + operatorInquiryStats.fail
        : operatorInquiryStats.running
    const dailyInquiryTotal = type === '0'
        ? dailyInquiryStats.running + dailyInquiryStats.finish
        : dailyInquiryStats.running
    const inquiryTotal = operatorInquiryTotal + dailyInquiryTotal

    const developmentTotal = counts.supplier + counts.operator + counts.ip + counts.self
    result.data = [{
        development: developmentTotal,
        ...counts,
        inquiry: inquiryTotal,
        inquiry_operator: operatorInquiryTotal,
        enquiry: dailyInquiryTotal,
        inquiry_running: operatorInquiryStats.running || 0,
        inquiry_success: type === '0' ? operatorInquiryStats.success || 0 : 0,
        inquiry_fail: type === '0' ? operatorInquiryStats.fail || 0 : 0,
        enquiry_running: dailyInquiryStats.running || 0,
        enquiry_finish: type === '0' ? dailyInquiryStats.finish || 0 : 0
    }]

    return result
}

const getDevelopmentProcessList = async (type, column, startDate, endDate) => {
    let result = {
        columns: processConst.defaultColumns,
        data: []
    }
    return result
}

const createDevelopmentProcess = async (params, dingding_id) => {
    const user = await userRepo.getUserWithDeptByDingdingUserId(dingding_id)
    let process_status = ''
    switch(params.type) {
        case processConst.typeList.SUPPLIER: 
            process_status = '开发审核中'
            break
        case processConst.typeList.OPERATOR:
            process_status = '开发审核中'
            break
        case processConst.typeList.IP:
            process_status = '非京东分析中,京东分析中'
            break
        case processConst.typeList.SELF:
            process_status = '非京东分析中,京东分析中'
            break
        default:
    }
    const uid = v4()
    let result = await developmentProcessesRepo.insert([
        uid, user.nickname, user.dept_name, params.type, params.name, params.categories, 
        params.seasons, params.related, params.image, params.brief_name, params.purchase_type, 
        params.supplier, params.supplier_type, params.product_info, params.product_type, 
        params.patent_belongs, params.patent_type, params.sale_purpose, params.analysis, 
        params.develop_type, params.analysis_name, params.project_type, params.design_type, 
        params.exploitation_features, params.core_reasons, params.scheduler_arrived_time, 
        params.scheduler_confirm_time, params.is_self, process_status
    ])
    if (result) {
        let processDefinitionId = await actReProcdefRepo.getProcessDefinitionId(
            processConst.analysisProcess.name,
            processConst.analysisProcess.key
        )
        const info = await commonReq.createJDProcess({

        })
    }
}

module.exports = {
    getLatestModifiedProcess,
    saveProcess,
    correctStrFieldToJson,
    getProcurementProcessStatistics,
    getProcessIdsData,
    getProcessIdsTmpData,
    getProcessMergeIdsData,
    getProcessByProcessInstanceId,
    getDevelopmentProcessTotal,
    getDevelopmentProcessList,
    createDevelopmentProcess
}
