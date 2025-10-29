const processRepo = require("@/repository/processRepo")
const userRepo = require("@/repository/userRepo")
const processConst = require('@/const/processConst')
const { v4 } = require('uuid')
const developmentProcessesRepo = require("@/repository/process/developmentProcessRepo")
const actReProcdefRepo = require("@/repository/bpm/actReProcdefRepo")
const commonReq = require('@/core/bpmReq/commonReq')
const credentialsReq = require("@/core/dingDingReq/credentialsReq")
const departmentService = require('./departmentService')
const systemUsersRepo = require("@/repository/bpm/systemUsersRepo")
const processesRepo = require("@/repository/process/processesRepo")
const processTasksRepo = require("@/repository/process/processTasksRepo")
const moment = require('moment')
const developmentTotalService = require('@/service/process/developmentTotalService')

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
    return await developmentTotalService.getDevelopmentProcessTotal(type, startDate, endDate)
}

const getDevelopmentProcessList = async (type, column, startDate, endDate) => {

    return {
        columns: processConst.defaultColumns,
        data: []
    }
}

const robotStartProcess = async (name, key, variables) => {
    let processDefinitionId = await actReProcdefRepo.getProcessDefinitionId(name, key)
    let token = await credentialsReq.getBpmgAccessToken()
    commonReq.createJDProcess(269, processDefinitionId, variables, token.data.accessToken)
}

const createDevelopmentProcess = async (params, dingding_id) => {
    const user = await userRepo.getUserWithDeptByDingdingUserId(dingding_id)
    let process_status = null, jd_process_status = null, 
        check = false, analysis = false, jdAnalysis = false,
        checkVarables = {}, analysisVarables = {}, jdAnalysisVarables = {}
    switch(params.type) {
        case processConst.typeList.SUPPLIER: 
            process_status = processConst.statusList.DEVELOPMENT_REVIEW
            jd_process_status = processConst.statusList.DEVELOPMENT_REVIEW
            params['is_jd'] = processConst.jdStatusList.FALSE
            check = true
            checkVarables = JSON.parse(JSON.stringify(processConst.developCheckProcess.template.SUPPLIER))
            break
        case processConst.typeList.OPERATOR:
            check = true
            params['project'] = departmentService.getProjectInfo(user.dept_name)
            if (deptName.indexOf('京东') != -1) {
                jd_process_status = processConst.statusList.DEVELOPMENT_REVIEW
                params['is_jd'] = processConst.jdStatusList.TRUE
            } else {
                process_status = processConst.statusList.DEVELOPMENT_REVIEW
                params['is_jd'] = processConst.jdStatusList.FALSE
            }
            checkVarables = JSON.parse(JSON.stringify(processConst.developCheckProcess.template.OPERATOR))
            break
        case processConst.typeList.IP:
            if (params.develop_type == '京东专供') {
                jd_process_status = processConst.statusList.ANALYSIS
                jdAnalysis = true
                jdAnalysisVarables = JSON.parse(JSON.stringify(processConst.jdAnalysisProcess.template.IP))
            } else if (['拼多多专供', '天猫专供'].includes(params.develop_type)) {
                process_status = processConst.statusList.ANALYSIS
                analysis =  true
                analysisVarables = JSON.parse(JSON.stringify(processConst.analysisProcess.template.IP))
            } else {
                process_status = processConst.statusList.ANALYSIS
                analysis = true
                analysisVarables = JSON.parse(JSON.stringify(processConst.analysisProcess.template.IP))
            }
            break
        case processConst.typeList.SELF:
            process_status = processConst.statusList.ANALYSIS
            jd_process_status = processConst.statusList.ANALYSIS
            jdAnalysis = true
            jdAnalysisVarables = JSON.parse(JSON.stringify(processConst.jdAnalysisProcess.template.SELF))
            analysis = true
            analysisVarables = JSON.parse(JSON.stringify(processConst.analysisProcess.template.SELF))
            if (params.dept == '运营') 
                params['project'] = departmentService.getProjectInfo(user.dept_name)
            break
        default:
    }
    const uid = v4()
    params.categories = params.categories ? JSON.stringify(params.categories) : null
    params.image = params.image ? JSON.stringify(params.image) : null
    params.product_info = params.product_info ? JSON.stringify(params.product_info) : null
    params.analysis = params.analysis ? JSON.stringify(params.analysis) : null
    let result = await developmentProcessesRepo.insert([
        uid, user.nickname, user.dept_name, params.type, params.name, params.categories, 
        params.seasons, params.related, params.image, params.brief_name, params.purchase_type, 
        params.supplier, params.supplier_type, params.product_info, params.product_type, 
        params.patent_belongs, params.patent_type, params.sale_purpose, params.analysis, 
        params.develop_type, params.analysis_name, params.project_type, params.design_type, 
        params.exploitation_features, params.core_reasons, params.scheduler_arrived_time, 
        params.scheduler_confirm_time, params.is_self, process_status, jd_process_status
    ])
    params['uid'] = uid
    params['link'] = 'https://bi.pakchoice.cn/bi/#/process/development/detail?uid=' + uid
    params['start_time'] = moment().format('YYYY-MM-DD')
    let starter = await await systemUsersRepo.getID(user.nickname)
    if (starter?.length) params['starter'] = starter[0].id
    if (result) {
        if (check) {
            let variables = {}
            for (let i = 0; i < checkVarables.length; i++) {
                variables[checkVarables[i].key] = checkVarables[i].type == 'array' ? 
                    [params[checkVarables[i].name]] : params[checkVarables[i].name]
            }
            robotStartProcess(processConst.developCheckProcess.name, processConst.developCheckProcess.key, variables)
        }
        if (analysis) {
            let variables = {}
            for (let i = 0; i < analysisVarables.length; i++) {
                variables[analysisVarables[i].key] = analysisVarables[i].type == 'array' ? 
                    [params[analysisVarables[i].name]] : params[analysisVarables[i].name]
            }
            robotStartProcess(processConst.analysisProcess.name, processConst.analysisProcess.key, variables)
        }
        if (jdAnalysis) {
            let variables = {}
            for (let i = 0; i < jdAnalysisVarables.length; i++) {
                variables[jdAnalysisVarables[i].key] = jdAnalysisVarables[i].type == 'array' ? 
                    [params[jdAnalysisVarables[i].name]] : params[jdAnalysisVarables[i].name]
            }
            robotStartProcess(processConst.jdAnalysisProcess.name, processConst.jdAnalysisProcess.key, variables)
        }
    }
}

