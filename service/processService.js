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
const processInfoRepo = require("@/repository/process/processInfoRepo")
const developmentListService = require('@/service/process/developmentListService')

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

const getDevelopmentProcessList = async (type, field, startDate, endDate) => {
    return await developmentListService.getDevelopmentProcessList(type, field, startDate, endDate)
}

const robotStartProcess = async (name, key, variables) => {
    let processDefinitionId = await actReProcdefRepo.getProcessDefinitionId(name, key)
    let token = await credentialsReq.getBpmgAccessToken()
    let response = commonReq.createJDProcess(269, processDefinitionId, variables, token.data.accessToken)
    if (response.code != 0) logger.error(`触发${name}失败: ${JSON.stringify(variables)}`)
}

const createDevelopmentProcess = async (params, dingding_id) => {
    const user = await userRepo.getUserWithDeptByDingdingUserId(dingding_id)
    let process_status = null, jd_process_status = null, 
        check = false, analysis = false, jdAnalysis = false,
        checkVariables = {}, analysisVariables = {}, jdAnalysisVariables = {}
    switch(params.type) {
        case processConst.typeList.SUPPLIER: 
            process_status = processConst.statusList.DEVELOPMENT_REVIEW
            jd_process_status = processConst.statusList.DEVELOPMENT_REVIEW
            params['is_jd'] = processConst.jdStatusList.FALSE
            check = true
            checkVariables = JSON.parse(JSON.stringify(processConst.developCheckProcess.template.SUPPLIER))
            break
        case processConst.typeList.OPERATOR:
            check = true
            params['project'] = departmentService.getProjectInfo(user.dept_name)
            if (user.dept_name.indexOf('京东') != -1) {
                jd_process_status = processConst.statusList.DEVELOPMENT_REVIEW
                params['is_jd'] = processConst.jdStatusList.TRUE
            } else {
                process_status = processConst.statusList.DEVELOPMENT_REVIEW
                params['is_jd'] = processConst.jdStatusList.FALSE
            }
            checkVariables = JSON.parse(JSON.stringify(processConst.developCheckProcess.template.OPERATOR))
            break
        case processConst.typeList.IP:
            if (params.develop_type == '京东专供') {
                jd_process_status = processConst.statusList.ANALYSIS
                jdAnalysis = true
                jdAnalysisVariables = JSON.parse(JSON.stringify(processConst.jdAnalysisProcess.template.IP))
            } else if (['拼多多专供', '天猫专供'].includes(params.develop_type)) {
                process_status = processConst.statusList.ANALYSIS
                analysis =  true
                analysisVariables = JSON.parse(JSON.stringify(processConst.analysisProcess.template.IP))
            } else {
                process_status = processConst.statusList.ANALYSIS
                analysis = true
                analysisVariables = JSON.parse(JSON.stringify(processConst.analysisProcess.template.IP))
            }
            break
        case processConst.typeList.SELF:
            process_status = processConst.statusList.ANALYSIS
            jd_process_status = processConst.statusList.ANALYSIS
            jdAnalysis = true
            jdAnalysisVariables = JSON.parse(JSON.stringify(processConst.jdAnalysisProcess.template.SELF))
            analysis = true
            analysisVariables = JSON.parse(JSON.stringify(processConst.analysisProcess.template.SELF))
            if (params.dept == '运营') 
                params['project'] = departmentService.getProjectInfo(user.dept_name)
            break
        default:
    }
    const uid = v4()
    params.categories = params.categories ? JSON.stringify(params.categories) : null  
    params.image = params.image ? JSON.stringify(params.image.replace(':9003/', ':9000/').replace('https:', 'http:').replace('//minio.','//bpm.')) : null
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
    params['link'] = processConst.previousUrl + uid
    params['start_time'] = moment().format('YYYY-MM-DD')
    let starter = await await systemUsersRepo.getID(user.nickname)
    if (starter?.length) params['starter'] = starter[0].id
    if (result) {
        if (check) {
            let variables = {}
            for (let i = 0; i < checkVariables.length; i++) {
                variables[checkVariables[i].key] = checkVariables[i].type == 'array' ? 
                    [params[checkVariables[i].name]] : params[checkVariables[i].name]
            }
            robotStartProcess(processConst.developCheckProcess.name, processConst.developCheckProcess.key, variables)
        }
        if (analysis) {
            let variables = {}
            for (let i = 0; i < analysisVariables.length; i++) {
                variables[analysisVariables[i].key] = analysisVariables[i].type == 'array' ? 
                    [params[analysisVariables[i].name]] : params[analysisVariables[i].name]
            }
            robotStartProcess(processConst.analysisProcess.name, processConst.analysisProcess.key, variables)
        }
        if (jdAnalysis) {
            let variables = {}
            for (let i = 0; i < jdAnalysisVariables.length; i++) {
                variables[jdAnalysisVariables[i].key] = jdAnalysisVariables[i].type == 'array' ? 
                    [params[jdAnalysisVariables[i].name]] : params[jdAnalysisVariables[i].name]
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
            let process_ids = [], process_status = []
            if (process[i].status.indexOf(processConst.statusList.DEVELOPMENT_CHECK) != -1) {
                let instance = await processesRepo.getProcessByUidAndColumn(
                    process[i].uid, 
                    processConst.developCheckProcess.key, 
                    processConst.developCheckProcess.column.is_jd,
                    processConst.jdStatusList.FALSE)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        if ([processConst.typeList.IP, processConst.typeList.SELF].includes(process[i].type)) {
                            // IP、自研触发寄样
                            let sampleInstance = await processesRepo.getProcessByUidAndColumn(
                                process[i].uid, 
                                processConst.sampleProcess.key,
                                processConst.sampleProcess.template.is_jd,
                                processConst.jdStatusList.FALSE)
                            if (!sampleInstance?.length) {
                                let variables = {}, user_id, developer_id
                                let starter = await systemUsersRepo.getID(process[i].starter)
                                if (starter?.length) user_id = starter[0].id
                                if (process[i].developer) {
                                    let developer = await systemUsersRepo.getID(process[i].developer)
                                    if (developer?.length) developer_id = developer[0].id
                                } else {
                                    // 更新开发人
                                    let user = await processInfoRepo.getByProcessIdAndField(
                                        instance[0].process_id, processConst.developCheckProcess.column.developer.DEFAULT
                                    )
                                    process[i].developer = user.content
                                    developmentProcessesRepo.updateColumnByUid(process[i].uid, 'developer', user.content)
                                    let developer = await systemUsersRepo.getID(user.content)
                                    if (developer?.length) developer_id = developer[0].id
                                }
                                variables[processConst.sampleProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.sampleProcess.template.uid] = process[i].uid
                                variables[processConst.sampleProcess.template.is_jd] = processConst.jdStatusList.FALSE
                                variables[processConst.sampleProcess.template.starter] = user_id
                                variables[processConst.sampleProcess.template.type] = process[i].type
                                if (process[i].type == processConst.typeList.IP) 
                                    variables[processConst.sampleProcess.template.project] = process[i].project
                                variables[processConst.sampleProcess.template.product_info] = JSON.parse(process[i].product_info)
                                variables[processConst.sampleProcess.template.developer] = developer_id
                                robotStartProcess(processConst.sampleProcess.name, processConst.sampleProcess.key, variables)
                                process_status.push(processConst.statusList.SAMPLE)
                            }
                        } else if (process[i].type == processConst.typeList.SUPPLIER) {
                            // 正推触发非京东分析，寄样
                            let analysisInstance = await processesRepo.getProcessByUid(
                                process[i].uid, 
                                processConst.analysisProcess.key)
                            if (!analysisInstance?.length) {
                                let analysisVariables = JSON.parse(JSON.stringify(processConst.analysisProcess.template.SUPPLIER))
                                let variables = {}
                                for (let j = 0; j < analysisVariables.length; j++) {
                                    variables[analysisVariables[j].key] = analysisVariables[j].type == 'array' ? 
                                        [process[i][analysisVariables[j].name]] : process[i][analysisVariables[j].name]
                                }
                                robotStartProcess(processConst.analysisProcess.name, processConst.analysisProcess.key, variables)
                                process_status.push(processConst.statusList.ANALYSIS)
                            }
                            let sampleInstance = await processesRepo.getProcessByUidAndColumn(
                                process[i].uid, 
                                processConst.sampleProcess.key,
                                processConst.sampleProcess.template.is_jd,
                                processConst.jdStatusList.FALSE)
                            if (!sampleInstance?.length) {
                                let variables = {}, user_id, developer_id
                                let starter = await systemUsersRepo.getID(process[i].starter)
                                if (starter?.length) user_id = starter[0].id
                                if (process[i].developer) {
                                    let developer = await systemUsersRepo.getID(process[i].developer)
                                    if (developer?.length) developer_id = developer[0].id
                                } else {
                                    // 更新开发人
                                    let user = await processInfoRepo.getByProcessIdAndField(
                                        instance[0].process_id, processConst.developCheckProcess.column.developer.DEFAULT
                                    )
                                    process[i].developer = user.content
                                    developmentProcessesRepo.updateColumnByUid(process[i].uid, 'developer', user.content)
                                    let developer = await systemUsersRepo.getID(user.content)
                                    if (developer?.length) developer_id = developer[0].id
                                }
                                variables[processConst.sampleProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.sampleProcess.template.uid] = process[i].uid
                                variables[processConst.sampleProcess.template.is_jd] = processConst.jdStatusList.FALSE
                                variables[processConst.sampleProcess.template.starter] = user_id
                                variables[processConst.sampleProcess.template.type] = process[i].type
                                variables[processConst.sampleProcess.template.developer] = developer_id
                                robotStartProcess(processConst.sampleProcess.name, processConst.sampleProcess.key, variables)
                                process_status.push(processConst.statusList.SAMPLE)
                            }
                        } else {
                            // 反推触发非京东分析
                            if (!process[i].developer) {
                                let user
                                for (let j = 0; j < processConst.developCheckProcess.column.developer.OTHER.length; j++) {
                                    user = await processInfoRepo.getByProcessIdAndField(
                                        instance[0].process_id, processConst.developCheckProcess.column.developer.OTHER[j])
                                    if (user) break
                                }
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'developer', user.content)
                            }
                            let analysisInstance = await processesRepo.getProcessByUid(
                                process[i].uid, 
                                processConst.analysisProcess.key)
                            if (!analysisInstance?.length) {
                                let analysisVariables = JSON.parse(JSON.stringify(processConst.analysisProcess.template.OPERATOR))
                                let variables = {}
                                for (let j = 0; j < analysisVariables.length; j++) {
                                    variables[analysisVariables[j].key] = analysisVariables[j].type == 'array' ? 
                                        [process[i][analysisVariables[j].name]] : process[i][analysisVariables[j].name]
                                }
                                robotStartProcess(processConst.analysisProcess.name, processConst.analysisProcess.key, variables)
                                process_status.push(processConst.statusList.ANALYSIS)
                            }
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.DEVELOPMENT_CHECK)
                    }
                } else logger.error(`开发审核流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.SAMPLE) != -1) {
                let instance = await processesRepo.getProcessByUidAndColumn(
                    process[i].uid, 
                    processConst.sampleProcess.key,
                    processConst.sampleProcess.template.is_jd,
                    processConst.jdStatusList.FALSE)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        // 更新样品图片、草图
                        if (!process[i].sample_image) {
                            let image = await processInfoRepo.getByProcessIdAndField(
                                instance[0].process_id, processConst.sampleProcess.column.sample_image)
                            if (image) developmentProcessesRepo.updateColumnByUid(process[i].uid, 'sample_image', image.content)
                        }
                        if (!process[i].design_image) {
                            let image = await processInfoRepo.getByProcessIdAndField(
                                instance[0].process_id, processConst.sampleProcess.column.design_image)
                            if (image) developmentProcessesRepo.updateColumnByUid(process[i].uid, 'design_image', image.content)
                        }
                        if (process[i].type == processConst.typeList.OPERATOR) {                            
                            // 反推寄样通过触发样品选中
                            let analysisInstance = await processesRepo.getProcessByUid(
                                process[i].uid, 
                                processConst.analysisProcess.key)
                            if (analysisInstance?.length) {
                                let first = await processInfoRepo.getByProcessIdAndField(
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.first_operator)
                                let second = await processInfoRepo.getByProcessIdAndField(
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.second_operator)
                                let third = await processInfoRepo.getByProcessIdAndField(
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.third_operator)
                                let variables = {}
                                variables[processConst.sampleCheckProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.sampleCheckProcess.template.uid] = process[i].uid
                                variables[processConst.sampleCheckProcess.template.is_jd] = processConst.jdStatusList.FALSE
                                variables[processConst.sampleCheckProcess.template.first_operator] = first?.content
                                variables[processConst.sampleCheckProcess.template.second_operator] = second?.content
                                variables[processConst.sampleCheckProcess.template.third_operator] = third?.content
                                robotStartProcess(processConst.sampleCheckProcess.name, processConst.sampleCheckProcess.key, variables)
                                process_status.push(processConst.statusList.SAMPLE_CHECK)
                            }
                        } else if ([processConst.typeList.IP, processConst.typeList.SELF].includes(process[i].type)) {
                            // IP,自研审核通过触发企划审核
                            let reviewVarables = JSON.parse(JSON.stringify(processConst.reviewProcess.template.SUPPLIER))
                            let variables = {}
                            process['link'] = processConst.previousUrl + process[i].uid
                            process['start_time'] = moment(process[i].create_time).format('YYYY-MM-DD')
                            process['is_jd'] = processConst.jdStatusList.FALSE
                            for (let j = 0; j < reviewVarables.length; j++) {
                                variables[reviewVarables[j].key] = reviewVarables[j].type == 'array' ? 
                                    [process[i][reviewVarables[j].name]] : process[i][reviewVarables[j].name]
                            }
                            robotStartProcess(processConst.reviewProcess.name, processConst.reviewProcess.key, variables)
                            process_status.push(processConst.statusList.REVIEW)
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.SAMPLE)
                    }
                } else logger.error(`寄样流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.ANALYSIS) != -1) {
                let instance = await processesRepo.getProcessByUid(
                    process[i].uid, 
                    processConst.analysisProcess.key)
                if (instance?.length) {
                    if (process[i].type == processConst.typeList.IP && 
                        !['拼多多专供', '天猫专供'].includes(process[i].develop_type) && 
                        instance[0].status == 1) {
                        // 非京东分析负责人审核通过触发京东分析
                        let tasks = await processTasksRepo.getSuccessTasksByProcessIdAndTitle(
                            instance[0].process_id,
                            '事业一部负责人审核","事业二部负责人审核","事业三部负责人审核')
                        let jdInstance = await processesRepo.getProcessByUid(
                            process[i].uid,
                            processConst.jdAnalysisProcess.key)
                        if (tasks?.length && !jdInstance.length) {                            
                            let jdAnalysisVariables = JSON.parse(JSON.stringify(processConst.jdAnalysisProcess.template.IP))
                            let variables = {}
                            process['link'] = processConst.previousUrl + process[i].uid
                            process['start_time'] = moment(process[i].create_time).format('YYYY-MM-DD')
                            for (let j = 0; j < jdAnalysisVariables.length; j++) {
                                variables[jdAnalysisVariables[j].key] = jdAnalysisVariables[j].type == 'array' ? 
                                    [process[i][jdAnalysisVariables[j].name]] : process[i][jdAnalysisVariables[j].name]
                            }
                            robotStartProcess(processConst.jdAnalysisProcess.name, processConst.jdAnalysisProcess.key, variables)
                            process_status.push(processConst.statusList.ANALYSIS)
                        }
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.ANALYSIS)
                    } else if (instance[0].status == 2) {
                        if ([processConst.typeList.IP, processConst.typeList.SELF].includes(process[i].type)) {
                            // IP、自研非京东分析通过触发开发审核，更新spu,sku_code
                            let developCheckInstance = await processesRepo.getProcessByUidAndColumn(
                                process[i].uid, 
                                processConst.developCheckProcess.key,
                                processConst.developCheckProcess.column.is_jd,
                                processConst.jdStatusList.FALSE)
                            if (!developCheckInstance?.length) {
                                let developCheckVarables = process[i].type == processConst.typeList.IP ? 
                                    JSON.parse(JSON.stringify(processConst.developCheckProcess.template.IP)) : 
                                    JSON.parse(JSON.stringify(processConst.developCheckProcess.template.SELF))
                                let variables = {}
                                process['link'] = processConst.previousUrl + process[i].uid
                                process['start_time'] = moment(process[i].create_time).format('YYYY-MM-DD')
                                process['is_jd'] = processConst.jdStatusList.FALSE
                                for (let j = 0; j < developCheckVarables.length; j++) {
                                    variables[developCheckVarables[j].key] = developCheckVarables[j].type == 'array' ? 
                                        [process[i][developCheckVarables[j].name]] : process[i][developCheckVarables[j].name]
                                }
                                robotStartProcess(processConst.developCheckProcess.name, processConst.developCheckProcess.key, variables)
                                process_status.push(processConst.statusList.DEVELOPMENT_CHECK)
                                let spu = await processInfoRepo.getByProcessIdAndField(
                                    instance[0].process_id, processConst.analysisProcess.column.spu)
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'spu', spu.content)
                                let sku_code = await processInfoRepo.getByProcessIdAndField(
                                    instance[0].process_id, processConst.analysisProcess.column.sku_code)
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'sku_code', sku_code.content)
                            }
                        } else if (process[i].type == processConst.typeList.SUPPLIER) {
                            // 正推非京东分析选中触发企划审核，更新spu,sku_code
                            let reviewInstance = await processesRepo.getProcessByUidAndColumn(
                                process[i].uid, 
                                processConst.reviewProcess.key,
                                processConst.reviewProcess.column.is_jd,
                                processConst.jdStatusList.FALSE)
                            if (!reviewInstance?.length) {
                                let is_select = false
                                let first = await processInfoRepo.getByProcessIdAndField(
                                    instance[0].process_id, processConst.analysisProcess.column.first_select)
                                if (first?.content == processConst.analysisStatusList.TRUE) is_select = true
                                else {
                                    let second = await processInfoRepo.getByProcessIdAndField(
                                        instance[0].process_id, processConst.analysisProcess.column.second_select)
                                    if (second?.content == processConst.analysisStatusList.TRUE) is_select = true
                                    else {
                                        let third = await processInfoRepo.getByProcessIdAndField(
                                            instance[0].process_id, processConst.analysisProcess.column.third_select)
                                        if (third?.content == processConst.analysisStatusList.TRUE) is_select = true
                                    }
                                }
                                if (is_select) {
                                    let reviewVarables = JSON.parse(JSON.stringify(processConst.reviewProcess.template.SUPPLIER))
                                    let variables = {}
                                    process['link'] = processConst.previousUrl + process[i].uid
                                    process['start_time'] = moment(process[i].create_time).format('YYYY-MM-DD')
                                    process['is_jd'] = processConst.jdStatusList.FALSE
                                    for (let j = 0; j < reviewVarables.length; j++) {
                                        variables[reviewVarables[j].key] = reviewVarables[j].type == 'array' ? 
                                            [process[i][reviewVarables[j].name]] : process[i][reviewVarables[j].name]
                                    }
                                    robotStartProcess(processConst.reviewProcess.name, processConst.reviewProcess.key, variables)
                                    process_status.push(processConst.statusList.REVIEW)
                                    let spu = await processInfoRepo.getByProcessIdAndField(
                                        instance[0].process_id, processConst.analysisProcess.column.spu)
                                    developmentProcessesRepo.updateColumnByUid(process[i].uid, 'spu', spu.content)
                                    let sku_code = await processInfoRepo.getByProcessIdAndField(
                                        instance[0].process_id, processConst.analysisProcess.column.sku_code)
                                    developmentProcessesRepo.updateColumnByUid(process[i].uid, 'sku_code', sku_code.content)
                                }
                            }
                        } else {
                            // 反推非京东分析通过触发寄样
                            let sampleInstance = await processesRepo.getProcessByUidAndColumn(
                                process[i].uid, 
                                processConst.sampleProcess.key,
                                processConst.sampleProcess.template.is_jd,
                                processConst.jdStatusList.FALSE)
                            if (!sampleInstance?.length) {
                                let variables = {}, user_id, developer_id
                                let starter = await systemUsersRepo.getID(process[i].starter)
                                if (starter?.length) user_id = starter[0].id
                                let developer = await systemUsersRepo.getID(process[i].developer)
                                if (developer?.length) developer_id = developer[0].id
                                variables[processConst.sampleProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.sampleProcess.template.uid] = process[i].uid
                                variables[processConst.sampleProcess.template.is_jd] = processConst.jdStatusList.FALSE
                                variables[processConst.sampleProcess.template.starter] = user_id
                                variables[processConst.sampleProcess.template.type] = process[i].type
                                variables[processConst.sampleProcess.template.developer] = developer_id
                                robotStartProcess(processConst.sampleProcess.name, processConst.sampleProcess.key, variables)
                                process_status.push(processConst.statusList.SAMPLE)
                            }
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.ANALYSIS)
                    }
                } else logger.error(`非京东分析流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.SAMPLE_CHECK) != -1) {
                // 反推样品选中触发企划审核，更新spu,sku_code
                let instance = await processesRepo.getProcessByUidAndColumn(
                    process[i].uid, 
                    processConst.sampleCheckProcess.key,
                    processConst.sampleCheckProcess.template.is_jd,
                    processConst.jdStatusList.FALSE)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        let reviewInstance = await processesRepo.getProcessByUidAndColumn(
                            process[i].uid, 
                            processConst.reviewProcess.key,
                            processConst.reviewProcess.column.is_jd,
                            processConst.jdStatusList.FALSE)
                        if (!reviewInstance?.length) {
                            let is_select = false
                            let analysisInstance = await processesRepo.getProcessByUid(
                                process[i].uid, 
                                processConst.analysisProcess.key)
                            if (analysisInstance?.length) {
                                let first = await processInfoRepo.getByProcessIdAndField(
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.first_select)
                                if (first?.content == processConst.analysisStatusList.TRUE) is_select = true
                                else {
                                    let second = await processInfoRepo.getByProcessIdAndField(
                                        analysisInstance[0].process_id, processConst.analysisProcess.column.second_select)
                                    if (second?.content == processConst.analysisStatusList.TRUE) is_select = true
                                    else {
                                        let third = await processInfoRepo.getByProcessIdAndField(
                                            analysisInstance[0].process_id, processConst.analysisProcess.column.third_select)
                                        if (third?.content == processConst.analysisStatusList.TRUE) is_select = true
                                    }
                                }
                            }
                            if (is_select) {
                                let reviewVarables = JSON.parse(JSON.stringify(processConst.reviewProcess.template.SUPPLIER))
                                let variables = {}
                                process['link'] = processConst.previousUrl + process[i].uid
                                process['start_time'] = moment(process[i].create_time).format('YYYY-MM-DD')
                                process['is_jd'] = processConst.jdStatusList.FALSE
                                for (let j = 0; j < reviewVarables.length; j++) {
                                    variables[reviewVarables[j].key] = reviewVarables[j].type == 'array' ? 
                                        [process[i][reviewVarables[j].name]] : process[i][reviewVarables[j].name]
                                }
                                robotStartProcess(processConst.reviewProcess.name, processConst.reviewProcess.key, variables)
                                process_status.push(processConst.statusList.REVIEW)
                                let analysisInstance = await processesRepo.getProcessByUid(
                                    process[i].uid, 
                                    processConst.analysisProcess.key)
                                let spu = await processInfoRepo.getByProcessIdAndField(
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.spu)
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'spu', spu.content)
                                let sku_code = await processInfoRepo.getByProcessIdAndField(
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.sku_code)
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'sku_code', sku_code.content)
                            }
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.SAMPLE_CHECK)
                    }
                } else logger.error(`样品选中流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.REVIEW) != -1) {
                // 更新选中平台，事业1部是否选中，事业2部是否选中，事业3部是否选中，非京东是否选中，采购方式, 视觉类型
                let instance = await processesRepo.getProcessByUidAndColumn(
                    process[i].uid, 
                    processConst.reviewProcess.key,
                    processConst.reviewProcess.column.is_jd,
                    processConst.jdStatusList.FALSE)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        let select = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.reviewProcess.column.select_project)                        
                        let first_select = processConst.analysisStatusList.FALSE, 
                            second_select = processConst.analysisStatusList.FALSE, 
                            third_select = processConst.analysisStatusList.FALSE,
                            is_select = processConst.analysisStatusList.FALSE
                        if (select) {
                            if (select.content.indexOf('拼多多') != -1 || 
                                select.content.indexOf('天猫超市') != -1 || 
                                select.content.indexOf('Coupang') != -1) {
                                first_select = processConst.analysisStatusList.TRUE
                            }
                            if (select.content.indexOf('抖音') != -1 || 
                                select.content.indexOf('快手') != -1 || 
                                select.content.indexOf('得物') != -1 || 
                                select.content.indexOf('唯品会') != -1 || 
                                select.content.indexOf('1688') != -1) {
                                second_select = processConst.analysisStatusList.TRUE
                            }
                            if (select.content.indexOf('天猫') != -1 || 
                                select.content.indexOf('淘工厂') != -1 || 
                                select.content.indexOf('小红书') != -1) {
                                third_select = processConst.analysisStatusList.TRUE
                            }
                            if ([first_select, second_select, third_select].includes(processConst.analysisStatusList.TRUE)) is_select = processConst.analysisStatusList.TRUE
                            developmentProcessesRepo.updateColumnByUid(
                                process[i].uid, 'is_select', is_select)
                            developmentProcessesRepo.updateColumnByUid(
                                process[i].uid, 'first_select', first_select)
                            developmentProcessesRepo.updateColumnByUid(
                                process[i].uid, 'second_select', second_select)
                            developmentProcessesRepo.updateColumnByUid(
                                process[i].uid, 'third_select', third_select)
                            developmentProcessesRepo.updateColumnByUid(
                                process[i].uid, 'select_project', select.content)
                        }
                        let purchase_type = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.reviewProcess.column.purchase_type)
                        if (purchase_type) developmentProcessesRepo.updateColumnByUid(
                                process[i].uid, 'order_type', purchase_type.content)
                        let vision_type = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.reviewProcess.column.vision_type)
                        if (vision_type) developmentProcessesRepo.updateColumnByUid(
                                process[i].uid, 'vision_type', vision_type.content)
                        // 触发爆款方案
                        let designProposalInstance = await processesRepo.getProcessByUidAndColumn(
                            process[i].uid, 
                            processConst.designProposalProcess.key,
                            processConst.designProposalProcess.template.is_jd,
                            processConst.jdStatusList.FALSE)
                        if (!designProposalInstance?.length) {
                            let division = await processInfoRepo.getByProcessIdAndField(
                                instance[0].process_id, processConst.reviewProcess.column.division)
                            let variables = {}
                            variables[processConst.designProposalProcess.template.link] = processConst.previousUrl + process[i].uid
                            variables[processConst.designProposalProcess.template.uid] = process[i].uid
                            variables[processConst.designProposalProcess.template.is_jd] = processConst.jdStatusList.FALSE
                            variables[processConst.designProposalProcess.template.name] = process[i].name
                            variables[processConst.designProposalProcess.template.division] = division?.content
                            variables[processConst.designProposalProcess.template.first_select] = first_select
                            variables[processConst.designProposalProcess.template.second_select] = second_select
                            variables[processConst.designProposalProcess.template.third_select] = third_select
                            robotStartProcess(processConst.designProposalProcess.name, processConst.designProposalProcess.key, variables)
                            process_status.push(processConst.statusList.DESIGN_PROPOSAL)
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.REVIEW)
                    }
                } else logger.error(`企划审核流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.DESIGN_PROPOSAL) != -1) {
                let instance = await processesRepo.getProcessByUidAndColumn(
                    process[i].uid, 
                    processConst.designProposalProcess.key,
                    processConst.designProposalProcess.template.is_jd,
                    processConst.jdStatusList.FALSE)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        // 更新爆款方案负责人，触发视觉流程，非京东订货流程
                        let operator = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.designProposalProcess.column.operator)
                        if (operator) developmentProcessesRepo.updateColumnByUid(
                                process[i].uid, 'operator', operator.content)
                        let link_type = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.designProposalProcess.column.link_type)
                        let visionDesignInstance = await processesRepo.getProcessByUidAndColumn(
                            process[i].uid, 
                            processConst.visionDesignProcess.key,
                            processConst.visionDesignProcess.template.is_jd,
                            processConst.jdStatusList.FALSE)
                        if (!visionDesignInstance?.length) {
                            let variables = {}
                            variables[processConst.designProposalProcess.template.link] = processConst.previousUrl + process[i].uid
                            variables[processConst.designProposalProcess.template.uid] = process[i].uid
                            variables[processConst.designProposalProcess.template.is_jd] = processConst.jdStatusList.FALSE
                            variables[processConst.designProposalProcess.template.name] = process[i].name
                            variables[processConst.designProposalProcess.template.vision_type] = process[i].vision_type
                            variables[processConst.designProposalProcess.template.project] = JSON.parse(process[i].select_project)                            
                            variables[processConst.designProposalProcess.template.link_type] = link_type?.content
                            variables[processConst.designProposalProcess.template.developer] = process[i].developer
                            variables[processConst.designProposalProcess.template.image] = JSON.parse(process[i].image)                            
                            if (process[i].vision_type != '非原创') {
                                variables[processConst.designProposalProcess.template.operator] = operator?.content
                                robotStartProcess(processConst.designProposalProcess.name, processConst.designProposalProcess.key, variables)
                                process_status.push(processConst.statusList.DESIGN_PROPOSAL)
                            } else { // 非原创事业部各自触发
                                let analysisInstance = await processesRepo.getProcessByUid(
                                    process[i].uid, 
                                    processConst.analysisProcess.key)
                                if (analysisInstance?.length) {
                                    if (process[i].first_select == processConst.analysisStatusList.TRUE) {
                                        let first = await processInfoRepo.getByProcessIdAndField(
                                            analysisInstance[0].process_id, processConst.analysisProcess.column.first_operator)
                                        variables[processConst.designProposalProcess.template.operator] = first?.content
                                        robotStartProcess(processConst.designProposalProcess.name, processConst.designProposalProcess.key, variables)
                                    }
                                    if (process[i].second_select == processConst.analysisStatusList.TRUE) {
                                        let second = await processInfoRepo.getByProcessIdAndField(
                                            analysisInstance[0].process_id, processConst.analysisProcess.column.second_operator)
                                        variables[processConst.designProposalProcess.template.operator] = second?.content
                                        robotStartProcess(processConst.designProposalProcess.name, processConst.designProposalProcess.key, variables)
                                    }
                                    if (process[i].third_select == processConst.analysisStatusList.TRUE) {
                                        let third = await processInfoRepo.getByProcessIdAndField(
                                            analysisInstance[0].process_id, processConst.analysisProcess.column.third_operator)
                                        variables[processConst.designProposalProcess.template.operator] = third?.content
                                        robotStartProcess(processConst.designProposalProcess.name, processConst.designProposalProcess.key, variables)
                                    }
                                    process_status.push(processConst.statusList.DESIGN_PROPOSAL)
                                }
                            }
                        }
                        let purchaseInstance = await processesRepo.getProcessByUid(
                            process[i].uid, 
                            processConst.purchaseProcess.key)
                        if (!purchaseInstance?.length) {
                            let variables = {}
                            variables[processConst.purchaseProcess.template.link] = processConst.previousUrl + process[i].uid
                            variables[processConst.purchaseProcess.template.uid] = process[i].uid
                            variables[processConst.purchaseProcess.template.type] = process[i].type
                            variables[processConst.purchaseProcess.template.purchase_type] = process[i].purchase_type
                            variables[processConst.purchaseProcess.template.developer] = process[i].developer
                            variables[processConst.purchaseProcess.template.first_select] = process[i].first_select
                            variables[processConst.purchaseProcess.template.second_select] = process[i].second_select
                            variables[processConst.purchaseProcess.template.third_select] = process[i].third_select
                            robotStartProcess(processConst.purchaseProcess.name, processConst.purchaseProcess.key, variables)
                            process_status.push(processConst.statusList.PURCHASE)
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.DESIGN_PROPOSAL)
                    }
                } else logger.error(`爆款流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.VISION_DESIGN) != -1) {
                let instance = await processesRepo.getProcessByUidAndColumn(
                    process[i].uid, 
                    processConst.visionDesignProcess.key,
                    processConst.visionDesignProcess.template.is_jd,
                    processConst.jdStatusList.FALSE)
                if (instance?.length) {
                    if ([2,3,4].includes(instance[0].status)) {
                        let purchaseInstance = await processesRepo.getFirstShelfProcess(
                            process[i].uid, 
                            processConst.purchaseProcess.key)
                        if (purchaseInstance?.length && purchaseInstance[0].status == 2) {
                            // 触发上架流程
                            let designProposalInstance = await processesRepo.getProcessByUidAndColumn(
                                process[i].uid, 
                                processConst.designProposalProcess.key,
                                processConst.designProposalProcess.template.is_jd,
                                processConst.jdStatusList.FALSE)
                            let link_type = await processInfoRepo.getByProcessIdAndField(
                                designProposalInstance[0].process_id, processConst.designProposalProcess.column.link_type)
                            if (process[i].first_select == processConst.analysisStatusList.TRUE) {
                                let project = []
                                if (process[i].select_project.indexOf('拼多多') != -1) project.push('拼多多')
                                if (process[i].select_project.indexOf('天猫超市') != -1) project.push('天猫超市')
                                if (process[i].select_project.indexOf('Coupang') != -1) project.push('Coupang')
                                let variables = {}
                                variables[processConst.shelfProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.shelfProcess.template.uid] = process[i].uid
                                variables[processConst.shelfProcess.template.project] = project
                                variables[processConst.shelfProcess.template.developer] = process[i].developer
                                variables[processConst.shelfProcess.template.link_type] = link_type?.content
                                robotStartProcess(processConst.shelfProcess.name, processConst.shelfProcess.key, variables)
                                process_status.push(processConst.statusList.FIRST_SHELF)
                            }
                            if (process[i].second_select == processConst.analysisStatusList.TRUE) {
                                let project = []
                                if (process[i].select_project.indexOf('抖音') != -1) project.push('抖音')
                                if (process[i].select_project.indexOf('快手') != -1) project.push('快手')
                                if (process[i].select_project.indexOf('得物') != -1) project.push('得物')
                                if (process[i].select_project.indexOf('唯品会') != -1) project.push('唯品会')
                                if (process[i].select_project.indexOf('1688') != -1) project.push('1688')
                                let variables = {}
                                variables[processConst.shelfProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.shelfProcess.template.uid] = process[i].uid
                                variables[processConst.shelfProcess.template.project] = project
                                variables[processConst.shelfProcess.template.developer] = process[i].developer
                                variables[processConst.shelfProcess.template.link_type] = link_type?.content
                                robotStartProcess(processConst.shelfProcess.name, processConst.shelfProcess.key, variables)
                                process_status.push(processConst.statusList.SECOND_SHELF)
                            }
                            if (process[i].third_select == processConst.analysisStatusList.TRUE) {
                                let project = []
                                if (process[i].select_project.indexOf('天猫') != -1) project.push('天猫')
                                if (process[i].select_project.indexOf('淘工厂') != -1) project.push('淘工厂')
                                if (process[i].select_project.indexOf('小红书') != -1) project.push('小红书')
                                let variables = {}
                                variables[processConst.shelfProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.shelfProcess.template.uid] = process[i].uid
                                variables[processConst.shelfProcess.template.project] = project
                                variables[processConst.shelfProcess.template.developer] = process[i].developer
                                variables[processConst.shelfProcess.template.link_type] = link_type?.content
                                robotStartProcess(processConst.shelfProcess.name, processConst.shelfProcess.key, variables)
                                process_status.push(processConst.statusList.THIRD_SHELF)
                            }
                        }
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.VISION_DESIGN)
                    }
                } else logger.error(`视觉流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.PURCHASE) != -1) {
                let instance = await processesRepo.getProcessByUid(
                    process[i].uid, 
                    processConst.purchaseProcess.key)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        let visionDesignInstance = await processesRepo.getProcessByUidAndColumn(
                            process[i].uid, 
                            processConst.visionDesignProcess.key,
                            processConst.visionDesignProcess.template.is_jd,
                            processConst.jdStatusList.FALSE)
                        // 更新订货数量
                        let order_num = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.purchaseProcess.column.order_num)
                        if (order_num) developmentProcessesRepo.updateColumnByUid(process[i].uid, 'order_num', order_num.content)
                        if (!visionDesignInstance?.length && [2,3,4].includes(visionDesignInstance[0].status)) {
                            // 触发上架流程
                            if (process[i].first_select == processConst.analysisStatusList.TRUE) {
                                let project = []
                                if (process[i].select_project.indexOf('拼多多') != -1) project.push('拼多多')
                                if (process[i].select_project.indexOf('天猫超市') != -1) project.push('天猫超市')
                                if (process[i].select_project.indexOf('Coupang') != -1) project.push('Coupang')
                                let variables = {}
                                variables[processConst.shelfProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.shelfProcess.template.uid] = process[i].uid
                                variables[processConst.shelfProcess.template.project] = project
                                variables[processConst.shelfProcess.template.developer] = process[i].developer
                                variables[processConst.shelfProcess.template.link_type] = process[i].link_type
                                robotStartProcess(processConst.shelfProcess.name, processConst.shelfProcess.key, variables)
                                process_status.push(processConst.statusList.FIRST_SHELF)
                            }
                            if (process[i].second_select == processConst.analysisStatusList.TRUE) {
                                let project = []
                                if (process[i].select_project.indexOf('抖音') != -1) project.push('抖音')
                                if (process[i].select_project.indexOf('快手') != -1) project.push('快手')
                                if (process[i].select_project.indexOf('得物') != -1) project.push('得物')
                                if (process[i].select_project.indexOf('唯品会') != -1) project.push('唯品会')
                                if (process[i].select_project.indexOf('1688') != -1) project.push('1688')
                                let variables = {}
                                variables[processConst.shelfProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.shelfProcess.template.uid] = process[i].uid
                                variables[processConst.shelfProcess.template.project] = project
                                variables[processConst.shelfProcess.template.developer] = process[i].developer
                                variables[processConst.shelfProcess.template.link_type] = process[i].link_type
                                robotStartProcess(processConst.shelfProcess.name, processConst.shelfProcess.key, variables)
                                process_status.push(processConst.statusList.SECOND_SHELF)
                            }
                            if (process[i].third_select == processConst.analysisStatusList.TRUE) {
                                let project = []
                                if (process[i].select_project.indexOf('天猫') != -1) project.push('天猫')
                                if (process[i].select_project.indexOf('淘工厂') != -1) project.push('淘工厂')
                                if (process[i].select_project.indexOf('小红书') != -1) project.push('小红书')
                                let variables = {}
                                variables[processConst.shelfProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.shelfProcess.template.uid] = process[i].uid
                                variables[processConst.shelfProcess.template.project] = project
                                variables[processConst.shelfProcess.template.developer] = process[i].developer
                                variables[processConst.shelfProcess.template.link_type] = process[i].link_type
                                robotStartProcess(processConst.shelfProcess.name, processConst.shelfProcess.key, variables)
                                process_status.push(processConst.statusList.THIRD_SHELF)
                            }
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.PURCHASE)
                    }
                } else logger.error(`非京东订货流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.FIRST_SHELF) != -1) {
                let instance = await processesRepo.getFirstShelfProcess(
                    process[i].uid, 
                    processConst.shelfProcess.key)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        let secondInstance = await processesRepo.getSecondShelfProcess(
                            process[i].uid, 
                            processConst.purchaseProcess.key)
                        let thirdInstance = await processesRepo.getThirdShelfProcess(
                            process[i].uid, 
                            processConst.purchaseProcess.key)
                        let first_goods_id = ''
                        let pdd = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.shelfProcess.column.pdd)
                        if (pdd) first_goods_id = `${first_goods_id}拼多多:${pdd.content};`
                        let tmcs = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.shelfProcess.column.tmcs)
                        if (tmcs) first_goods_id = `${first_goods_id}天猫超市:${tmcs.content};`
                        let coupang = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.shelfProcess.column.coupang)
                        if (coupang) first_goods_id = `${first_goods_id}coupang:${coupang.content};`
                        developmentProcessesRepo.updateColumnByUid(process[i].uid, 'first_goods_id', first_goods_id)
                        if ((!secondInstance?.length || (secondInstance?.length && 
                                [2,3,4].includes(secondInstance[0].status))) && 
                            (!thirdInstance?.length || (thirdInstance?.length && 
                                [2,3,4].includes(thirdInstance[0].status)))) {
                            developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid)
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        let secondInstance = await processesRepo.getSecondShelfProcess(
                            process[i].uid, 
                            processConst.purchaseProcess.key)
                        let thirdInstance = await processesRepo.getThirdShelfProcess(
                            process[i].uid, 
                            processConst.purchaseProcess.key)
                        if ((!secondInstance?.length || (secondInstance?.length && 
                                [2,3,4].includes(secondInstance[0].status))) && 
                            (!thirdInstance?.length || (thirdInstance?.length && 
                                [2,3,4].includes(thirdInstance[0].status)))) {
                            developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid)
                        }
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.FIRST_SHELF)
                    }
                } else logger.error(`事业1部上架流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.SECOND_SHELF) != -1) {
                let instance = await processesRepo.getSecondShelfProcess(
                    process[i].uid, 
                    processConst.shelfProcess.key)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        let firstInstance = await processesRepo.getFirstShelfProcess(
                            process[i].uid, 
                            processConst.purchaseProcess.key)
                        let thirdInstance = await processesRepo.getThirdShelfProcess(
                            process[i].uid, 
                            processConst.purchaseProcess.key)
                        let second_goods_id = ''
                        let dy = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.shelfProcess.column.dy)
                        if (dy) second_goods_id = `${second_goods_id}抖音:${dy.content};`
                        let ks = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.shelfProcess.column.ks)
                        if (ks) second_goods_id = `${second_goods_id}快手:${ks.content};`
                        let dw = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.shelfProcess.column.dw)
                        if (dw) second_goods_id = `${second_goods_id}得物:${dw.content};`
                        let vip = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.shelfProcess.column.vip)
                        if (vip) second_goods_id = `${second_goods_id}唯品会:${vip.content};`
                        let ex = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.shelfProcess.column['1688'])
                        if (ex) second_goods_id = `${second_goods_id}1688:${ex.content};`
                        developmentProcessesRepo.updateColumnByUid(process[i].uid, 'second_goods_id', second_goods_id)
                        if ((!firstInstance?.length || (firstInstance?.length && 
                                [2,3,4].includes(firstInstance[0].status))) && 
                            (!thirdInstance?.length || (thirdInstance?.length && 
                                [2,3,4].includes(thirdInstance[0].status)))) {
                            developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid)
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        let firstInstance = await processesRepo.getFirstShelfProcess(
                            process[i].uid, 
                            processConst.purchaseProcess.key)
                        let thirdInstance = await processesRepo.getThirdShelfProcess(
                            process[i].uid, 
                            processConst.purchaseProcess.key)
                        if ((!firstInstance?.length || (firstInstance?.length && 
                                [2,3,4].includes(firstInstance[0].status))) && 
                            (!thirdInstance?.length || (thirdInstance?.length && 
                                [2,3,4].includes(thirdInstance[0].status)))) {
                            developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid)
                        }
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.SECOND_SHELF)
                    }
                } else logger.error(`事业2部上架流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.THIRD_SHELF) != -1) {
                let instance = await processesRepo.getThirdShelfProcess(
                    process[i].uid, 
                    processConst.shelfProcess.key)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        let secondInstance = await processesRepo.getSecondShelfProcess(
                            process[i].uid, 
                            processConst.purchaseProcess.key)
                        let firstInstance = await processesRepo.getFirstShelfProcess(
                            process[i].uid, 
                            processConst.purchaseProcess.key)
                        let third_goods_id = ''
                        let xhs = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.shelfProcess.column.pdxhsd)
                        if (xhs) third_goods_id = `${third_goods_id}小红书:${xhs.content};`
                        let tm = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.shelfProcess.column.tm)
                        if (tm) third_goods_id = `${third_goods_id}天猫:${tm.content};`
                        let tgc = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.shelfProcess.column.tgc)
                        if (tgc) third_goods_id = `${third_goods_id}淘工厂:${coupang.tgc};`
                        developmentProcessesRepo.updateColumnByUid(process[i].uid, 'third_goods_id', third_goods_id)
                        if ((!secondInstance?.length || (secondInstance?.length && 
                                [2,3,4].includes(secondInstance[0].status))) && 
                            (!firstInstance?.length || (firstInstance?.length && 
                                [2,3,4].includes(firstInstance[0].status)))) {
                            developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid)
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        let secondInstance = await processesRepo.getSecondShelfProcess(
                            process[i].uid, 
                            processConst.purchaseProcess.key)
                        let firstInstance = await processesRepo.getFirstShelfProcess(
                            process[i].uid, 
                            processConst.purchaseProcess.key)
                        if ((!secondInstance?.length || (secondInstance?.length && 
                                [2,3,4].includes(secondInstance[0].status))) && 
                            (!firstInstance?.length || (firstInstance?.length && 
                                [2,3,4].includes(firstInstance[0].status)))) {
                            developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid)
                        }
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.THIRD_SHELF)
                    }
                } else logger.error(`事业3部上架流程触发失败, uid=${process[i].uid}`)
            }
            if (process_ids?.length) {
                process_ids = process_ids.join('","')
                let tasks = await processTasksRepo.getRunningTasksByProcessId(process_ids)
                let tasks_names = ''
                for (let j = 0; j < tasks.length; j++) {
                    tasks_names = `${tasks_names}${tasks[i].process_title}:${tasks[i].title};`
                }
                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'running_node', tasks_names)
            }
            if (process_status?.length) {
                process_status = process_status.join(',')
                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'status', process_status)
            }
            console.log(process_ids, process_status)
        }
        if (!process[i].jd_status) {
            let process_ids = [], process_status = []
            if (process[i].status.indexOf(processConst.statusList.DEVELOPMENT_CHECK) != -1) {
                let instance = await processesRepo.getProcessByUidAndColumn(
                    process[i].uid, 
                    processConst.developCheckProcess.key, 
                    processConst.developCheckProcess.column.is_jd,
                    processConst.jdStatusList.TRUE)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        if ([processConst.typeList.IP, processConst.typeList.SELF].includes(process[i].type)) {
                            // IP、自研触发寄样
                            let sampleInstance = await processesRepo.getProcessByUidAndColumn(
                                process[i].uid, 
                                processConst.sampleProcess.key,
                                processConst.sampleProcess.template.is_jd,
                                processConst.jdStatusList.TRUE)
                            if (!sampleInstance?.length) {
                                let variables = {}, user_id, developer_id
                                let starter = await systemUsersRepo.getID(process[i].starter)
                                if (starter?.length) user_id = starter[0].id
                                if (process[i].developer) {
                                    let developer = await systemUsersRepo.getID(process[i].developer)
                                    if (developer?.length) developer_id = developer[0].id
                                } else {
                                    // 更新开发人
                                    let user = await processInfoRepo.getByProcessIdAndField(
                                        instance[0].process_id, processConst.developCheckProcess.column.developer.DEFAULT
                                    )
                                    process[i].developer = user.content
                                    developmentProcessesRepo.updateColumnByUid(process[i].uid, 'developer', user.content)
                                    let developer = await systemUsersRepo.getID(user.content)
                                    if (developer?.length) developer_id = developer[0].id
                                }
                                variables[processConst.sampleProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.sampleProcess.template.uid] = process[i].uid
                                variables[processConst.sampleProcess.template.is_jd] = processConst.jdStatusList.TRUE
                                variables[processConst.sampleProcess.template.starter] = user_id
                                variables[processConst.sampleProcess.template.type] = process[i].type
                                if (process[i].type == processConst.typeList.IP) 
                                    variables[processConst.sampleProcess.template.project] = process[i].project
                                variables[processConst.sampleProcess.template.product_info] = JSON.parse(process[i].product_info)
                                variables[processConst.sampleProcess.template.developer] = developer_id
                                robotStartProcess(processConst.sampleProcess.name, processConst.sampleProcess.key, variables)
                                process_status.push(processConst.statusList.SAMPLE)
                            }
                        } else if (process[i].type == processConst.typeList.SUPPLIER) {
                            // 正推触发京东分析，寄样
                            let analysisInstance = await processesRepo.getProcessByUid(
                                process[i].uid, 
                                processConst.jdAnalysisProcess.key)
                            if (!analysisInstance?.length) {
                                let analysisVariables = JSON.parse(JSON.stringify(processConst.jdAnalysisProcess.template.SUPPLIER))
                                let variables = {}
                                for (let j = 0; j < analysisVariables.length; j++) {
                                    variables[analysisVariables[j].key] = analysisVariables[j].type == 'array' ? 
                                        [process[i][analysisVariables[j].name]] : process[i][analysisVariables[j].name]
                                }
                                robotStartProcess(processConst.jdAnalysisProcess.name, processConst.jdAnalysisProcess.key, variables)
                                process_status.push(processConst.statusList.ANALYSIS)
                            }
                            let sampleInstance = await processesRepo.getProcessByUidAndColumn(
                                process[i].uid, 
                                processConst.sampleProcess.key,
                                processConst.sampleProcess.template.is_jd,
                                processConst.jdStatusList.TRUE)
                            if (!sampleInstance?.length) {
                                let variables = {}, user_id, developer_id
                                let starter = await systemUsersRepo.getID(process[i].starter)
                                if (starter?.length) user_id = starter[0].id
                                if (process[i].developer) {
                                    let developer = await systemUsersRepo.getID(process[i].developer)
                                    if (developer?.length) developer_id = developer[0].id
                                } else {
                                    // 更新开发人
                                    let user = await processInfoRepo.getByProcessIdAndField(
                                        instance[0].process_id, processConst.developCheckProcess.column.developer.DEFAULT
                                    )
                                    process[i].developer = user.content
                                    developmentProcessesRepo.updateColumnByUid(process[i].uid, 'developer', user.content)
                                    let developer = await systemUsersRepo.getID(user.content)
                                    if (developer?.length) developer_id = developer[0].id
                                }
                                variables[processConst.sampleProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.sampleProcess.template.uid] = process[i].uid
                                variables[processConst.sampleProcess.template.is_jd] = processConst.jdStatusList.TRUE
                                variables[processConst.sampleProcess.template.starter] = user_id
                                variables[processConst.sampleProcess.template.type] = process[i].type
                                variables[processConst.sampleProcess.template.developer] = developer_id
                                robotStartProcess(processConst.sampleProcess.name, processConst.sampleProcess.key, variables)
                                process_status.push(processConst.statusList.SAMPLE)
                            }
                        } else {
                            // 反推触发京东分析
                            if (!process[i].developer) {
                                let user
                                for (let j = 0; j < processConst.developCheckProcess.column.developer.OTHER.length; j++) {
                                    user = await processInfoRepo.getByProcessIdAndField(
                                        instance[0].process_id, processConst.developCheckProcess.column.developer.OTHER[j])
                                    if (user) break
                                }
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'developer', user.content)
                            }
                            let analysisInstance = await processesRepo.getProcessByUid(
                                process[i].uid, 
                                processConst.jdAnalysisProcess.key)
                            if (!analysisInstance?.length) {
                                let analysisVariables = JSON.parse(JSON.stringify(processConst.jdAnalysisProcess.template.OPERATOR))
                                let variables = {}
                                for (let j = 0; j < analysisVariables.length; j++) {
                                    variables[analysisVariables[j].key] = analysisVariables[j].type == 'array' ? 
                                        [process[i][analysisVariables[j].name]] : process[i][analysisVariables[j].name]
                                }
                                robotStartProcess(processConst.jdAnalysisProcess.name, processConst.jdAnalysisProcess.key, variables)
                                process_status.push(processConst.statusList.ANALYSIS)
                            }
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateJDStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.DEVELOPMENT_CHECK)
                    }
                } else logger.error(`京东开发审核流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.SAMPLE) != -1) {
                let instance = await processesRepo.getProcessByUidAndColumn(
                    process[i].uid, 
                    processConst.sampleProcess.key,
                    processConst.sampleProcess.template.is_jd,
                    processConst.jdStatusList.TRUE)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        // 更新样品图片、草图
                        if (!process[i].sample_image) {
                            let image = await processInfoRepo.getByProcessIdAndField(
                                instance[0].process_id, processConst.sampleProcess.column.sample_image)
                            if (image) developmentProcessesRepo.updateColumnByUid(process[i].uid, 'sample_image', image.content)
                        }
                        if (!process[i].design_image) {
                            let image = await processInfoRepo.getByProcessIdAndField(
                                instance[0].process_id, processConst.sampleProcess.column.design_image)
                            if (image) developmentProcessesRepo.updateColumnByUid(process[i].uid, 'design_image', image.content)
                        }
                        if (process[i].type == processConst.typeList.OPERATOR) {                            
                            // 反推寄样通过触发样品选中
                            let analysisInstance = await processesRepo.getProcessByUid(
                                process[i].uid, 
                                processConst.analysisProcess.key)
                            if (analysisInstance?.length) {
                                let first = await processInfoRepo.getByProcessIdAndField(
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.first_operator)
                                let second = await processInfoRepo.getByProcessIdAndField(
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.second_operator)
                                let third = await processInfoRepo.getByProcessIdAndField(
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.third_operator)
                                let variables = {}
                                variables[processConst.sampleCheckProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.sampleCheckProcess.template.uid] = process[i].uid
                                variables[processConst.sampleCheckProcess.template.is_jd] = processConst.jdStatusList.TRUE
                                variables[processConst.sampleCheckProcess.template.first_operator] = first?.content
                                variables[processConst.sampleCheckProcess.template.second_operator] = second?.content
                                variables[processConst.sampleCheckProcess.template.third_operator] = third?.content
                                robotStartProcess(processConst.sampleCheckProcess.name, processConst.sampleCheckProcess.key, variables)
                                process_status.push(processConst.statusList.SAMPLE_CHECK)
                            }
                        } else if ([processConst.typeList.IP, processConst.typeList.SELF].includes(process[i].type)) {
                            // IP,自研审核通过触发企划审核
                            let reviewVarables = JSON.parse(JSON.stringify(processConst.reviewProcess.template.SUPPLIER))
                            let variables = {}
                            process['link'] = processConst.previousUrl + process[i].uid
                            process['start_time'] = moment(process[i].create_time).format('YYYY-MM-DD')
                            process['is_jd'] = processConst.jdStatusList.TRUE
                            for (let j = 0; j < reviewVarables.length; j++) {
                                variables[reviewVarables[j].key] = reviewVarables[j].type == 'array' ? 
                                    [process[i][reviewVarables[j].name]] : process[i][reviewVarables[j].name]
                            }
                            robotStartProcess(processConst.reviewProcess.name, processConst.reviewProcess.key, variables)
                            process_status.push(processConst.statusList.REVIEW)
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateJDStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.SAMPLE)
                    }
                } else logger.error(`京东寄样流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.ANALYSIS) != -1) {
                let instance = await processesRepo.getProcessByUid(
                    process[i].uid, 
                    processConst.jdAnalysisProcess.key)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        if ([processConst.typeList.IP, processConst.typeList.SELF].includes(process[i].type)) {
                            // IP、自研非京东分析通过触发开发审核，更新spu,sku_code
                            let developCheckInstance = await processesRepo.getProcessByUidAndColumn(
                                process[i].uid, 
                                processConst.developCheckProcess.key,
                                processConst.developCheckProcess.column.is_jd,
                                processConst.jdStatusList.TRUE)
                            if (!developCheckInstance?.length) {
                                let developCheckVarables = process[i].type == processConst.typeList.IP ? 
                                    JSON.parse(JSON.stringify(processConst.developCheckProcess.template.IP)) : 
                                    JSON.parse(JSON.stringify(processConst.developCheckProcess.template.SELF))
                                let variables = {}
                                process['link'] = processConst.previousUrl + process[i].uid
                                process['start_time'] = moment(process[i].create_time).format('YYYY-MM-DD')
                                process['is_jd'] = processConst.jdStatusList.TRUE
                                for (let j = 0; j < developCheckVarables.length; j++) {
                                    variables[developCheckVarables[j].key] = developCheckVarables[j].type == 'array' ? 
                                        [process[i][developCheckVarables[j].name]] : process[i][developCheckVarables[j].name]
                                }
                                robotStartProcess(processConst.developCheckProcess.name, processConst.developCheckProcess.key, variables)
                                process_status.push(processConst.statusList.DEVELOPMENT_CHECK)
                                let spu = await processInfoRepo.getByProcessIdAndField(
                                    instance[0].process_id, processConst.jdAnalysisProcess.column.spu)
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'spu', spu.content)
                                let sku_code = await processInfoRepo.getByProcessIdAndField(
                                    instance[0].process_id, processConst.jdAnalysisProcess.column.sku_code)
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'sku_code', sku_code.content)
                            }
                        } else if (process[i].type == processConst.typeList.SUPPLIER) {
                            // 正推京东分析选中触发企划审核，更新spu,sku_code
                            let reviewInstance = await processesRepo.getProcessByUidAndColumn(
                                process[i].uid, 
                                processConst.reviewProcess.key,
                                processConst.reviewProcess.column.is_jd,
                                processConst.jdStatusList.TRUE)
                            if (!reviewInstance?.length) {
                                let is_select = false
                                let select = await processInfoRepo.getByProcessIdAndField(
                                    instance[0].process_id, processConst.jdAnalysisProcess.column.select)
                                if (select?.content == processConst.analysisStatusList.TRUE) is_select = true
                                if (is_select) {
                                    let reviewVarables = JSON.parse(JSON.stringify(processConst.reviewProcess.template.SUPPLIER))
                                    let variables = {}
                                    process['link'] = processConst.previousUrl + process[i].uid
                                    process['start_time'] = moment(process[i].create_time).format('YYYY-MM-DD')
                                    process['is_jd'] = processConst.jdStatusList.TRUE
                                    for (let j = 0; j < reviewVarables.length; j++) {
                                        variables[reviewVarables[j].key] = reviewVarables[j].type == 'array' ? 
                                            [process[i][reviewVarables[j].name]] : process[i][reviewVarables[j].name]
                                    }
                                    robotStartProcess(processConst.reviewProcess.name, processConst.reviewProcess.key, variables)
                                    process_status.push(processConst.statusList.REVIEW)
                                    let spu = await processInfoRepo.getByProcessIdAndField(
                                        instance[0].process_id, processConst.jdAnalysisProcess.column.spu)
                                    developmentProcessesRepo.updateColumnByUid(process[i].uid, 'spu', spu.content)
                                    let sku_code = await processInfoRepo.getByProcessIdAndField(
                                        instance[0].process_id, processConst.jdAnalysisProcess.column.sku_code)
                                    developmentProcessesRepo.updateColumnByUid(process[i].uid, 'sku_code', sku_code.content)
                                }
                            }
                        } else {
                            // 反推京东分析通过触发寄样
                            let sampleInstance = await processesRepo.getProcessByUidAndColumn(
                                process[i].uid, 
                                processConst.sampleProcess.key,
                                processConst.sampleProcess.template.is_jd,
                                processConst.jdStatusList.TRUE)
                            if (!sampleInstance?.length) {
                                let variables = {}, user_id, developer_id
                                let starter = await systemUsersRepo.getID(process[i].starter)
                                if (starter?.length) user_id = starter[0].id
                                let developer = await systemUsersRepo.getID(process[i].developer)
                                if (developer?.length) developer_id = developer[0].id
                                variables[processConst.sampleProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.sampleProcess.template.uid] = process[i].uid
                                variables[processConst.sampleProcess.template.is_jd] = processConst.jdStatusList.TRUE
                                variables[processConst.sampleProcess.template.starter] = user_id
                                variables[processConst.sampleProcess.template.type] = process[i].type
                                variables[processConst.sampleProcess.template.developer] = developer_id
                                robotStartProcess(processConst.sampleProcess.name, processConst.sampleProcess.key, variables)
                                process_status.push(processConst.statusList.SAMPLE)
                            }
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateJDStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.ANALYSIS)
                    }
                } else logger.error(`京东分析流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.SAMPLE_CHECK) != -1) {
                // 反推样品选中触发企划审核，更新spu,sku_code
                let instance = await processesRepo.getProcessByUidAndColumn(
                    process[i].uid, 
                    processConst.sampleCheckProcess.key,
                    processConst.sampleCheckProcess.template.is_jd,
                    processConst.jdStatusList.TRUE)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        let reviewInstance = await processesRepo.getProcessByUidAndColumn(
                            process[i].uid, 
                            processConst.reviewProcess.key,
                            processConst.reviewProcess.column.is_jd,
                            processConst.jdStatusList.TRUE)
                        if (!reviewInstance?.length) {
                            let is_select = false
                            let analysisInstance = await processesRepo.getProcessByUid(
                                process[i].uid, 
                                processConst.analysisProcess.key)
                            if (analysisInstance?.length) {
                                let first = await processInfoRepo.getByProcessIdAndField(
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.first_select)
                                if (first?.content == processConst.analysisStatusList.TRUE) is_select = true
                                else {
                                    let second = await processInfoRepo.getByProcessIdAndField(
                                        analysisInstance[0].process_id, processConst.analysisProcess.column.second_select)
                                    if (second?.content == processConst.analysisStatusList.TRUE) is_select = true
                                    else {
                                        let third = await processInfoRepo.getByProcessIdAndField(
                                            analysisInstance[0].process_id, processConst.analysisProcess.column.third_select)
                                        if (third?.content == processConst.analysisStatusList.TRUE) is_select = true
                                    }
                                }
                            }
                            if (is_select) {
                                let reviewVarables = JSON.parse(JSON.stringify(processConst.reviewProcess.template.SUPPLIER))
                                let variables = {}
                                process['link'] = processConst.previousUrl + process[i].uid
                                process['start_time'] = moment(process[i].create_time).format('YYYY-MM-DD')
                                process['is_jd'] = processConst.jdStatusList.TRUE
                                for (let j = 0; j < reviewVarables.length; j++) {
                                    variables[reviewVarables[j].key] = reviewVarables[j].type == 'array' ? 
                                        [process[i][reviewVarables[j].name]] : process[i][reviewVarables[j].name]
                                }
                                robotStartProcess(processConst.reviewProcess.name, processConst.reviewProcess.key, variables)
                                process_status.push(processConst.statusList.REVIEW)
                                let analysisInstance = await processesRepo.getProcessByUid(
                                    process[i].uid, 
                                    processConst.jdAnalysisProcess.key)
                                let spu = await processInfoRepo.getByProcessIdAndField(
                                    analysisInstance[0].process_id, processConst.jdAnalysisProcess.column.spu)
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'spu', spu.content)
                                let sku_code = await processInfoRepo.getByProcessIdAndField(
                                    analysisInstance[0].process_id, processConst.jdAnalysisProcess.column.sku_code)
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'sku_code', sku_code.content)
                            }
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateJDStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.SAMPLE_CHECK)
                    }
                } else logger.error(`京东样品选中流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.REVIEW) != -1) {
                // 更新选中平台，事业1部是否选中，事业2部是否选中，事业3部是否选中，非京东是否选中，采购方式, 视觉类型
                let instance = await processesRepo.getProcessByUidAndColumn(
                    process[i].uid, 
                    processConst.reviewProcess.key,
                    processConst.reviewProcess.column.is_jd,
                    processConst.jdStatusList.TRUE)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        let select = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.reviewProcess.column.select_project)                        
                        let jd_is_select = processConst.analysisStatusList.FALSE
                        if (select) {
                            if (select.content.indexOf('京东') != -1) {
                                jd_is_select = processConst.analysisStatusList.TRUE
                            }
                            developmentProcessesRepo.updateColumnByUid(
                                process[i].uid, 'jd_is_select', jd_is_select)
                        }
                        let vision_type = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.reviewProcess.column.vision_type)
                        if (vision_type) developmentProcessesRepo.updateColumnByUid(
                                process[i].uid, 'jd_vision_type', vision_type.content)
                        // 触发爆款方案
                        let designProposalInstance = await processesRepo.getProcessByUidAndColumn(
                            process[i].uid, 
                            processConst.designProposalProcess.key,
                            processConst.designProposalProcess.template.is_jd,
                            processConst.jdStatusList.TRUE)
                        if (!designProposalInstance?.length) {
                            let division = await processInfoRepo.getByProcessIdAndField(
                                instance[0].process_id, processConst.reviewProcess.column.division)
                            let variables = {}
                            variables[processConst.designProposalProcess.template.link] = processConst.previousUrl + process[i].uid
                            variables[processConst.designProposalProcess.template.uid] = process[i].uid
                            variables[processConst.designProposalProcess.template.is_jd] = processConst.jdStatusList.TRUE
                            variables[processConst.designProposalProcess.template.name] = process[i].name
                            variables[processConst.designProposalProcess.template.division] = division?.content
                            variables[processConst.designProposalProcess.template.first_select] = first_select
                            variables[processConst.designProposalProcess.template.second_select] = second_select
                            variables[processConst.designProposalProcess.template.third_select] = third_select
                            robotStartProcess(processConst.designProposalProcess.name, processConst.designProposalProcess.key, variables)
                            process_status.push(processConst.statusList.DESIGN_PROPOSAL)
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateJDStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.REVIEW)
                    }
                } else logger.error(`京东企划审核流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.DESIGN_PROPOSAL) != -1) {
                let instance = await processesRepo.getProcessByUidAndColumn(
                    process[i].uid, 
                    processConst.designProposalProcess.key,
                    processConst.designProposalProcess.template.is_jd,
                    processConst.jdStatusList.TRUE)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        // 更新爆款方案负责人，触发视觉流程，京东订货流程
                        let operator = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.designProposalProcess.column.operator)
                        if (operator) developmentProcessesRepo.updateColumnByUid(
                                process[i].uid, 'jd_operator', operator.content)
                        let link_type = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.designProposalProcess.column.link_type)
                        let visionDesignInstance = await processesRepo.getProcessByUidAndColumn(
                            process[i].uid, 
                            processConst.visionDesignProcess.key,
                            processConst.visionDesignProcess.template.is_jd,
                            processConst.jdStatusList.TRUE)
                        if (!visionDesignInstance?.length) {
                            let variables = {}
                            variables[processConst.designProposalProcess.template.link] = processConst.previousUrl + process[i].uid
                            variables[processConst.designProposalProcess.template.uid] = process[i].uid
                            variables[processConst.designProposalProcess.template.is_jd] = processConst.jdStatusList.TRUE
                            variables[processConst.designProposalProcess.template.name] = process[i].name
                            variables[processConst.designProposalProcess.template.vision_type] = process[i].vision_type
                            variables[processConst.designProposalProcess.template.project] = ['京东']
                            variables[processConst.designProposalProcess.template.link_type] = link_type?.content
                            variables[processConst.designProposalProcess.template.developer] = process[i].developer
                            variables[processConst.designProposalProcess.template.image] = JSON.parse(process[i].image)
                            variables[processConst.designProposalProcess.template.operator] = operator?.content
                            robotStartProcess(processConst.designProposalProcess.name, processConst.designProposalProcess.key, variables)
                            process_status.push(processConst.statusList.DESIGN_PROPOSAL) 
                        }
                        let purchaseInstance = await processesRepo.getProcessByUid(
                            process[i].uid, 
                            processConst.jdPurchaseProcess.key)
                        if (!purchaseInstance?.length) {
                            let variables = {}
                            variables[processConst.jdPurchaseProcess.template.link] = processConst.previousUrl + process[i].uid
                            variables[processConst.jdPurchaseProcess.template.uid] = process[i].uid
                            variables[processConst.jdPurchaseProcess.template.type] = process[i].type
                            variables[processConst.jdPurchaseProcess.template.operator] = operator?.content
                            variables[processConst.jdPurchaseProcess.template.spu] = process[i].spu
                            variables[processConst.jdPurchaseProcess.template.developer] = process[i].developer
                            robotStartProcess(processConst.jdPurchaseProcess.name, processConst.jdPurchaseProcess.key, variables)
                            process_status.push(processConst.statusList.PURCHASE)
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateJDStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.DESIGN_PROPOSAL)
                    }
                } else logger.error(`京东爆款流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.VISION_DESIGN) != -1) {
                let instance = await processesRepo.getProcessByUidAndColumn(
                    process[i].uid, 
                    processConst.visionDesignProcess.key,
                    processConst.visionDesignProcess.template.is_jd,
                    processConst.jdStatusList.TRUE)
                if (instance?.length) {
                    if ([2,3,4].includes(instance[0].status)) {
                        let purchaseInstance = await processesRepo.getJDShelfProcess(
                            process[i].uid, 
                            processConst.jdPurchaseProcess.key)
                        if (purchaseInstance?.length && purchaseInstance[0].status == 2) {
                            // 触发上架流程
                            if (process[i].jd_is_select == processConst.analysisStatusList.TRUE) {
                                let variables = {}
                                variables[processConst.shelfProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.shelfProcess.template.uid] = process[i].uid
                                variables[processConst.shelfProcess.template.project] = ['京东']
                                variables[processConst.shelfProcess.template.developer] = process[i].developer
                                let designProposalInstance = await processesRepo.getProcessByUidAndColumn(
                                    process[i].uid, 
                                    processConst.designProposalProcess.key,
                                    processConst.designProposalProcess.template.is_jd,
                                    processConst.jdStatusList.TRUE)
                                let link_type = await processInfoRepo.getByProcessIdAndField(
                                    designProposalInstance[0].process_id, processConst.designProposalProcess.column.link_type)
                                variables[processConst.shelfProcess.template.link_type] = link_type?.content
                                robotStartProcess(processConst.shelfProcess.name, processConst.shelfProcess.key, variables)
                                process_status.push(processConst.statusList.SECOND_SHELF)
                            }
                        }
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.VISION_DESIGN)
                    }
                } else logger.error(`京东视觉流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.PURCHASE) != -1) {
                let instance = await processesRepo.getProcessByUid(
                    process[i].uid, 
                    processConst.jdPurchaseProcess.key)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        let visionDesignInstance = await processesRepo.getProcessByUidAndColumn(
                            process[i].uid, 
                            processConst.visionDesignProcess.key,
                            processConst.visionDesignProcess.template.is_jd,
                            processConst.jdStatusList.TRUE)
                        // 更新订货数量
                        let order_num = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.jdPurchaseProcess.column.order_num)
                        if (order_num) developmentProcessesRepo.updateColumnByUid(process[i].uid, 'jd_order_num', order_num.content)
                        if (!visionDesignInstance?.length && [2,3,4].includes(visionDesignInstance[0].status)) {
                            // 触发上架流程
                            if (process[i].jd_is_select == processConst.analysisStatusList.TRUE) {
                                let variables = {}
                                variables[processConst.shelfProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.shelfProcess.template.uid] = process[i].uid
                                variables[processConst.shelfProcess.template.project] = ['京东']
                                variables[processConst.shelfProcess.template.developer] = process[i].developer
                                variables[processConst.shelfProcess.template.link_type] = process[i].link_type
                                robotStartProcess(processConst.shelfProcess.name, processConst.shelfProcess.key, variables)
                                process_status.push(processConst.statusList.SECOND_SHELF)
                            }
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateJDStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.PURCHASE)
                    }
                } else logger.error(`京东订货流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.SECOND_SHELF) != -1) {
                let instance = await processesRepo.getJDShelfProcess(
                    process[i].uid, 
                    processConst.shelfProcess.key)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        let firstInstance = await processesRepo.getJDShelfProcess(
                            process[i].uid, 
                            processConst.shelfProcess.key)
                        let second_goods_id = ''
                        let jd = await processInfoRepo.getByProcessIdAndField(
                            firstInstance[0].process_id, processConst.shelfProcess.column.jd)
                        if (jd) second_goods_id = `${second_goods_id}京东:${jd.content};`
                        developmentProcessesRepo.updateColumnByUid(process[i].uid, 'second_goods_id', second_goods_id)
                        developmentProcessesRepo.updateJDStatusToFinishByUid(process[i].uid)
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateJDStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.SECOND_SHELF)
                    }
                } else logger.error(`事业2部上架流程触发失败, uid=${process[i].uid}`)
            }
            if (process_ids?.length) {
                process_ids = process_ids.join('","')
                let tasks = await processTasksRepo.getRunningTasksByProcessId(process_ids)
                let tasks_names = ''
                for (let j = 0; j < tasks.length; j++) {
                    tasks_names = `${tasks_names}${tasks[i].process_title}:${tasks[i].title};`
                }
                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'jd_running_node', tasks_names)
            }
            if (process_status?.length) {
                process_status = process_status.join(',')
                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'jd_status', process_status)
            }            
            console.log(process_ids, process_status)
        }
    }
}

const getById = async (id) => {
    const result = await developmentProcessesRepo.getById(id)
    return result?.length ? result[0] : null
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
    updateDevelopmetProcess,
    getById,
}