const updateDevelopmetProcess = async () => {
    //get total running process
    let process = await developmentProcessesRepo.getRunningProcess()
    for (let i = 0; i < process.length; i++) {
        if (!process[i].status) {
            if (process[i].status.indexOf(processConst.statusList.DEVELOPMENT_CHECK) != -1) {

            }
            if (process[i].status.indexOf(processConst.statusList.SAMPLE) != -1) {
                
            }
            if (process[i].status.indexOf(processConst.statusList.ANALYSIS) != -1) {
                //check type
                let instance = await processesRepo.getProcessByUid(
                    process[i].uid, 
                    processConst.analysisProcess.key)
                if (instance?.length) {
                    if (process[i].type == processConst.typeList.IP && 
                        !['拼多多专供', '天猫专供'].includes(process[i].develop_type)) {
                        // 非京东分析负责人审核通过触发京东
                        let tasks = await processTasksRepo.getSuccessTasksByProcessIdAndTitle(
                            instance[0].process_id,
                            '事业一部负责人审核","事业二部负责人审核","事业三部负责人审核'
                        )
                        let jdInstance = await processesRepo.getProcessByUid(
                            process[i].uid,
                            processConst.jdAnalysisProcess.key)
                        if (tasks?.length && !jdInstance.length) {                            
                            let jdAnalysisVarables = JSON.parse(JSON.stringify(processConst.jdAnalysisProcess.template.IP))
                            let variables = {}
                            variables['link'] = 'https://bi.pakchoice.cn/bi/#/process/development/detail?uid=' + process[i].uid
                            variables['start_time'] = moment(process[i].create_time).format('YYYY-MM-DD')
                            for (let i = 0; i < jdAnalysisVarables.length; i++) {
                                variables[jdAnalysisVarables[i].key] = jdAnalysisVarables[i].type == 'array' ? 
                                    [process[i][jdAnalysisVarables[i].name]] : process[i][jdAnalysisVarables[i].name]
                            }
                            robotStartProcess(processConst.jdAnalysisProcess.name, processConst.jdAnalysisProcess.key, variables)
                        }
                    } else if (instance[0].status == 2) {
                        if ([processConst.typeList.IP, processConst.typeList.SELF].includes(process[i].type)) {
                            let developCheckInstance = await processesRepo.getProcessByUid(
                                process[i].uid, 
                                processConst.developCheckProcess.key)
                            if (!developCheckInstance?.length) {
                                let developCheckVarables = JSON.parse(JSON.stringify(processConst.developCheckProcess.template.IP))
                                let variables = {}
                                variables['link'] = 'https://bi.pakchoice.cn/bi/#/process/development/detail?uid=' + process[i].uid
                                variables['start_time'] = moment(process[i].create_time).format('YYYY-MM-DD')
                                variables['is_jd'] = processConst.jdStatusList.FALSE
                                for (let i = 0; i < developCheckVarables.length; i++) {
                                    variables[developCheckVarables[i].key] = developCheckVarables[i].type == 'array' ? 
                                        [process[i][developCheckVarables[i].name]] : process[i][developCheckVarables[i].name]
                                }
                                robotStartProcess(processConst.developCheckProcess.name, processConst.developCheckProcess.key, variables)
                            }
                        } else if (process[i].type == processConst.typeList.SUPPLIER) {
                            let reviewInstance = await processesRepo.getProcessByUid(
                                process[i].uid, 
                                processConst.reviewProcess.key)
                            if (!reviewInstance?.length) {
                                let variables = {}
                            }
                        }
                    } else if (instance[0].status == 3) {
                        developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid)
                    }
                } else logger.error(`分析流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.SAMPLE_CHECK) != -1) {
                
            }
            if (process[i].status.indexOf(processConst.statusList.REVIEW) != -1) {
                
            }
            if (process[i].status.indexOf(processConst.statusList.DESIGN_PROPOSAL) != -1) {
                
            }
            if (process[i].status.indexOf(processConst.statusList.VISION_DESIGN) != -1) {
                
            }
            if (process[i].status.indexOf(processConst.statusList.PURCHASE) != -1) {
                
            }
            if (process[i].status.indexOf(processConst.statusList.FIRST_SHELF) != -1) {
                
            }
            if (process[i].status.indexOf(processConst.statusList.SECOND_SHELF) != -1) {
                
            }
            if (process[i].status.indexOf(processConst.statusList.THIRD_SHELF) != -1) {
                
            }
        }
        if (!process[i].jd_status) {

        }
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
    createDevelopmentProcess,
    updateDevelopmetProcess
}