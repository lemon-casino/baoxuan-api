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
const { logger } = require('@/utils/log')

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

const buildProcessLogContext = (processItem, extra = {}) => {
    if (!processItem) return extra

    const baseContext = {
        name: processItem.name ?? null,
        type: processItem.type ?? null,
        develop_type: processItem.develop_type ?? null,
        status: processItem.status ?? null,
        jd_status: processItem.jd_status ?? null,
        developer: processItem.developer ?? null,
        starter: processItem.starter ?? null,
    }

    return {...baseContext, ...extra}
}

const logProcessTriggerFailure = (stage, processItem, reason, extra = {}) => {
    const context = buildProcessLogContext(processItem, extra)
    logger.error(`${stage}触发失败, uid=${processItem?.uid}, reason=${reason}, context=${JSON.stringify(context)}`)
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
    // if (params.image && Array.isArray(params.image) && params.image.length > 0) {
    //     params.image = params.image.map(url =>
    //         url.replace('https://minio.pakchoice.cn:9003', 'http://minio.pakchoice.cn:9000')
    //     )};
    params.image=params.image?JSON.stringify(params.image) : null
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
    //bi往bpm发起流程需要进行地址转换
    params.image=params.image?params.image.replace('https://minio.pakchoice.cn:9003', 'http://bpm.pakchoice.cn:9000'):''
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

const updateDevelopmetProcess = async () => { // 定义异步任务，用于批量同步开发流程的各类节点状态
    // 获取运行中的开发流程
    let process = await developmentProcessesRepo.getRunningProcess() // 获取所有仍在进行中的开发流程记录，等待异步结果返回，声明局部变量
    for (let i = 0; i < process.length; i++) { // 遍历集合执行批量逻辑
        if (!process[i].status) { // 进入非京东流程状态分支
            let process_ids = [], process_status = [] // 初始化待回写的流程实例 ID 与状态集合，声明局部变量
            if (process[i].status.indexOf(processConst.statusList.DEVELOPMENT_CHECK) != -1) { // 处理开发审核状态，判断非京东状态列表中是否包含目标状态
                let instance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                    process[i].uid, // 使用当前开发流程的 UID
                    processConst.developCheckProcess.key, // 涉及开发审核流程
                    processConst.developCheckProcess.column.is_jd, // 涉及开发审核流程，读取开发审核流程字段 is_jd
                    processConst.jdStatusList.FALSE) // 区分非京东链路标识
                if (instance?.length) { // 根据条件执行不同逻辑
                    if (instance[0].status == 2) { // 判断流程状态是否为通过
                        if ([processConst.typeList.IP, processConst.typeList.SELF].includes(process[i].type)) { // 针对IP 类型，针对自研类型，判断流程类型是否属于指定集合
                            // IP、自研触发寄样
                            let sampleInstance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                                process[i].uid, // 使用当前开发流程的 UID
                                processConst.sampleProcess.key, // 涉及寄样流程
                                processConst.sampleProcess.template.is_jd, // 涉及寄样流程，为寄样流程模板字段 is_jd 赋值
                                processConst.jdStatusList.FALSE) // 区分非京东链路标识
                            if (!sampleInstance?.length) { // 根据条件执行不同逻辑
                                let variables = {}, user_id, developer_id // 初始化流程变量容器，声明局部变量
                                let starter = await systemUsersRepo.getID(process[i].starter) // 根据用户账号获取系统用户 ID，等待异步结果返回，声明局部变量
                                if (starter?.length) user_id = starter[0].id // 如果查询到流程发起人则记录其 ID
                                if (process[i].developer) { // 当已有开发人信息时直接查询对应用户
                                    let developer = await systemUsersRepo.getID(process[i].developer) // 根据用户账号获取系统用户 ID，等待异步结果返回，声明局部变量
                                    if (developer?.length) developer_id = developer[0].id // 若能找到开发人员则提取其系统 ID
                                } else { // 进入新的逻辑块
                                    // 更新开发人
                                    let user = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                        instance[0].process_id, processConst.developCheckProcess.column.developer.DEFAULT // 涉及开发审核流程，读取开发审核流程字段 developer
                                    ) // 执行流程相关操作
                                    process[i].developer = user.content // 将流程信息中的开发人回写到主流程记录
                                    developmentProcessesRepo.updateColumnByUid(process[i].uid, 'developer', user.content) // 将开发人字段同步到开发流程主表，回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
                                    let developer = await systemUsersRepo.getID(user.content) // 根据用户账号获取系统用户 ID，等待异步结果返回，声明局部变量
                                    if (developer?.length) developer_id = developer[0].id // 若能找到开发人员则提取其系统 ID
                                } // 结束当前逻辑块
                                variables[processConst.sampleProcess.template.link] = processConst.previousUrl + process[i].uid // 拼接业务详情链接用于寄样流程，拼接流程跳转链接并附带当前 UID，涉及寄样流程，为寄样流程模板字段 link 赋值，拼接流程详情页面链接，使用当前开发流程的 UID
                                variables[processConst.sampleProcess.template.uid] = process[i].uid // 传递业务流程 UID 给寄样流程，涉及寄样流程，为寄样流程模板字段 uid 赋值，使用当前开发流程的 UID
                                variables[processConst.sampleProcess.template.is_jd] = processConst.jdStatusList.FALSE // 标记寄样流程是否属于京东链路，区分非京东链路标识，涉及寄样流程，为寄样流程模板字段 is_jd 赋值
                                variables[processConst.sampleProcess.template.starter] = user_id // 为寄样流程设置发起人 ID，涉及寄样流程，为寄样流程模板字段 starter 赋值
                                variables[processConst.sampleProcess.template.type] = process[i].type // 将业务类型传递给寄样流程，涉及寄样流程，为寄样流程模板字段 type 赋值
                                if (process[i].type == processConst.typeList.IP) // 针对IP 类型
                                    variables[processConst.sampleProcess.template.project] = process[i].project // 涉及寄样流程，为寄样流程模板字段 project 赋值
                                variables[processConst.sampleProcess.template.product_info] = JSON.parse(process[i].product_info) // 将产品信息 JSON 传递给寄样流程，涉及寄样流程，为寄样流程模板字段 product_info 赋值，解析 JSON 字符串获取结构化数据
                                variables[processConst.sampleProcess.template.developer] = developer_id // 传递开发人信息给寄样流程，涉及寄样流程，为寄样流程模板字段 developer 赋值
                                robotStartProcess(processConst.sampleProcess.name, processConst.sampleProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及寄样流程
                                process_status.push(processConst.statusList.SAMPLE) // 记录寄样状态以便回写，处理寄样状态
                            } // 结束当前逻辑块
                        } else if (process[i].type == processConst.typeList.SUPPLIER) { // 针对正推类型
                            // 正推触发非京东分析，寄样
                            let analysisInstance = await processesRepo.getProcessByUid( // 根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                                process[i].uid, // 使用当前开发流程的 UID
                                processConst.analysisProcess.key) // 涉及非京东分析流程
                            if (!analysisInstance?.length) { // 根据条件执行不同逻辑
                                let analysisVariables = JSON.parse(JSON.stringify(processConst.analysisProcess.template.SUPPLIER)) // 准备分析流程的模板变量，涉及非京东分析流程，为非京东分析流程模板字段 SUPPLIER 赋值，声明局部变量，解析 JSON 字符串获取结构化数据，复制模板以避免原数据被修改
                                let variables = {} // 初始化流程变量容器，声明局部变量
                                for (let j = 0; j < analysisVariables.length; j++) { // 遍历集合执行批量逻辑
                                    variables[analysisVariables[j].key] = analysisVariables[j].type == 'array' ? // 执行赋值操作
                                        [process[i][analysisVariables[j].name]] : process[i][analysisVariables[j].name] // 执行流程相关操作
                                } // 结束当前逻辑块
                                robotStartProcess(processConst.analysisProcess.name, processConst.analysisProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及非京东分析流程
                                process_status.push(processConst.statusList.ANALYSIS) // 记录非京东分析状态以便回写，处理非京东分析状态
                            } // 结束当前逻辑块
                            let sampleInstance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                                process[i].uid, // 使用当前开发流程的 UID
                                processConst.sampleProcess.key, // 涉及寄样流程
                                processConst.sampleProcess.template.is_jd, // 涉及寄样流程，为寄样流程模板字段 is_jd 赋值
                                processConst.jdStatusList.FALSE) // 区分非京东链路标识
                            if (!sampleInstance?.length) { // 根据条件执行不同逻辑
                                let variables = {}, user_id, developer_id // 初始化流程变量容器，声明局部变量
                                let starter = await systemUsersRepo.getID(process[i].starter) // 根据用户账号获取系统用户 ID，等待异步结果返回，声明局部变量
                                if (starter?.length) user_id = starter[0].id // 如果查询到流程发起人则记录其 ID
                                if (process[i].developer) { // 当已有开发人信息时直接查询对应用户
                                    let developer = await systemUsersRepo.getID(process[i].developer) // 根据用户账号获取系统用户 ID，等待异步结果返回，声明局部变量
                                    if (developer?.length) developer_id = developer[0].id // 若能找到开发人员则提取其系统 ID
                                } else { // 进入新的逻辑块
                                    // 更新开发人
                                    let user = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                        instance[0].process_id, processConst.developCheckProcess.column.developer.DEFAULT // 涉及开发审核流程，读取开发审核流程字段 developer
                                    ) // 执行流程相关操作
                                    process[i].developer = user.content // 将流程信息中的开发人回写到主流程记录
                                    developmentProcessesRepo.updateColumnByUid(process[i].uid, 'developer', user.content) // 将开发人字段同步到开发流程主表，回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
                                    let developer = await systemUsersRepo.getID(user.content) // 根据用户账号获取系统用户 ID，等待异步结果返回，声明局部变量
                                    if (developer?.length) developer_id = developer[0].id // 若能找到开发人员则提取其系统 ID
                                } // 结束当前逻辑块
                                variables[processConst.sampleProcess.template.link] = processConst.previousUrl + process[i].uid // 拼接业务详情链接用于寄样流程，拼接流程跳转链接并附带当前 UID，涉及寄样流程，为寄样流程模板字段 link 赋值，拼接流程详情页面链接，使用当前开发流程的 UID
                                variables[processConst.sampleProcess.template.uid] = process[i].uid // 传递业务流程 UID 给寄样流程，涉及寄样流程，为寄样流程模板字段 uid 赋值，使用当前开发流程的 UID
                                variables[processConst.sampleProcess.template.is_jd] = processConst.jdStatusList.FALSE // 标记寄样流程是否属于京东链路，区分非京东链路标识，涉及寄样流程，为寄样流程模板字段 is_jd 赋值
                                variables[processConst.sampleProcess.template.starter] = user_id // 为寄样流程设置发起人 ID，涉及寄样流程，为寄样流程模板字段 starter 赋值
                                variables[processConst.sampleProcess.template.type] = process[i].type // 将业务类型传递给寄样流程，涉及寄样流程，为寄样流程模板字段 type 赋值
                                variables[processConst.sampleProcess.template.developer] = developer_id // 传递开发人信息给寄样流程，涉及寄样流程，为寄样流程模板字段 developer 赋值
                                robotStartProcess(processConst.sampleProcess.name, processConst.sampleProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及寄样流程
                                process_status.push(processConst.statusList.SAMPLE) // 记录寄样状态以便回写，处理寄样状态
                            } // 结束当前逻辑块
                        } else { // 进入新的逻辑块
                            // 反推触发非京东分析
                            if (!process[i].developer) { // 当流程缺少开发人信息时需要补齐
                                let user // 声明局部变量
                                for (let j = 0; j < processConst.developCheckProcess.column.developer.OTHER.length; j++) { // 涉及开发审核流程，读取开发审核流程字段 developer
                                    user = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回
                                        instance[0].process_id, processConst.developCheckProcess.column.developer.OTHER[j]) // 涉及开发审核流程，读取开发审核流程字段 developer
                                    if (user) break // 根据条件执行不同逻辑
                                } // 结束当前逻辑块
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'developer', user.content) // 将开发人字段同步到开发流程主表，回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
                            } // 结束当前逻辑块
                            let analysisInstance = await processesRepo.getProcessByUid( // 根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                                process[i].uid, // 使用当前开发流程的 UID
                                processConst.analysisProcess.key) // 涉及非京东分析流程
                            if (!analysisInstance?.length) { // 根据条件执行不同逻辑
                                let analysisVariables = JSON.parse(JSON.stringify(processConst.analysisProcess.template.OPERATOR)) // 准备分析流程的模板变量，涉及非京东分析流程，为非京东分析流程模板字段 OPERATOR 赋值，声明局部变量，解析 JSON 字符串获取结构化数据，复制模板以避免原数据被修改
                                let variables = {} // 初始化流程变量容器，声明局部变量
                                for (let j = 0; j < analysisVariables.length; j++) { // 遍历集合执行批量逻辑
                                    variables[analysisVariables[j].key] = analysisVariables[j].type == 'array' ? // 执行赋值操作
                                        [process[i][analysisVariables[j].name]] : process[i][analysisVariables[j].name] // 执行流程相关操作
                                } // 结束当前逻辑块
                                robotStartProcess(processConst.analysisProcess.name, processConst.analysisProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及非京东分析流程
                                process_status.push(processConst.statusList.ANALYSIS) // 记录非京东分析状态以便回写，处理非京东分析状态
                            } // 结束当前逻辑块
                        } // 结束当前逻辑块
                    } else if ([3,4].includes(instance[0].status)) { // 判断流程是否处于驳回或终止状态
                        developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid) // 当子流程结束时同步主流程为完成状态，将非京东流程状态标记为完成，将非京东流程标记为已完成，使用当前开发流程的 UID
                    } else { // 进入新的逻辑块
                        process_ids.push(instance[0].process_id) // 收集需要回写状态的流程实例 ID
                        process_status.push(processConst.statusList.DEVELOPMENT_CHECK) // 处理开发审核状态
                    } // 结束当前逻辑块
                } else logger.error(`开发审核流程触发失败, uid=${process[i].uid}`) // 使用当前开发流程的 UID
            } // 结束当前逻辑块
            if (process[i].status.indexOf(processConst.statusList.SAMPLE) != -1) { // 处理寄样状态，判断非京东状态列表中是否包含目标状态
                let instance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                    process[i].uid, // 使用当前开发流程的 UID
                    processConst.sampleProcess.key, // 涉及寄样流程
                    processConst.sampleProcess.template.is_jd, // 涉及寄样流程，为寄样流程模板字段 is_jd 赋值
                    processConst.jdStatusList.FALSE) // 区分非京东链路标识
                if (instance?.length) { // 根据条件执行不同逻辑
                    if (instance[0].status == 2) { // 判断流程状态是否为通过
                        // 更新样品图片、草图
                        if (!process[i].sample_image) { // 根据条件执行不同逻辑
                            let image = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                instance[0].process_id, processConst.sampleProcess.column.sample_image) // 涉及寄样流程，读取寄样流程字段 sample_image
                            if (image) developmentProcessesRepo.updateColumnByUid(process[i].uid, 'sample_image', image.content) // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
                        } // 结束当前逻辑块
                        if (!process[i].design_image) { // 根据条件执行不同逻辑
                            let image = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                instance[0].process_id, processConst.sampleProcess.column.design_image) // 涉及寄样流程，读取寄样流程字段 design_image
                            if (image) developmentProcessesRepo.updateColumnByUid(process[i].uid, 'design_image', image.content) // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
                        } // 结束当前逻辑块
                        if (process[i].type == processConst.typeList.OPERATOR) { // 针对反推类型
                            // 反推寄样通过触发样品选中
                            let analysisInstance = await processesRepo.getProcessByUid( // 根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                                process[i].uid, // 使用当前开发流程的 UID
                                processConst.analysisProcess.key) // 涉及非京东分析流程
                            if (analysisInstance?.length) { // 根据条件执行不同逻辑
                                let first = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.first_operator) // 涉及非京东分析流程，读取非京东分析流程字段 first_operator
                                let second = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.second_operator) // 涉及非京东分析流程，读取非京东分析流程字段 second_operator
                                let third = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.third_operator) // 涉及非京东分析流程，读取非京东分析流程字段 third_operator
                                let variables = {} // 初始化流程变量容器，声明局部变量
                                variables[processConst.sampleCheckProcess.template.link] = processConst.previousUrl + process[i].uid // 拼接流程跳转链接并附带当前 UID，涉及样品选中流程，为样品选中流程模板字段 link 赋值，拼接流程详情页面链接，使用当前开发流程的 UID
                                variables[processConst.sampleCheckProcess.template.uid] = process[i].uid // 涉及样品选中流程，为样品选中流程模板字段 uid 赋值，使用当前开发流程的 UID
                                variables[processConst.sampleCheckProcess.template.is_jd] = processConst.jdStatusList.FALSE // 区分非京东链路标识，涉及样品选中流程，为样品选中流程模板字段 is_jd 赋值
                                variables[processConst.sampleCheckProcess.template.first_operator] = first?.content // 涉及样品选中流程，为样品选中流程模板字段 first_operator 赋值
                                variables[processConst.sampleCheckProcess.template.second_operator] = second?.content // 涉及样品选中流程，为样品选中流程模板字段 second_operator 赋值
                                variables[processConst.sampleCheckProcess.template.third_operator] = third?.content // 涉及样品选中流程，为样品选中流程模板字段 third_operator 赋值
                                robotStartProcess(processConst.sampleCheckProcess.name, processConst.sampleCheckProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及样品选中流程
                                process_status.push(processConst.statusList.SAMPLE_CHECK) // 处理寄样状态，处理样品选中状态
                            } // 结束当前逻辑块
                        } else if ([processConst.typeList.IP, processConst.typeList.SELF].includes(process[i].type)) { // 针对IP 类型，针对自研类型，判断流程类型是否属于指定集合
                            // IP,自研审核通过触发企划审核
                            let reviewVarables = JSON.parse(JSON.stringify(processConst.reviewProcess.template.SUPPLIER)) // 复制企划审核流程的模板变量，涉及企划审核流程，为企划审核流程模板字段 SUPPLIER 赋值，声明局部变量，解析 JSON 字符串获取结构化数据，复制模板以避免原数据被修改
                            let variables = {} // 初始化流程变量容器，声明局部变量
                            process['link'] = processConst.previousUrl + process[i].uid // 拼接流程跳转链接并附带当前 UID，拼接流程详情页面链接，使用当前开发流程的 UID
                            process['start_time'] = moment(process[i].create_time).format('YYYY-MM-DD') // 格式化日期字符串
                            process['is_jd'] = processConst.jdStatusList.FALSE // 区分非京东链路标识
                            for (let j = 0; j < reviewVarables.length; j++) { // 遍历集合执行批量逻辑
                                variables[reviewVarables[j].key] = reviewVarables[j].type == 'array' ? // 执行赋值操作
                                    [process[i][reviewVarables[j].name]] : process[i][reviewVarables[j].name] // 执行流程相关操作
                            } // 结束当前逻辑块
                            robotStartProcess(processConst.reviewProcess.name, processConst.reviewProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及企划审核流程
                            process_status.push(processConst.statusList.REVIEW) // 记录企划审核状态以便回写，处理企划审核状态
                        } // 结束当前逻辑块
                    } else if ([3,4].includes(instance[0].status)) { // 判断流程是否处于驳回或终止状态
                        developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid) // 当子流程结束时同步主流程为完成状态，将非京东流程状态标记为完成，将非京东流程标记为已完成，使用当前开发流程的 UID
                    } else { // 进入新的逻辑块
                        process_ids.push(instance[0].process_id) // 收集需要回写状态的流程实例 ID
                        process_status.push(processConst.statusList.SAMPLE) // 记录寄样状态以便回写，处理寄样状态
                    } // 结束当前逻辑块
                } else logger.error(`寄样流程触发失败, uid=${process[i].uid}`) // 使用当前开发流程的 UID
            } // 结束当前逻辑块
            if (process[i].status.indexOf(processConst.statusList.ANALYSIS) != -1) { // 处理非京东分析状态，判断非京东状态列表中是否包含目标状态
                let instance = await processesRepo.getProcessByUid( // 根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                    process[i].uid, // 使用当前开发流程的 UID
                    processConst.analysisProcess.key) // 涉及非京东分析流程
                if (instance?.length) { // 根据条件执行不同逻辑
                    if (process[i].type == processConst.typeList.IP && // 针对IP 类型
                        !['拼多多专供', '天猫专供'].includes(process[i].develop_type) && // 判断集合内是否已包含特定值
                        instance[0].status == 1) { // 进入新的逻辑块
                        // 非京东分析负责人审核通过触发京东分析
                        let tasks = await processTasksRepo.getSuccessTasksByProcessIdAndTitle( // 查询流程实例中已完成的指定任务节点，等待异步结果返回，声明局部变量
                            instance[0].process_id, // 执行流程相关操作
                            '事业一部负责人审核","事业二部负责人审核","事业三部负责人审核') // 执行流程相关操作
                        let jdInstance = await processesRepo.getProcessByUid( // 根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                            process[i].uid, // 使用当前开发流程的 UID
                            processConst.jdAnalysisProcess.key) // 涉及京东分析流程
                        if (tasks?.length && !jdInstance.length) { // 根据条件执行不同逻辑
                            let jdAnalysisVariables = JSON.parse(JSON.stringify(processConst.jdAnalysisProcess.template.IP)) // 涉及京东分析流程，为京东分析流程模板字段 IP 赋值，声明局部变量，解析 JSON 字符串获取结构化数据，复制模板以避免原数据被修改
                            let variables = {} // 初始化流程变量容器，声明局部变量
                            process['link'] = processConst.previousUrl + process[i].uid // 拼接流程跳转链接并附带当前 UID，拼接流程详情页面链接，使用当前开发流程的 UID
                            process['start_time'] = moment(process[i].create_time).format('YYYY-MM-DD') // 格式化日期字符串
                            for (let j = 0; j < jdAnalysisVariables.length; j++) { // 遍历集合执行批量逻辑
                                variables[jdAnalysisVariables[j].key] = jdAnalysisVariables[j].type == 'array' ? // 执行赋值操作
                                    [process[i][jdAnalysisVariables[j].name]] : process[i][jdAnalysisVariables[j].name] // 执行流程相关操作
                            } // 结束当前逻辑块
                            robotStartProcess(processConst.jdAnalysisProcess.name, processConst.jdAnalysisProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及京东分析流程
                            process_status.push(processConst.statusList.ANALYSIS) // 记录非京东分析状态以便回写，处理非京东分析状态
                        } // 结束当前逻辑块
                        process_ids.push(instance[0].process_id) // 收集需要回写状态的流程实例 ID
                        process_status.push(processConst.statusList.ANALYSIS) // 记录非京东分析状态以便回写，处理非京东分析状态
                    } else if (instance[0].status == 2) { // 判断流程状态是否为通过
                        if ([processConst.typeList.IP, processConst.typeList.SELF].includes(process[i].type)) { // 针对IP 类型，针对自研类型，判断流程类型是否属于指定集合
                            // IP、自研非京东分析通过触发开发审核，更新spu,sku_code
                            let developCheckInstance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                                process[i].uid, // 使用当前开发流程的 UID
                                processConst.developCheckProcess.key, // 涉及开发审核流程
                                processConst.developCheckProcess.column.is_jd, // 涉及开发审核流程，读取开发审核流程字段 is_jd
                                processConst.jdStatusList.FALSE) // 区分非京东链路标识
                            if (!developCheckInstance?.length) { // 根据条件执行不同逻辑
                                let developCheckVarables = process[i].type == processConst.typeList.IP ? // 根据流程类型选择对应的开发审核模板，针对IP 类型，声明局部变量
                                    JSON.parse(JSON.stringify(processConst.developCheckProcess.template.IP)) : // 涉及开发审核流程，为开发审核流程模板字段 IP 赋值，解析 JSON 字符串获取结构化数据，复制模板以避免原数据被修改
                                    JSON.parse(JSON.stringify(processConst.developCheckProcess.template.SELF)) // 涉及开发审核流程，为开发审核流程模板字段 SELF 赋值，解析 JSON 字符串获取结构化数据，复制模板以避免原数据被修改
                                let variables = {} // 初始化流程变量容器，声明局部变量
                                process['link'] = processConst.previousUrl + process[i].uid // 拼接流程跳转链接并附带当前 UID，拼接流程详情页面链接，使用当前开发流程的 UID
                                process['start_time'] = moment(process[i].create_time).format('YYYY-MM-DD') // 格式化日期字符串
                                process['is_jd'] = processConst.jdStatusList.FALSE // 区分非京东链路标识
                                for (let j = 0; j < developCheckVarables.length; j++) { // 遍历集合执行批量逻辑
                                    variables[developCheckVarables[j].key] = developCheckVarables[j].type == 'array' ? // 执行赋值操作
                                        [process[i][developCheckVarables[j].name]] : process[i][developCheckVarables[j].name] // 执行流程相关操作
                                } // 结束当前逻辑块
                                robotStartProcess(processConst.developCheckProcess.name, processConst.developCheckProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及开发审核流程
                                process_status.push(processConst.statusList.DEVELOPMENT_CHECK) // 处理开发审核状态
                                let spu = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                    instance[0].process_id, processConst.analysisProcess.column.spu) // 读取非京东分析流程的 spu 信息，涉及非京东分析流程，读取非京东分析流程字段 spu
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'spu', spu.content) // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
                                let sku_code = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                    instance[0].process_id, processConst.analysisProcess.column.sku_code) // 读取非京东分析流程的 sku_code 信息，涉及非京东分析流程，读取非京东分析流程字段 sku_code
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'sku_code', sku_code.content) // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
                            } // 结束当前逻辑块
                        } else if (process[i].type == processConst.typeList.SUPPLIER) { // 针对正推类型
                            // 正推非京东分析选中触发企划审核，更新spu,sku_code
                            let reviewInstance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                                process[i].uid, // 使用当前开发流程的 UID
                                processConst.reviewProcess.key, // 涉及企划审核流程
                                processConst.reviewProcess.column.is_jd, // 涉及企划审核流程，读取企划审核流程字段 is_jd
                                processConst.jdStatusList.FALSE) // 区分非京东链路标识
                            if (!reviewInstance?.length) { // 根据条件执行不同逻辑
                                let is_select = false // 声明局部变量
                                let first = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                    instance[0].process_id, processConst.analysisProcess.column.first_select) // 涉及非京东分析流程，读取非京东分析流程字段 first_select
                                if (first?.content == processConst.analysisStatusList.TRUE) is_select = true // 判断是否选中
                                else { // 处理其他分支情况
                                    let second = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                        instance[0].process_id, processConst.analysisProcess.column.second_select) // 涉及非京东分析流程，读取非京东分析流程字段 second_select
                                    if (second?.content == processConst.analysisStatusList.TRUE) is_select = true // 判断是否选中
                                    else { // 处理其他分支情况
                                        let third = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                            instance[0].process_id, processConst.analysisProcess.column.third_select) // 涉及非京东分析流程，读取非京东分析流程字段 third_select
                                        if (third?.content == processConst.analysisStatusList.TRUE) is_select = true // 判断是否选中
                                    } // 结束当前逻辑块
                                } // 结束当前逻辑块
                                if (is_select) { // 根据条件执行不同逻辑
                                    let reviewVarables = JSON.parse(JSON.stringify(processConst.reviewProcess.template.SUPPLIER)) // 复制企划审核流程的模板变量，涉及企划审核流程，为企划审核流程模板字段 SUPPLIER 赋值，声明局部变量，解析 JSON 字符串获取结构化数据，复制模板以避免原数据被修改
                                    let variables = {} // 初始化流程变量容器，声明局部变量
                                    process['link'] = processConst.previousUrl + process[i].uid // 拼接流程跳转链接并附带当前 UID，拼接流程详情页面链接，使用当前开发流程的 UID
                                    process['start_time'] = moment(process[i].create_time).format('YYYY-MM-DD') // 格式化日期字符串
                                    process['is_jd'] = processConst.jdStatusList.FALSE // 区分非京东链路标识
                                    for (let j = 0; j < reviewVarables.length; j++) { // 遍历集合执行批量逻辑
                                        variables[reviewVarables[j].key] = reviewVarables[j].type == 'array' ? // 执行赋值操作
                                            [process[i][reviewVarables[j].name]] : process[i][reviewVarables[j].name] // 执行流程相关操作
                                    } // 结束当前逻辑块
                                    robotStartProcess(processConst.reviewProcess.name, processConst.reviewProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及企划审核流程
                                    process_status.push(processConst.statusList.REVIEW) // 记录企划审核状态以便回写，处理企划审核状态
                                    let spu = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                        instance[0].process_id, processConst.analysisProcess.column.spu) // 读取非京东分析流程的 spu 信息，涉及非京东分析流程，读取非京东分析流程字段 spu
                                    developmentProcessesRepo.updateColumnByUid(process[i].uid, 'spu', spu.content) // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
                                    let sku_code = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                        instance[0].process_id, processConst.analysisProcess.column.sku_code) // 读取非京东分析流程的 sku_code 信息，涉及非京东分析流程，读取非京东分析流程字段 sku_code
                                    developmentProcessesRepo.updateColumnByUid(process[i].uid, 'sku_code', sku_code.content) // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
                                } // 结束当前逻辑块
                            } // 结束当前逻辑块
                        } else { // 进入新的逻辑块
                            // 反推非京东分析通过触发寄样
                            let sampleInstance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                                process[i].uid, // 使用当前开发流程的 UID
                                processConst.sampleProcess.key, // 涉及寄样流程
                                processConst.sampleProcess.template.is_jd, // 涉及寄样流程，为寄样流程模板字段 is_jd 赋值
                                processConst.jdStatusList.FALSE) // 区分非京东链路标识
                            if (!sampleInstance?.length) { // 根据条件执行不同逻辑
                                let variables = {}, user_id, developer_id // 初始化流程变量容器，声明局部变量
                                let starter = await systemUsersRepo.getID(process[i].starter) // 根据用户账号获取系统用户 ID，等待异步结果返回，声明局部变量
                                if (starter?.length) user_id = starter[0].id // 如果查询到流程发起人则记录其 ID
                                let developer = await systemUsersRepo.getID(process[i].developer) // 根据用户账号获取系统用户 ID，等待异步结果返回，声明局部变量
                                if (developer?.length) developer_id = developer[0].id // 若能找到开发人员则提取其系统 ID
                                variables[processConst.sampleProcess.template.link] = processConst.previousUrl + process[i].uid // 拼接业务详情链接用于寄样流程，拼接流程跳转链接并附带当前 UID，涉及寄样流程，为寄样流程模板字段 link 赋值，拼接流程详情页面链接，使用当前开发流程的 UID
                                variables[processConst.sampleProcess.template.uid] = process[i].uid // 传递业务流程 UID 给寄样流程，涉及寄样流程，为寄样流程模板字段 uid 赋值，使用当前开发流程的 UID
                                variables[processConst.sampleProcess.template.is_jd] = processConst.jdStatusList.FALSE // 标记寄样流程是否属于京东链路，区分非京东链路标识，涉及寄样流程，为寄样流程模板字段 is_jd 赋值
                                variables[processConst.sampleProcess.template.starter] = user_id // 为寄样流程设置发起人 ID，涉及寄样流程，为寄样流程模板字段 starter 赋值
                                variables[processConst.sampleProcess.template.type] = process[i].type // 将业务类型传递给寄样流程，涉及寄样流程，为寄样流程模板字段 type 赋值
                                variables[processConst.sampleProcess.template.developer] = developer_id // 传递开发人信息给寄样流程，涉及寄样流程，为寄样流程模板字段 developer 赋值
                                robotStartProcess(processConst.sampleProcess.name, processConst.sampleProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及寄样流程
                                process_status.push(processConst.statusList.SAMPLE) // 记录寄样状态以便回写，处理寄样状态
                            } // 结束当前逻辑块
                        } // 结束当前逻辑块
                    } else if ([3,4].includes(instance[0].status)) { // 判断流程是否处于驳回或终止状态
                        developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid) // 当子流程结束时同步主流程为完成状态，将非京东流程状态标记为完成，将非京东流程标记为已完成，使用当前开发流程的 UID
                    } else { // 进入新的逻辑块
                        process_ids.push(instance[0].process_id) // 收集需要回写状态的流程实例 ID
                        process_status.push(processConst.statusList.ANALYSIS) // 记录非京东分析状态以便回写，处理非京东分析状态
                    } // 结束当前逻辑块
                } else logger.error(`非京东分析流程触发失败, uid=${process[i].uid}`) // 使用当前开发流程的 UID
            } // 结束当前逻辑块
            if (process[i].status.indexOf(processConst.statusList.SAMPLE_CHECK) != -1) { // 处理寄样状态，处理样品选中状态，判断非京东状态列表中是否包含目标状态
                // 反推样品选中触发企划审核，更新spu,sku_code
                let instance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                    process[i].uid, // 使用当前开发流程的 UID
                    processConst.sampleCheckProcess.key, // 涉及样品选中流程
                    processConst.sampleCheckProcess.template.is_jd, // 涉及样品选中流程，为样品选中流程模板字段 is_jd 赋值
                    processConst.jdStatusList.FALSE) // 区分非京东链路标识
                if (instance?.length) { // 根据条件执行不同逻辑
                    if (instance[0].status == 2) { // 判断流程状态是否为通过
                        let reviewInstance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                            process[i].uid, // 使用当前开发流程的 UID
                            processConst.reviewProcess.key, // 涉及企划审核流程
                            processConst.reviewProcess.column.is_jd, // 涉及企划审核流程，读取企划审核流程字段 is_jd
                            processConst.jdStatusList.FALSE) // 区分非京东链路标识
                        if (!reviewInstance?.length) { // 根据条件执行不同逻辑
                            let is_select = false // 声明局部变量
                            let analysisInstance = await processesRepo.getProcessByUid( // 根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                                process[i].uid, // 使用当前开发流程的 UID
                                processConst.analysisProcess.key) // 涉及非京东分析流程
                            if (analysisInstance?.length) { // 根据条件执行不同逻辑
                                let first = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.first_select) // 涉及非京东分析流程，读取非京东分析流程字段 first_select
                                if (first?.content == processConst.analysisStatusList.TRUE) is_select = true // 判断是否选中
                                else { // 处理其他分支情况
                                    let second = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                        analysisInstance[0].process_id, processConst.analysisProcess.column.second_select) // 涉及非京东分析流程，读取非京东分析流程字段 second_select
                                    if (second?.content == processConst.analysisStatusList.TRUE) is_select = true // 判断是否选中
                                    else { // 处理其他分支情况
                                        let third = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                            analysisInstance[0].process_id, processConst.analysisProcess.column.third_select) // 涉及非京东分析流程，读取非京东分析流程字段 third_select
                                        if (third?.content == processConst.analysisStatusList.TRUE) is_select = true // 判断是否选中
                                    } // 结束当前逻辑块
                                } // 结束当前逻辑块
                            } // 结束当前逻辑块
                            if (is_select) { // 根据条件执行不同逻辑
                                let reviewVarables = JSON.parse(JSON.stringify(processConst.reviewProcess.template.SUPPLIER)) // 复制企划审核流程的模板变量，涉及企划审核流程，为企划审核流程模板字段 SUPPLIER 赋值，声明局部变量，解析 JSON 字符串获取结构化数据，复制模板以避免原数据被修改
                                let variables = {} // 初始化流程变量容器，声明局部变量
                                process['link'] = processConst.previousUrl + process[i].uid // 拼接流程跳转链接并附带当前 UID，拼接流程详情页面链接，使用当前开发流程的 UID
                                process['start_time'] = moment(process[i].create_time).format('YYYY-MM-DD') // 格式化日期字符串
                                process['is_jd'] = processConst.jdStatusList.FALSE // 区分非京东链路标识
                                for (let j = 0; j < reviewVarables.length; j++) { // 遍历集合执行批量逻辑
                                    variables[reviewVarables[j].key] = reviewVarables[j].type == 'array' ? // 执行赋值操作
                                        [process[i][reviewVarables[j].name]] : process[i][reviewVarables[j].name] // 执行流程相关操作
                                } // 结束当前逻辑块
                                robotStartProcess(processConst.reviewProcess.name, processConst.reviewProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及企划审核流程
                                process_status.push(processConst.statusList.REVIEW) // 记录企划审核状态以便回写，处理企划审核状态
                                let analysisInstance = await processesRepo.getProcessByUid( // 根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                                    process[i].uid, // 使用当前开发流程的 UID
                                    processConst.analysisProcess.key) // 涉及非京东分析流程
                                let spu = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.spu) // 读取非京东分析流程的 spu 信息，涉及非京东分析流程，读取非京东分析流程字段 spu
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'spu', spu.content) // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
                                let sku_code = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.sku_code) // 读取非京东分析流程的 sku_code 信息，涉及非京东分析流程，读取非京东分析流程字段 sku_code
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'sku_code', sku_code.content) // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
                            } // 结束当前逻辑块
                        } // 结束当前逻辑块
                    } else if ([3,4].includes(instance[0].status)) { // 判断流程是否处于驳回或终止状态
                        developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid) // 当子流程结束时同步主流程为完成状态，将非京东流程状态标记为完成，将非京东流程标记为已完成，使用当前开发流程的 UID
                    } else { // 进入新的逻辑块
                        process_ids.push(instance[0].process_id) // 收集需要回写状态的流程实例 ID
                        process_status.push(processConst.statusList.SAMPLE_CHECK) // 处理寄样状态，处理样品选中状态
                    } // 结束当前逻辑块
                } else logger.error(`样品选中流程触发失败, uid=${process[i].uid}`) // 使用当前开发流程的 UID
            } // 结束当前逻辑块
            if (process[i].status.indexOf(processConst.statusList.REVIEW) != -1) { // 处理企划审核状态，判断非京东状态列表中是否包含目标状态
                // 更新选中平台，事业1部是否选中，事业2部是否选中，事业3部是否选中，非京东是否选中，采购方式, 视觉类型
                let instance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                    process[i].uid, // 使用当前开发流程的 UID
                    processConst.reviewProcess.key, // 涉及企划审核流程
                    processConst.reviewProcess.column.is_jd, // 涉及企划审核流程，读取企划审核流程字段 is_jd
                    processConst.jdStatusList.FALSE) // 区分非京东链路标识
                if (instance?.length) { // 根据条件执行不同逻辑
                    if (instance[0].status == 2) { // 判断流程状态是否为通过
                        let select = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                            instance[0].process_id, processConst.reviewProcess.column.select_project) // 读取企划审核的选中平台信息，涉及企划审核流程，读取企划审核流程字段 select_project
                        let first_select = processConst.analysisStatusList.FALSE, // 判断是否未选中，声明局部变量
                            second_select = processConst.analysisStatusList.FALSE, // 判断是否未选中
                            third_select = processConst.analysisStatusList.FALSE, // 判断是否未选中
                            is_select = processConst.analysisStatusList.FALSE // 判断是否未选中
                        if (select) { // 根据条件执行不同逻辑
                            if (select.content.indexOf('拼多多') != -1 || // 根据条件执行不同逻辑
                                select.content.indexOf('天猫超市') != -1 || // 执行赋值操作
                                select.content.indexOf('Coupang') != -1) { // 进入新的逻辑块
                                first_select = processConst.analysisStatusList.TRUE // 判断是否选中
                            } // 结束当前逻辑块
                            if (select.content.indexOf('抖音') != -1 || // 根据条件执行不同逻辑
                                select.content.indexOf('快手') != -1 || // 执行赋值操作
                                select.content.indexOf('得物') != -1 || // 执行赋值操作
                                select.content.indexOf('唯品会') != -1 || // 执行赋值操作
                                select.content.indexOf('1688') != -1) { // 进入新的逻辑块
                                second_select = processConst.analysisStatusList.TRUE // 判断是否选中
                            } // 结束当前逻辑块
                            if (select.content.indexOf('天猫') != -1 || // 根据条件执行不同逻辑
                                select.content.indexOf('淘工厂') != -1 || // 执行赋值操作
                                select.content.indexOf('小红书') != -1) { // 进入新的逻辑块
                                third_select = processConst.analysisStatusList.TRUE // 判断是否选中
                            } // 结束当前逻辑块
                            if ([first_select, second_select, third_select].includes(processConst.analysisStatusList.TRUE)) is_select = processConst.analysisStatusList.TRUE // 判断是否选中，判断集合内是否已包含特定值
                            developmentProcessesRepo.updateColumnByUid( // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表
                                process[i].uid, 'is_select', is_select) // 使用当前开发流程的 UID
                            developmentProcessesRepo.updateColumnByUid( // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表
                                process[i].uid, 'first_select', first_select) // 使用当前开发流程的 UID
                            developmentProcessesRepo.updateColumnByUid( // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表
                                process[i].uid, 'second_select', second_select) // 使用当前开发流程的 UID
                            developmentProcessesRepo.updateColumnByUid( // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表
                                process[i].uid, 'third_select', third_select) // 使用当前开发流程的 UID
                            developmentProcessesRepo.updateColumnByUid( // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表
                                process[i].uid, 'select_project', select.content) // 使用当前开发流程的 UID
                        } // 结束当前逻辑块
                        let purchase_type = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                            instance[0].process_id, processConst.reviewProcess.column.purchase_type) // 读取企划审核的采购方式，涉及企划审核流程，读取企划审核流程字段 purchase_type
                        if (purchase_type) developmentProcessesRepo.updateColumnByUid( // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表
                            process[i].uid, 'order_type', purchase_type.content) // 使用当前开发流程的 UID
                        let vision_type = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                            instance[0].process_id, processConst.reviewProcess.column.vision_type) // 读取企划审核的视觉类型，涉及企划审核流程，读取企划审核流程字段 vision_type
                        if (vision_type) developmentProcessesRepo.updateColumnByUid( // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表
                            process[i].uid, 'vision_type', vision_type.content) // 使用当前开发流程的 UID
                        // 触发爆款方案
                        let designProposalInstance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                            process[i].uid, // 使用当前开发流程的 UID
                            processConst.designProposalProcess.key, // 涉及爆款方案流程
                            processConst.designProposalProcess.template.is_jd, // 涉及爆款方案流程，为爆款方案流程模板字段 is_jd 赋值
                            processConst.jdStatusList.FALSE) // 区分非京东链路标识
                        if (!designProposalInstance?.length) { // 根据条件执行不同逻辑
                            let division = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                instance[0].process_id, processConst.reviewProcess.column.division) // 涉及企划审核流程，读取企划审核流程字段 division
                            let variables = {} // 初始化流程变量容器，声明局部变量
                            variables[processConst.designProposalProcess.template.link] = processConst.previousUrl + process[i].uid // 拼接流程跳转链接并附带当前 UID，涉及爆款方案流程，为爆款方案流程模板字段 link 赋值，拼接流程详情页面链接，使用当前开发流程的 UID
                            variables[processConst.designProposalProcess.template.uid] = process[i].uid // 涉及爆款方案流程，为爆款方案流程模板字段 uid 赋值，使用当前开发流程的 UID
                            variables[processConst.designProposalProcess.template.is_jd] = processConst.jdStatusList.FALSE // 区分非京东链路标识，涉及爆款方案流程，为爆款方案流程模板字段 is_jd 赋值
                            variables[processConst.designProposalProcess.template.name] = process[i].name // 涉及爆款方案流程，为爆款方案流程模板字段 name 赋值
                            variables[processConst.designProposalProcess.template.division] = division?.content // 涉及爆款方案流程，为爆款方案流程模板字段 division 赋值
                            variables[processConst.designProposalProcess.template.first_select] = first_select // 涉及爆款方案流程，为爆款方案流程模板字段 first_select 赋值
                            variables[processConst.designProposalProcess.template.second_select] = second_select // 涉及爆款方案流程，为爆款方案流程模板字段 second_select 赋值
                            variables[processConst.designProposalProcess.template.third_select] = third_select // 涉及爆款方案流程，为爆款方案流程模板字段 third_select 赋值
                            robotStartProcess(processConst.designProposalProcess.name, processConst.designProposalProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及爆款方案流程
                            process_status.push(processConst.statusList.DESIGN_PROPOSAL) // 记录爆款方案状态以便回写，处理爆款方案状态
                        } // 结束当前逻辑块
                    } else if ([3,4].includes(instance[0].status)) { // 判断流程是否处于驳回或终止状态
                        developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid) // 当子流程结束时同步主流程为完成状态，将非京东流程状态标记为完成，将非京东流程标记为已完成，使用当前开发流程的 UID
                    } else { // 进入新的逻辑块
                        process_ids.push(instance[0].process_id) // 收集需要回写状态的流程实例 ID
                        process_status.push(processConst.statusList.REVIEW) // 记录企划审核状态以便回写，处理企划审核状态
                    } // 结束当前逻辑块
                } else logger.error(`企划审核流程触发失败, uid=${process[i].uid}`) // 使用当前开发流程的 UID
            } // 结束当前逻辑块
            if (process[i].status.indexOf(processConst.statusList.DESIGN_PROPOSAL) != -1) { // 处理爆款方案状态，判断非京东状态列表中是否包含目标状态
                let instance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                    process[i].uid, // 使用当前开发流程的 UID
                    processConst.designProposalProcess.key, // 涉及爆款方案流程
                    processConst.designProposalProcess.template.is_jd, // 涉及爆款方案流程，为爆款方案流程模板字段 is_jd 赋值
                    processConst.jdStatusList.FALSE) // 区分非京东链路标识
                if (instance?.length) { // 根据条件执行不同逻辑
                    if (instance[0].status == 2) { // 判断流程状态是否为通过
                        // 更新爆款方案负责人，触发视觉流程，非京东订货流程
                        let operator = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                            instance[0].process_id, processConst.designProposalProcess.column.operator) // 获取爆款方案流程的负责人，涉及爆款方案流程，读取爆款方案流程字段 operator
                        if (operator) developmentProcessesRepo.updateColumnByUid( // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表
                            process[i].uid, 'operator', operator.content) // 使用当前开发流程的 UID
                        let link_type = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                            instance[0].process_id, processConst.designProposalProcess.column.link_type) // 获取爆款方案流程的链接类型，涉及爆款方案流程，读取爆款方案流程字段 link_type
                        let visionDesignInstance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                            process[i].uid, // 使用当前开发流程的 UID
                            processConst.visionDesignProcess.key, // 涉及视觉流程
                            processConst.visionDesignProcess.template.is_jd, // 涉及视觉流程，为视觉流程模板字段 is_jd 赋值
                            processConst.jdStatusList.FALSE) // 区分非京东链路标识
                        if (!visionDesignInstance?.length) { // 根据条件执行不同逻辑
                            let variables = {} // 初始化流程变量容器，声明局部变量
                            variables[processConst.designProposalProcess.template.link] = processConst.previousUrl + process[i].uid // 拼接流程跳转链接并附带当前 UID，涉及爆款方案流程，为爆款方案流程模板字段 link 赋值，拼接流程详情页面链接，使用当前开发流程的 UID
                            variables[processConst.designProposalProcess.template.uid] = process[i].uid // 涉及爆款方案流程，为爆款方案流程模板字段 uid 赋值，使用当前开发流程的 UID
                            variables[processConst.designProposalProcess.template.is_jd] = processConst.jdStatusList.FALSE // 区分非京东链路标识，涉及爆款方案流程，为爆款方案流程模板字段 is_jd 赋值
                            variables[processConst.designProposalProcess.template.name] = process[i].name // 涉及爆款方案流程，为爆款方案流程模板字段 name 赋值
                            variables[processConst.designProposalProcess.template.vision_type] = process[i].vision_type // 涉及爆款方案流程，为爆款方案流程模板字段 vision_type 赋值
                            variables[processConst.designProposalProcess.template.project] = JSON.parse(process[i].select_project) // 涉及爆款方案流程，为爆款方案流程模板字段 project 赋值，解析 JSON 字符串获取结构化数据
                            variables[processConst.designProposalProcess.template.link_type] = link_type?.content // 涉及爆款方案流程，为爆款方案流程模板字段 link_type 赋值
                            variables[processConst.designProposalProcess.template.developer] = process[i].developer // 涉及爆款方案流程，为爆款方案流程模板字段 developer 赋值
                            variables[processConst.designProposalProcess.template.image] = JSON.parse(process[i].image) // 涉及爆款方案流程，为爆款方案流程模板字段 image 赋值，解析 JSON 字符串获取结构化数据
                            if (process[i].vision_type != '非原创') { // 根据条件执行不同逻辑
                                variables[processConst.designProposalProcess.template.operator] = operator?.content // 涉及爆款方案流程，为爆款方案流程模板字段 operator 赋值
                                robotStartProcess(processConst.designProposalProcess.name, processConst.designProposalProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及爆款方案流程
                                process_status.push(processConst.statusList.DESIGN_PROPOSAL) // 记录爆款方案状态以便回写，处理爆款方案状态
                            } else { // 执行流程相关操作
                                let analysisInstance = await processesRepo.getProcessByUid( // 根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                                    process[i].uid, // 使用当前开发流程的 UID
                                    processConst.analysisProcess.key) // 涉及非京东分析流程
                                if (analysisInstance?.length) { // 根据条件执行不同逻辑
                                    if (process[i].first_select == processConst.analysisStatusList.TRUE) { // 判断是否选中
                                        let first = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                            analysisInstance[0].process_id, processConst.analysisProcess.column.first_operator) // 涉及非京东分析流程，读取非京东分析流程字段 first_operator
                                        variables[processConst.designProposalProcess.template.operator] = first?.content // 涉及爆款方案流程，为爆款方案流程模板字段 operator 赋值
                                        robotStartProcess(processConst.designProposalProcess.name, processConst.designProposalProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及爆款方案流程
                                    } // 结束当前逻辑块
                                    if (process[i].second_select == processConst.analysisStatusList.TRUE) { // 判断是否选中
                                        let second = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                            analysisInstance[0].process_id, processConst.analysisProcess.column.second_operator) // 涉及非京东分析流程，读取非京东分析流程字段 second_operator
                                        variables[processConst.designProposalProcess.template.operator] = second?.content // 涉及爆款方案流程，为爆款方案流程模板字段 operator 赋值
                                        robotStartProcess(processConst.designProposalProcess.name, processConst.designProposalProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及爆款方案流程
                                    } // 结束当前逻辑块
                                    if (process[i].third_select == processConst.analysisStatusList.TRUE) { // 判断是否选中
                                        let third = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                            analysisInstance[0].process_id, processConst.analysisProcess.column.third_operator) // 涉及非京东分析流程，读取非京东分析流程字段 third_operator
                                        variables[processConst.designProposalProcess.template.operator] = third?.content // 涉及爆款方案流程，为爆款方案流程模板字段 operator 赋值
                                        robotStartProcess(processConst.designProposalProcess.name, processConst.designProposalProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及爆款方案流程
                                    } // 结束当前逻辑块
                                    process_status.push(processConst.statusList.DESIGN_PROPOSAL) // 记录爆款方案状态以便回写，处理爆款方案状态
                                } // 结束当前逻辑块
                            } // 结束当前逻辑块
                        } // 结束当前逻辑块
                        let purchaseInstance = await processesRepo.getProcessByUid( // 根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                            process[i].uid, // 使用当前开发流程的 UID
                            processConst.purchaseProcess.key) // 涉及非京东订货流程
                        if (!purchaseInstance?.length) { // 根据条件执行不同逻辑
                            let variables = {} // 初始化流程变量容器，声明局部变量
                            variables[processConst.purchaseProcess.template.link] = processConst.previousUrl + process[i].uid // 拼接流程跳转链接并附带当前 UID，涉及非京东订货流程，为非京东订货流程模板字段 link 赋值，拼接流程详情页面链接，使用当前开发流程的 UID
                            variables[processConst.purchaseProcess.template.uid] = process[i].uid // 涉及非京东订货流程，为非京东订货流程模板字段 uid 赋值，使用当前开发流程的 UID
                            variables[processConst.purchaseProcess.template.type] = process[i].type // 涉及非京东订货流程，为非京东订货流程模板字段 type 赋值
                            variables[processConst.purchaseProcess.template.purchase_type] = process[i].purchase_type // 涉及非京东订货流程，为非京东订货流程模板字段 purchase_type 赋值
                            variables[processConst.purchaseProcess.template.developer] = process[i].developer // 涉及非京东订货流程，为非京东订货流程模板字段 developer 赋值
                            variables[processConst.purchaseProcess.template.first_select] = process[i].first_select // 涉及非京东订货流程，为非京东订货流程模板字段 first_select 赋值
                            variables[processConst.purchaseProcess.template.second_select] = process[i].second_select // 涉及非京东订货流程，为非京东订货流程模板字段 second_select 赋值
                            variables[processConst.purchaseProcess.template.third_select] = process[i].third_select // 涉及非京东订货流程，为非京东订货流程模板字段 third_select 赋值
                            robotStartProcess(processConst.purchaseProcess.name, processConst.purchaseProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及非京东订货流程
                            process_status.push(processConst.statusList.PURCHASE) // 记录订货流程状态以便回写，处理订货状态
                        } // 结束当前逻辑块
                    } else if ([3,4].includes(instance[0].status)) { // 判断流程是否处于驳回或终止状态
                        developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid) // 当子流程结束时同步主流程为完成状态，将非京东流程状态标记为完成，将非京东流程标记为已完成，使用当前开发流程的 UID
                    } else { // 进入新的逻辑块
                        process_ids.push(instance[0].process_id) // 收集需要回写状态的流程实例 ID
                        process_status.push(processConst.statusList.DESIGN_PROPOSAL) // 记录爆款方案状态以便回写，处理爆款方案状态
                    } // 结束当前逻辑块
                } else logger.error(`爆款流程触发失败, uid=${process[i].uid}`) // 使用当前开发流程的 UID
            } // 结束当前逻辑块
            if (process[i].status.indexOf(processConst.statusList.VISION_DESIGN) != -1) { // 处理视觉流程状态，判断非京东状态列表中是否包含目标状态
                let instance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                    process[i].uid, // 使用当前开发流程的 UID
                    processConst.visionDesignProcess.key, // 涉及视觉流程
                    processConst.visionDesignProcess.template.is_jd, // 涉及视觉流程，为视觉流程模板字段 is_jd 赋值
                    processConst.jdStatusList.FALSE) // 区分非京东链路标识
                if (instance?.length) { // 根据条件执行不同逻辑
                    if ([2,3,4].includes(instance[0].status)) { // 根据条件执行不同逻辑
                        let purchaseInstance = await processesRepo.getFirstShelfProcess( // 获取事业一部上架流程实例，等待异步结果返回，声明局部变量
                            process[i].uid, // 使用当前开发流程的 UID
                            processConst.purchaseProcess.key) // 涉及非京东订货流程
                        if (purchaseInstance?.length && purchaseInstance[0].status == 2) { // 根据条件执行不同逻辑
                            // 触发上架流程
                            let designProposalInstance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                                process[i].uid, // 使用当前开发流程的 UID
                                processConst.designProposalProcess.key, // 涉及爆款方案流程
                                processConst.designProposalProcess.template.is_jd, // 涉及爆款方案流程，为爆款方案流程模板字段 is_jd 赋值
                                processConst.jdStatusList.FALSE) // 区分非京东链路标识
                            let link_type = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                designProposalInstance[0].process_id, processConst.designProposalProcess.column.link_type) // 获取爆款方案流程的链接类型，涉及爆款方案流程，读取爆款方案流程字段 link_type
                            if (process[i].first_select == processConst.analysisStatusList.TRUE) { // 判断是否选中
                                let project = [] // 声明局部变量
                                if (process[i].select_project.indexOf('拼多多') != -1) project.push('拼多多') // 根据条件执行不同逻辑
                                if (process[i].select_project.indexOf('天猫超市') != -1) project.push('天猫超市') // 根据条件执行不同逻辑
                                if (process[i].select_project.indexOf('Coupang') != -1) project.push('Coupang') // 根据条件执行不同逻辑
                                let variables = {} // 初始化流程变量容器，声明局部变量
                                variables[processConst.shelfProcess.template.link] = processConst.previousUrl + process[i].uid // 拼接流程跳转链接并附带当前 UID，涉及上架流程，为上架流程模板字段 link 赋值，拼接流程详情页面链接，使用当前开发流程的 UID
                                variables[processConst.shelfProcess.template.uid] = process[i].uid // 涉及上架流程，为上架流程模板字段 uid 赋值，使用当前开发流程的 UID
                                variables[processConst.shelfProcess.template.project] = project // 涉及上架流程，为上架流程模板字段 project 赋值
                                variables[processConst.shelfProcess.template.developer] = process[i].developer // 涉及上架流程，为上架流程模板字段 developer 赋值
                                variables[processConst.shelfProcess.template.link_type] = link_type?.content // 涉及上架流程，为上架流程模板字段 link_type 赋值
                                robotStartProcess(processConst.shelfProcess.name, processConst.shelfProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及上架流程
                                process_status.push(processConst.statusList.FIRST_SHELF) // 记录事业一部上架状态以便回写，处理事业一部上架状态
                            } // 结束当前逻辑块
                            if (process[i].second_select == processConst.analysisStatusList.TRUE) { // 判断是否选中
                                let project = [] // 声明局部变量
                                if (process[i].select_project.indexOf('抖音') != -1) project.push('抖音') // 根据条件执行不同逻辑
                                if (process[i].select_project.indexOf('快手') != -1) project.push('快手') // 根据条件执行不同逻辑
                                if (process[i].select_project.indexOf('得物') != -1) project.push('得物') // 根据条件执行不同逻辑
                                if (process[i].select_project.indexOf('唯品会') != -1) project.push('唯品会') // 根据条件执行不同逻辑
                                if (process[i].select_project.indexOf('1688') != -1) project.push('1688') // 根据条件执行不同逻辑
                                let variables = {} // 初始化流程变量容器，声明局部变量
                                variables[processConst.shelfProcess.template.link] = processConst.previousUrl + process[i].uid // 拼接流程跳转链接并附带当前 UID，涉及上架流程，为上架流程模板字段 link 赋值，拼接流程详情页面链接，使用当前开发流程的 UID
                                variables[processConst.shelfProcess.template.uid] = process[i].uid // 涉及上架流程，为上架流程模板字段 uid 赋值，使用当前开发流程的 UID
                                variables[processConst.shelfProcess.template.project] = project // 涉及上架流程，为上架流程模板字段 project 赋值
                                variables[processConst.shelfProcess.template.developer] = process[i].developer // 涉及上架流程，为上架流程模板字段 developer 赋值
                                variables[processConst.shelfProcess.template.link_type] = link_type?.content // 涉及上架流程，为上架流程模板字段 link_type 赋值
                                robotStartProcess(processConst.shelfProcess.name, processConst.shelfProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及上架流程
                                process_status.push(processConst.statusList.SECOND_SHELF) // 记录事业二部上架状态以便回写，处理事业二部上架状态
                            } // 结束当前逻辑块
                            if (process[i].third_select == processConst.analysisStatusList.TRUE) { // 判断是否选中
                                let project = [] // 声明局部变量
                                if (process[i].select_project.indexOf('天猫') != -1) project.push('天猫') // 根据条件执行不同逻辑
                                if (process[i].select_project.indexOf('淘工厂') != -1) project.push('淘工厂') // 根据条件执行不同逻辑
                                if (process[i].select_project.indexOf('小红书') != -1) project.push('小红书') // 根据条件执行不同逻辑
                                let variables = {} // 初始化流程变量容器，声明局部变量
                                variables[processConst.shelfProcess.template.link] = processConst.previousUrl + process[i].uid // 拼接流程跳转链接并附带当前 UID，涉及上架流程，为上架流程模板字段 link 赋值，拼接流程详情页面链接，使用当前开发流程的 UID
                                variables[processConst.shelfProcess.template.uid] = process[i].uid // 涉及上架流程，为上架流程模板字段 uid 赋值，使用当前开发流程的 UID
                                variables[processConst.shelfProcess.template.project] = project // 涉及上架流程，为上架流程模板字段 project 赋值
                                variables[processConst.shelfProcess.template.developer] = process[i].developer // 涉及上架流程，为上架流程模板字段 developer 赋值
                                variables[processConst.shelfProcess.template.link_type] = link_type?.content // 涉及上架流程，为上架流程模板字段 link_type 赋值
                                robotStartProcess(processConst.shelfProcess.name, processConst.shelfProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及上架流程
                                process_status.push(processConst.statusList.THIRD_SHELF) // 记录事业三部上架状态以便回写，处理事业三部上架状态
                            } // 结束当前逻辑块
                        } // 结束当前逻辑块
                    } else { // 进入新的逻辑块
                        process_ids.push(instance[0].process_id) // 收集需要回写状态的流程实例 ID
                        process_status.push(processConst.statusList.VISION_DESIGN) // 记录视觉流程状态以便回写，处理视觉流程状态
                    } // 结束当前逻辑块
                } else logger.error(`视觉流程触发失败, uid=${process[i].uid}`) // 使用当前开发流程的 UID
            } // 结束当前逻辑块
            if (process[i].status.indexOf(processConst.statusList.PURCHASE) != -1) { // 处理订货状态，判断非京东状态列表中是否包含目标状态
                let instance = await processesRepo.getProcessByUid( // 根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                    process[i].uid, // 使用当前开发流程的 UID
                    processConst.purchaseProcess.key) // 涉及非京东订货流程
                if (instance?.length) { // 根据条件执行不同逻辑
                    if (instance[0].status == 2) { // 判断流程状态是否为通过
                        let visionDesignInstance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                            process[i].uid, // 使用当前开发流程的 UID
                            processConst.visionDesignProcess.key, // 涉及视觉流程
                            processConst.visionDesignProcess.template.is_jd, // 涉及视觉流程，为视觉流程模板字段 is_jd 赋值
                            processConst.jdStatusList.FALSE) // 区分非京东链路标识
                        // 更新订货数量
                        let order_num = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                            instance[0].process_id, processConst.purchaseProcess.column.order_num) // 获取订货流程的订货数量，涉及非京东订货流程，读取非京东订货流程字段 order_num
                        if (order_num) developmentProcessesRepo.updateColumnByUid(process[i].uid, 'order_num', order_num.content) // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
                        if (!visionDesignInstance?.length && [2,3,4].includes(visionDesignInstance[0].status)) { // 根据条件执行不同逻辑
                            // 触发上架流程
                            if (process[i].first_select == processConst.analysisStatusList.TRUE) { // 判断是否选中
                                let project = [] // 声明局部变量
                                if (process[i].select_project.indexOf('拼多多') != -1) project.push('拼多多') // 根据条件执行不同逻辑
                                if (process[i].select_project.indexOf('天猫超市') != -1) project.push('天猫超市') // 根据条件执行不同逻辑
                                if (process[i].select_project.indexOf('Coupang') != -1) project.push('Coupang') // 根据条件执行不同逻辑
                                let variables = {} // 初始化流程变量容器，声明局部变量
                                variables[processConst.shelfProcess.template.link] = processConst.previousUrl + process[i].uid // 拼接流程跳转链接并附带当前 UID，涉及上架流程，为上架流程模板字段 link 赋值，拼接流程详情页面链接，使用当前开发流程的 UID
                                variables[processConst.shelfProcess.template.uid] = process[i].uid // 涉及上架流程，为上架流程模板字段 uid 赋值，使用当前开发流程的 UID
                                variables[processConst.shelfProcess.template.project] = project // 涉及上架流程，为上架流程模板字段 project 赋值
                                variables[processConst.shelfProcess.template.developer] = process[i].developer // 涉及上架流程，为上架流程模板字段 developer 赋值
                                variables[processConst.shelfProcess.template.link_type] = process[i].link_type // 涉及上架流程，为上架流程模板字段 link_type 赋值
                                robotStartProcess(processConst.shelfProcess.name, processConst.shelfProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及上架流程
                                process_status.push(processConst.statusList.FIRST_SHELF) // 记录事业一部上架状态以便回写，处理事业一部上架状态
                            } // 结束当前逻辑块
                            if (process[i].second_select == processConst.analysisStatusList.TRUE) { // 判断是否选中
                                let project = [] // 声明局部变量
                                if (process[i].select_project.indexOf('抖音') != -1) project.push('抖音') // 根据条件执行不同逻辑
                                if (process[i].select_project.indexOf('快手') != -1) project.push('快手') // 根据条件执行不同逻辑
                                if (process[i].select_project.indexOf('得物') != -1) project.push('得物') // 根据条件执行不同逻辑
                                if (process[i].select_project.indexOf('唯品会') != -1) project.push('唯品会') // 根据条件执行不同逻辑
                                if (process[i].select_project.indexOf('1688') != -1) project.push('1688') // 根据条件执行不同逻辑
                                let variables = {} // 初始化流程变量容器，声明局部变量
                                variables[processConst.shelfProcess.template.link] = processConst.previousUrl + process[i].uid // 拼接流程跳转链接并附带当前 UID，涉及上架流程，为上架流程模板字段 link 赋值，拼接流程详情页面链接，使用当前开发流程的 UID
                                variables[processConst.shelfProcess.template.uid] = process[i].uid // 涉及上架流程，为上架流程模板字段 uid 赋值，使用当前开发流程的 UID
                                variables[processConst.shelfProcess.template.project] = project // 涉及上架流程，为上架流程模板字段 project 赋值
                                variables[processConst.shelfProcess.template.developer] = process[i].developer // 涉及上架流程，为上架流程模板字段 developer 赋值
                                variables[processConst.shelfProcess.template.link_type] = process[i].link_type // 涉及上架流程，为上架流程模板字段 link_type 赋值
                                robotStartProcess(processConst.shelfProcess.name, processConst.shelfProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及上架流程
                                process_status.push(processConst.statusList.SECOND_SHELF) // 记录事业二部上架状态以便回写，处理事业二部上架状态
                            } // 结束当前逻辑块
                            if (process[i].third_select == processConst.analysisStatusList.TRUE) { // 判断是否选中
                                let project = [] // 声明局部变量
                                if (process[i].select_project.indexOf('天猫') != -1) project.push('天猫') // 根据条件执行不同逻辑
                                if (process[i].select_project.indexOf('淘工厂') != -1) project.push('淘工厂') // 根据条件执行不同逻辑
                                if (process[i].select_project.indexOf('小红书') != -1) project.push('小红书') // 根据条件执行不同逻辑
                                let variables = {} // 初始化流程变量容器，声明局部变量
                                variables[processConst.shelfProcess.template.link] = processConst.previousUrl + process[i].uid // 拼接流程跳转链接并附带当前 UID，涉及上架流程，为上架流程模板字段 link 赋值，拼接流程详情页面链接，使用当前开发流程的 UID
                                variables[processConst.shelfProcess.template.uid] = process[i].uid // 涉及上架流程，为上架流程模板字段 uid 赋值，使用当前开发流程的 UID
                                variables[processConst.shelfProcess.template.project] = project // 涉及上架流程，为上架流程模板字段 project 赋值
                                variables[processConst.shelfProcess.template.developer] = process[i].developer // 涉及上架流程，为上架流程模板字段 developer 赋值
                                variables[processConst.shelfProcess.template.link_type] = process[i].link_type // 涉及上架流程，为上架流程模板字段 link_type 赋值
                                robotStartProcess(processConst.shelfProcess.name, processConst.shelfProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及上架流程
                                process_status.push(processConst.statusList.THIRD_SHELF) // 记录事业三部上架状态以便回写，处理事业三部上架状态
                            } // 结束当前逻辑块
                        } // 结束当前逻辑块
                    } else if ([3,4].includes(instance[0].status)) { // 判断流程是否处于驳回或终止状态
                        developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid) // 当子流程结束时同步主流程为完成状态，将非京东流程状态标记为完成，将非京东流程标记为已完成，使用当前开发流程的 UID
                    } else { // 进入新的逻辑块
                        process_ids.push(instance[0].process_id) // 收集需要回写状态的流程实例 ID
                        process_status.push(processConst.statusList.PURCHASE) // 记录订货流程状态以便回写，处理订货状态
                    } // 结束当前逻辑块
                } else logger.error(`非京东订货流程触发失败, uid=${process[i].uid}`) // 使用当前开发流程的 UID
            } // 结束当前逻辑块
            if (process[i].status.indexOf(processConst.statusList.FIRST_SHELF) != -1) { // 处理事业一部上架状态，判断非京东状态列表中是否包含目标状态
                let instance = await processesRepo.getFirstShelfProcess( // 获取事业一部上架流程实例，等待异步结果返回，声明局部变量
                    process[i].uid, // 使用当前开发流程的 UID
                    processConst.shelfProcess.key) // 涉及上架流程
                if (instance?.length) { // 根据条件执行不同逻辑
                    if (instance[0].status == 2) { // 判断流程状态是否为通过
                        let secondInstance = await processesRepo.getSecondShelfProcess( // 获取事业二部上架流程实例，等待异步结果返回，声明局部变量
                            process[i].uid, // 使用当前开发流程的 UID
                            processConst.purchaseProcess.key) // 涉及非京东订货流程
                        let thirdInstance = await processesRepo.getThirdShelfProcess( // 获取事业三部上架流程实例，等待异步结果返回，声明局部变量
                            process[i].uid, // 使用当前开发流程的 UID
                            processConst.purchaseProcess.key) // 涉及非京东订货流程
                        let first_goods_id = '' // 声明局部变量
                        let pdd = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                            instance[0].process_id, processConst.shelfProcess.column.pdd) // 读取事业一部上架的拼多多货号，涉及上架流程，读取上架流程字段 pdd
                        if (pdd) first_goods_id = `${first_goods_id}拼多多:${pdd.content};` // 根据条件执行不同逻辑
                        let tmcs = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                            instance[0].process_id, processConst.shelfProcess.column.tmcs) // 读取事业一部上架的天猫超市货号，读取事业三部上架的天猫货号，涉及上架流程，读取上架流程字段 tmcs
                        if (tmcs) first_goods_id = `${first_goods_id}天猫超市:${tmcs.content};` // 根据条件执行不同逻辑
                        let coupang = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                            instance[0].process_id, processConst.shelfProcess.column.coupang) // 读取事业一部上架的 Coupang 货号，涉及上架流程，读取上架流程字段 coupang
                        if (coupang) first_goods_id = `${first_goods_id}coupang:${coupang.content};` // 根据条件执行不同逻辑
                        developmentProcessesRepo.updateColumnByUid(process[i].uid, 'first_goods_id', first_goods_id) // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
                        if ((!secondInstance?.length || (secondInstance?.length && // 根据条件执行不同逻辑
                                [2,3,4].includes(secondInstance[0].status))) && // 执行流程相关操作
                            (!thirdInstance?.length || (thirdInstance?.length && // 执行流程相关操作
                                [2,3,4].includes(thirdInstance[0].status)))) { // 进入新的逻辑块
                            developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid) // 当子流程结束时同步主流程为完成状态，将非京东流程状态标记为完成，将非京东流程标记为已完成，使用当前开发流程的 UID
                        } // 结束当前逻辑块
                    } else if ([3,4].includes(instance[0].status)) { // 判断流程是否处于驳回或终止状态
                        let secondInstance = await processesRepo.getSecondShelfProcess( // 获取事业二部上架流程实例，等待异步结果返回，声明局部变量
                            process[i].uid, // 使用当前开发流程的 UID
                            processConst.purchaseProcess.key) // 涉及非京东订货流程
                        let thirdInstance = await processesRepo.getThirdShelfProcess( // 获取事业三部上架流程实例，等待异步结果返回，声明局部变量
                            process[i].uid, // 使用当前开发流程的 UID
                            processConst.purchaseProcess.key) // 涉及非京东订货流程
                        if ((!secondInstance?.length || (secondInstance?.length && // 根据条件执行不同逻辑
                                [2,3,4].includes(secondInstance[0].status))) && // 执行流程相关操作
                            (!thirdInstance?.length || (thirdInstance?.length && // 执行流程相关操作
                                [2,3,4].includes(thirdInstance[0].status)))) { // 进入新的逻辑块
                            developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid) // 当子流程结束时同步主流程为完成状态，将非京东流程状态标记为完成，将非京东流程标记为已完成，使用当前开发流程的 UID
                        } // 结束当前逻辑块
                    } else { // 进入新的逻辑块
                        process_ids.push(instance[0].process_id) // 收集需要回写状态的流程实例 ID
                        process_status.push(processConst.statusList.FIRST_SHELF) // 记录事业一部上架状态以便回写，处理事业一部上架状态
                    } // 结束当前逻辑块
                } else logger.error(`事业1部上架流程触发失败, uid=${process[i].uid}`) // 使用当前开发流程的 UID
            } // 结束当前逻辑块
            if (process[i].status.indexOf(processConst.statusList.SECOND_SHELF) != -1) { // 处理事业二部上架状态，判断非京东状态列表中是否包含目标状态
                let instance = await processesRepo.getSecondShelfProcess( // 获取事业二部上架流程实例，等待异步结果返回，声明局部变量
                    process[i].uid, // 使用当前开发流程的 UID
                    processConst.shelfProcess.key) // 涉及上架流程
                if (instance?.length) { // 根据条件执行不同逻辑
                    if (instance[0].status == 2) { // 判断流程状态是否为通过
                        let firstInstance = await processesRepo.getFirstShelfProcess( // 获取事业一部上架流程实例，等待异步结果返回，声明局部变量
                            process[i].uid, // 使用当前开发流程的 UID
                            processConst.purchaseProcess.key) // 涉及非京东订货流程
                        let thirdInstance = await processesRepo.getThirdShelfProcess( // 获取事业三部上架流程实例，等待异步结果返回，声明局部变量
                            process[i].uid, // 使用当前开发流程的 UID
                            processConst.purchaseProcess.key) // 涉及非京东订货流程
                        let second_goods_id = '' // 声明局部变量
                        let dy = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                            instance[0].process_id, processConst.shelfProcess.column.dy) // 读取事业二部上架的抖音货号，涉及上架流程，读取上架流程字段 dy
                        if (dy) second_goods_id = `${second_goods_id}抖音:${dy.content};` // 根据条件执行不同逻辑
                        let ks = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                            instance[0].process_id, processConst.shelfProcess.column.ks) // 读取事业二部上架的快手货号，涉及上架流程，读取上架流程字段 ks
                        if (ks) second_goods_id = `${second_goods_id}快手:${ks.content};` // 根据条件执行不同逻辑
                        let dw = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                            instance[0].process_id, processConst.shelfProcess.column.dw) // 读取事业二部上架的得物货号，涉及上架流程，读取上架流程字段 dw
                        if (dw) second_goods_id = `${second_goods_id}得物:${dw.content};` // 根据条件执行不同逻辑
                        let vip = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                            instance[0].process_id, processConst.shelfProcess.column.vip) // 读取事业二部上架的唯品会货号，涉及上架流程，读取上架流程字段 vip
                        if (vip) second_goods_id = `${second_goods_id}唯品会:${vip.content};` // 根据条件执行不同逻辑
                        let ex = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                            instance[0].process_id, processConst.shelfProcess.column['1688']) // 读取事业二部上架的 1688 货号，涉及上架流程
                        if (ex) second_goods_id = `${second_goods_id}1688:${ex.content};` // 根据条件执行不同逻辑
                        developmentProcessesRepo.updateColumnByUid(process[i].uid, 'second_goods_id', second_goods_id) // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
                        if ((!firstInstance?.length || (firstInstance?.length && // 根据条件执行不同逻辑
                                [2,3,4].includes(firstInstance[0].status))) && // 执行流程相关操作
                            (!thirdInstance?.length || (thirdInstance?.length && // 执行流程相关操作
                                [2,3,4].includes(thirdInstance[0].status)))) { // 进入新的逻辑块
                            developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid) // 当子流程结束时同步主流程为完成状态，将非京东流程状态标记为完成，将非京东流程标记为已完成，使用当前开发流程的 UID
                        } // 结束当前逻辑块
                    } else if ([3,4].includes(instance[0].status)) { // 判断流程是否处于驳回或终止状态
                        let firstInstance = await processesRepo.getFirstShelfProcess( // 获取事业一部上架流程实例，等待异步结果返回，声明局部变量
                            process[i].uid, // 使用当前开发流程的 UID
                            processConst.purchaseProcess.key) // 涉及非京东订货流程
                        let thirdInstance = await processesRepo.getThirdShelfProcess( // 获取事业三部上架流程实例，等待异步结果返回，声明局部变量
                            process[i].uid, // 使用当前开发流程的 UID
                            processConst.purchaseProcess.key) // 涉及非京东订货流程
                        if ((!firstInstance?.length || (firstInstance?.length && // 根据条件执行不同逻辑
                                [2,3,4].includes(firstInstance[0].status))) && // 执行流程相关操作
                            (!thirdInstance?.length || (thirdInstance?.length && // 执行流程相关操作
                                [2,3,4].includes(thirdInstance[0].status)))) { // 进入新的逻辑块
                            developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid) // 当子流程结束时同步主流程为完成状态，将非京东流程状态标记为完成，将非京东流程标记为已完成，使用当前开发流程的 UID
                        } // 结束当前逻辑块
                    } else { // 进入新的逻辑块
                        process_ids.push(instance[0].process_id) // 收集需要回写状态的流程实例 ID
                        process_status.push(processConst.statusList.SECOND_SHELF) // 记录事业二部上架状态以便回写，处理事业二部上架状态
                    } // 结束当前逻辑块
                } else logger.error(`事业2部上架流程触发失败, uid=${process[i].uid}`) // 使用当前开发流程的 UID
            } // 结束当前逻辑块
            if (process[i].status.indexOf(processConst.statusList.THIRD_SHELF) != -1) { // 处理事业三部上架状态，判断非京东状态列表中是否包含目标状态
                let instance = await processesRepo.getThirdShelfProcess( // 获取事业三部上架流程实例，等待异步结果返回，声明局部变量
                    process[i].uid, // 使用当前开发流程的 UID
                    processConst.shelfProcess.key) // 涉及上架流程
                if (instance?.length) { // 根据条件执行不同逻辑
                    if (instance[0].status == 2) { // 判断流程状态是否为通过
                        let secondInstance = await processesRepo.getSecondShelfProcess( // 获取事业二部上架流程实例，等待异步结果返回，声明局部变量
                            process[i].uid, // 使用当前开发流程的 UID
                            processConst.purchaseProcess.key) // 涉及非京东订货流程
                        let firstInstance = await processesRepo.getFirstShelfProcess( // 获取事业一部上架流程实例，等待异步结果返回，声明局部变量
                            process[i].uid, // 使用当前开发流程的 UID
                            processConst.purchaseProcess.key) // 涉及非京东订货流程
                        let third_goods_id = '' // 声明局部变量
                        let xhs = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                            instance[0].process_id, processConst.shelfProcess.column.pdxhsd) // 读取事业三部上架的小红书货号，涉及上架流程，读取上架流程字段 pdxhsd
                        if (xhs) third_goods_id = `${third_goods_id}小红书:${xhs.content};` // 根据条件执行不同逻辑
                        let tm = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                            instance[0].process_id, processConst.shelfProcess.column.tm) // 读取事业三部上架的天猫货号，涉及上架流程，读取上架流程字段 tm
                        if (tm) third_goods_id = `${third_goods_id}天猫:${tm.content};` // 根据条件执行不同逻辑
                        let tgc = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                            instance[0].process_id, processConst.shelfProcess.column.tgc) // 读取事业三部上架的淘工厂货号，涉及上架流程，读取上架流程字段 tgc
                        if (tgc) third_goods_id = `${third_goods_id}淘工厂:${coupang.tgc};` // 根据条件执行不同逻辑
                        developmentProcessesRepo.updateColumnByUid(process[i].uid, 'third_goods_id', third_goods_id) // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
                        if ((!secondInstance?.length || (secondInstance?.length && // 根据条件执行不同逻辑
                                [2,3,4].includes(secondInstance[0].status))) && // 执行流程相关操作
                            (!firstInstance?.length || (firstInstance?.length && // 执行流程相关操作
                                [2,3,4].includes(firstInstance[0].status)))) { // 进入新的逻辑块
                            developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid) // 当子流程结束时同步主流程为完成状态，将非京东流程状态标记为完成，将非京东流程标记为已完成，使用当前开发流程的 UID
                        } // 结束当前逻辑块
                    } else if ([3,4].includes(instance[0].status)) { // 判断流程是否处于驳回或终止状态
                        let secondInstance = await processesRepo.getSecondShelfProcess( // 获取事业二部上架流程实例，等待异步结果返回，声明局部变量
                            process[i].uid, // 使用当前开发流程的 UID
                            processConst.purchaseProcess.key) // 涉及非京东订货流程
                        let firstInstance = await processesRepo.getFirstShelfProcess( // 获取事业一部上架流程实例，等待异步结果返回，声明局部变量
                            process[i].uid, // 使用当前开发流程的 UID
                            processConst.purchaseProcess.key) // 涉及非京东订货流程
                        if ((!secondInstance?.length || (secondInstance?.length && // 根据条件执行不同逻辑
                                [2,3,4].includes(secondInstance[0].status))) && // 执行流程相关操作
                            (!firstInstance?.length || (firstInstance?.length && // 执行流程相关操作
                                [2,3,4].includes(firstInstance[0].status)))) { // 进入新的逻辑块
                            developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid) // 当子流程结束时同步主流程为完成状态，将非京东流程状态标记为完成，将非京东流程标记为已完成，使用当前开发流程的 UID
                        } // 结束当前逻辑块
                    } else { // 进入新的逻辑块
                        process_ids.push(instance[0].process_id) // 收集需要回写状态的流程实例 ID
                        process_status.push(processConst.statusList.THIRD_SHELF) // 记录事业三部上架状态以便回写，处理事业三部上架状态
                    } // 结束当前逻辑块
                } else logger.error(`事业3部上架流程触发失败, uid=${process[i].uid}`) // 使用当前开发流程的 UID
            } // 结束当前逻辑块
            if (process_ids?.length) { // 根据条件执行不同逻辑
                process_ids = process_ids.join('","') // 将流程实例 ID 数组拼接成查询用的字符串
                let tasks = await processTasksRepo.getRunningTasksByProcessId(process_ids) // 查询流程实例当前正在执行的任务节点，等待异步结果返回，声明局部变量
                let tasks_names = '' // 拼接运行节点名称信息，声明局部变量
                for (let j = 0; j < tasks.length; j++) { // 遍历集合执行批量逻辑
                    tasks_names = `${tasks_names}${tasks[i].process_title}:${tasks[i].title};` // 拼接运行节点名称信息
                } // 结束当前逻辑块
                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'running_node', tasks_names) // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
            } // 结束当前逻辑块
            if (process_status?.length) { // 根据条件执行不同逻辑
                process_status = process_status.join(',') // 将状态数组转换为逗号分隔的字符串
                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'status', process_status) // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
            } // 结束当前逻辑块
            console.log(process_ids, process_status) // 输出调试日志
        } // 结束当前逻辑块
        if (!process[i].jd_status) { // 进入京东流程状态分支
            let process_ids = [], process_status = [] // 初始化待回写的流程实例 ID 与状态集合，声明局部变量
            if (process[i].status.indexOf(processConst.statusList.DEVELOPMENT_CHECK) != -1) { // 处理开发审核状态，判断非京东状态列表中是否包含目标状态
                let instance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                    process[i].uid, // 使用当前开发流程的 UID
                    processConst.developCheckProcess.key, // 涉及开发审核流程
                    processConst.developCheckProcess.column.is_jd, // 涉及开发审核流程，读取开发审核流程字段 is_jd
                    processConst.jdStatusList.TRUE) // 区分京东链路标识
                if (instance?.length) { // 根据条件执行不同逻辑
                    if (instance[0].status == 2) { // 判断流程状态是否为通过
                        if ([processConst.typeList.IP, processConst.typeList.SELF].includes(process[i].type)) { // 针对IP 类型，针对自研类型，判断流程类型是否属于指定集合
                            // IP、自研触发寄样
                            let sampleInstance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                                process[i].uid, // 使用当前开发流程的 UID
                                processConst.sampleProcess.key, // 涉及寄样流程
                                processConst.sampleProcess.template.is_jd, // 涉及寄样流程，为寄样流程模板字段 is_jd 赋值
                                processConst.jdStatusList.TRUE) // 区分京东链路标识
                            if (!sampleInstance?.length) { // 根据条件执行不同逻辑
                                let variables = {}, user_id, developer_id // 初始化流程变量容器，声明局部变量
                                let starter = await systemUsersRepo.getID(process[i].starter) // 根据用户账号获取系统用户 ID，等待异步结果返回，声明局部变量
                                if (starter?.length) user_id = starter[0].id // 如果查询到流程发起人则记录其 ID
                                if (process[i].developer) { // 当已有开发人信息时直接查询对应用户
                                    let developer = await systemUsersRepo.getID(process[i].developer) // 根据用户账号获取系统用户 ID，等待异步结果返回，声明局部变量
                                    if (developer?.length) developer_id = developer[0].id // 若能找到开发人员则提取其系统 ID
                                } else { // 进入新的逻辑块
                                    // 更新开发人
                                    let user = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                        instance[0].process_id, processConst.developCheckProcess.column.developer.DEFAULT // 涉及开发审核流程，读取开发审核流程字段 developer
                                    ) // 执行流程相关操作
                                    process[i].developer = user.content // 将流程信息中的开发人回写到主流程记录
                                    developmentProcessesRepo.updateColumnByUid(process[i].uid, 'developer', user.content) // 将开发人字段同步到开发流程主表，回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
                                    let developer = await systemUsersRepo.getID(user.content) // 根据用户账号获取系统用户 ID，等待异步结果返回，声明局部变量
                                    if (developer?.length) developer_id = developer[0].id // 若能找到开发人员则提取其系统 ID
                                } // 结束当前逻辑块
                                variables[processConst.sampleProcess.template.link] = processConst.previousUrl + process[i].uid // 拼接业务详情链接用于寄样流程，拼接流程跳转链接并附带当前 UID，涉及寄样流程，为寄样流程模板字段 link 赋值，拼接流程详情页面链接，使用当前开发流程的 UID
                                variables[processConst.sampleProcess.template.uid] = process[i].uid // 传递业务流程 UID 给寄样流程，涉及寄样流程，为寄样流程模板字段 uid 赋值，使用当前开发流程的 UID
                                variables[processConst.sampleProcess.template.is_jd] = processConst.jdStatusList.TRUE // 标记寄样流程是否属于京东链路，区分京东链路标识，涉及寄样流程，为寄样流程模板字段 is_jd 赋值
                                variables[processConst.sampleProcess.template.starter] = user_id // 为寄样流程设置发起人 ID，涉及寄样流程，为寄样流程模板字段 starter 赋值
                                variables[processConst.sampleProcess.template.type] = process[i].type // 将业务类型传递给寄样流程，涉及寄样流程，为寄样流程模板字段 type 赋值
                                if (process[i].type == processConst.typeList.IP) // 针对IP 类型
                                    variables[processConst.sampleProcess.template.project] = process[i].project // 涉及寄样流程，为寄样流程模板字段 project 赋值
                                variables[processConst.sampleProcess.template.product_info] = JSON.parse(process[i].product_info) // 将产品信息 JSON 传递给寄样流程，涉及寄样流程，为寄样流程模板字段 product_info 赋值，解析 JSON 字符串获取结构化数据
                                variables[processConst.sampleProcess.template.developer] = developer_id // 传递开发人信息给寄样流程，涉及寄样流程，为寄样流程模板字段 developer 赋值
                                robotStartProcess(processConst.sampleProcess.name, processConst.sampleProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及寄样流程
                                process_status.push(processConst.statusList.SAMPLE) // 记录寄样状态以便回写，处理寄样状态
                            } // 结束当前逻辑块
                        } else if (process[i].type == processConst.typeList.SUPPLIER) { // 针对正推类型
                            // 正推触发京东分析，寄样
                            let analysisInstance = await processesRepo.getProcessByUid( // 根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                                process[i].uid, // 使用当前开发流程的 UID
                                processConst.jdAnalysisProcess.key) // 涉及京东分析流程
                            if (!analysisInstance?.length) { // 根据条件执行不同逻辑
                                let analysisVariables = JSON.parse(JSON.stringify(processConst.jdAnalysisProcess.template.SUPPLIER)) // 准备分析流程的模板变量，构建正推京东分析流程模板变量，涉及京东分析流程，为京东分析流程模板字段 SUPPLIER 赋值，声明局部变量，解析 JSON 字符串获取结构化数据，复制模板以避免原数据被修改
                                let variables = {} // 初始化流程变量容器，声明局部变量
                                for (let j = 0; j < analysisVariables.length; j++) { // 遍历集合执行批量逻辑
                                    variables[analysisVariables[j].key] = analysisVariables[j].type == 'array' ? // 执行赋值操作
                                        [process[i][analysisVariables[j].name]] : process[i][analysisVariables[j].name] // 执行流程相关操作
                                } // 结束当前逻辑块
                                robotStartProcess(processConst.jdAnalysisProcess.name, processConst.jdAnalysisProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及京东分析流程
                                process_status.push(processConst.statusList.ANALYSIS) // 记录非京东分析状态以便回写，处理非京东分析状态
                            } // 结束当前逻辑块
                            let sampleInstance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                                process[i].uid, // 使用当前开发流程的 UID
                                processConst.sampleProcess.key, // 涉及寄样流程
                                processConst.sampleProcess.template.is_jd, // 涉及寄样流程，为寄样流程模板字段 is_jd 赋值
                                processConst.jdStatusList.TRUE) // 区分京东链路标识
                            if (!sampleInstance?.length) { // 根据条件执行不同逻辑
                                let variables = {}, user_id, developer_id // 初始化流程变量容器，声明局部变量
                                let starter = await systemUsersRepo.getID(process[i].starter) // 根据用户账号获取系统用户 ID，等待异步结果返回，声明局部变量
                                if (starter?.length) user_id = starter[0].id // 如果查询到流程发起人则记录其 ID
                                if (process[i].developer) { // 当已有开发人信息时直接查询对应用户
                                    let developer = await systemUsersRepo.getID(process[i].developer) // 根据用户账号获取系统用户 ID，等待异步结果返回，声明局部变量
                                    if (developer?.length) developer_id = developer[0].id // 若能找到开发人员则提取其系统 ID
                                } else { // 进入新的逻辑块
                                    // 更新开发人
                                    let user = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                        instance[0].process_id, processConst.developCheckProcess.column.developer.DEFAULT // 涉及开发审核流程，读取开发审核流程字段 developer
                                    ) // 执行流程相关操作
                                    process[i].developer = user.content // 将流程信息中的开发人回写到主流程记录
                                    developmentProcessesRepo.updateColumnByUid(process[i].uid, 'developer', user.content) // 将开发人字段同步到开发流程主表，回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
                                    let developer = await systemUsersRepo.getID(user.content) // 根据用户账号获取系统用户 ID，等待异步结果返回，声明局部变量
                                    if (developer?.length) developer_id = developer[0].id // 若能找到开发人员则提取其系统 ID
                                } // 结束当前逻辑块
                                variables[processConst.sampleProcess.template.link] = processConst.previousUrl + process[i].uid // 拼接业务详情链接用于寄样流程，拼接流程跳转链接并附带当前 UID，涉及寄样流程，为寄样流程模板字段 link 赋值，拼接流程详情页面链接，使用当前开发流程的 UID
                                variables[processConst.sampleProcess.template.uid] = process[i].uid // 传递业务流程 UID 给寄样流程，涉及寄样流程，为寄样流程模板字段 uid 赋值，使用当前开发流程的 UID
                                variables[processConst.sampleProcess.template.is_jd] = processConst.jdStatusList.TRUE // 标记寄样流程是否属于京东链路，区分京东链路标识，涉及寄样流程，为寄样流程模板字段 is_jd 赋值
                                variables[processConst.sampleProcess.template.starter] = user_id // 为寄样流程设置发起人 ID，涉及寄样流程，为寄样流程模板字段 starter 赋值
                                variables[processConst.sampleProcess.template.type] = process[i].type // 将业务类型传递给寄样流程，涉及寄样流程，为寄样流程模板字段 type 赋值
                                variables[processConst.sampleProcess.template.developer] = developer_id // 传递开发人信息给寄样流程，涉及寄样流程，为寄样流程模板字段 developer 赋值
                                robotStartProcess(processConst.sampleProcess.name, processConst.sampleProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及寄样流程
                                process_status.push(processConst.statusList.SAMPLE) // 记录寄样状态以便回写，处理寄样状态
                            } // 结束当前逻辑块
                        } else { // 进入新的逻辑块
                            // 反推触发京东分析
                            if (!process[i].developer) { // 当流程缺少开发人信息时需要补齐
                                let user // 声明局部变量
                                for (let j = 0; j < processConst.developCheckProcess.column.developer.OTHER.length; j++) { // 涉及开发审核流程，读取开发审核流程字段 developer
                                    user = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回
                                        instance[0].process_id, processConst.developCheckProcess.column.developer.OTHER[j]) // 涉及开发审核流程，读取开发审核流程字段 developer
                                    if (user) break // 根据条件执行不同逻辑
                                } // 结束当前逻辑块
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'developer', user.content) // 将开发人字段同步到开发流程主表，回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
                            } // 结束当前逻辑块
                            let analysisInstance = await processesRepo.getProcessByUid( // 根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                                process[i].uid, // 使用当前开发流程的 UID
                                processConst.jdAnalysisProcess.key) // 涉及京东分析流程
                            if (!analysisInstance?.length) { // 根据条件执行不同逻辑
                                let analysisVariables = JSON.parse(JSON.stringify(processConst.jdAnalysisProcess.template.OPERATOR)) // 准备分析流程的模板变量，构建反推京东分析流程模板变量，涉及京东分析流程，为京东分析流程模板字段 OPERATOR 赋值，声明局部变量，解析 JSON 字符串获取结构化数据，复制模板以避免原数据被修改
                                let variables = {} // 初始化流程变量容器，声明局部变量
                                for (let j = 0; j < analysisVariables.length; j++) { // 遍历集合执行批量逻辑
                                    variables[analysisVariables[j].key] = analysisVariables[j].type == 'array' ? // 执行赋值操作
                                        [process[i][analysisVariables[j].name]] : process[i][analysisVariables[j].name] // 执行流程相关操作
                                } // 结束当前逻辑块
                                robotStartProcess(processConst.jdAnalysisProcess.name, processConst.jdAnalysisProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及京东分析流程
                                process_status.push(processConst.statusList.ANALYSIS) // 记录非京东分析状态以便回写，处理非京东分析状态
                            } // 结束当前逻辑块
                        } // 结束当前逻辑块
                    } else if ([3,4].includes(instance[0].status)) { // 判断流程是否处于驳回或终止状态
                        developmentProcessesRepo.updateJDStatusToFinishByUid(process[i].uid) // 当京东链路流程结束时同步主流程为完成状态，将京东流程状态标记为完成，将京东流程标记为已完成，使用当前开发流程的 UID
                    } else { // 进入新的逻辑块
                        process_ids.push(instance[0].process_id) // 收集需要回写状态的流程实例 ID
                        process_status.push(processConst.statusList.DEVELOPMENT_CHECK) // 处理开发审核状态
                    } // 结束当前逻辑块
                } else logger.error(`京东开发审核流程触发失败, uid=${process[i].uid}`) // 使用当前开发流程的 UID
            } // 结束当前逻辑块
            if (process[i].status.indexOf(processConst.statusList.SAMPLE) != -1) { // 处理寄样状态，判断非京东状态列表中是否包含目标状态
                let instance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                    process[i].uid, // 使用当前开发流程的 UID
                    processConst.sampleProcess.key, // 涉及寄样流程
                    processConst.sampleProcess.template.is_jd, // 涉及寄样流程，为寄样流程模板字段 is_jd 赋值
                    processConst.jdStatusList.TRUE) // 区分京东链路标识
                if (instance?.length) { // 根据条件执行不同逻辑
                    if (instance[0].status == 2) { // 判断流程状态是否为通过
                        // 更新样品图片、草图
                        if (!process[i].sample_image) { // 根据条件执行不同逻辑
                            let image = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                instance[0].process_id, processConst.sampleProcess.column.sample_image) // 涉及寄样流程，读取寄样流程字段 sample_image
                            if (image) developmentProcessesRepo.updateColumnByUid(process[i].uid, 'sample_image', image.content) // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
                        } // 结束当前逻辑块
                        if (!process[i].design_image) { // 根据条件执行不同逻辑
                            let image = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                instance[0].process_id, processConst.sampleProcess.column.design_image) // 涉及寄样流程，读取寄样流程字段 design_image
                            if (image) developmentProcessesRepo.updateColumnByUid(process[i].uid, 'design_image', image.content) // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
                        } // 结束当前逻辑块
                        if (process[i].type == processConst.typeList.OPERATOR) { // 针对反推类型
                            // 反推寄样通过触发样品选中
                            let analysisInstance = await processesRepo.getProcessByUid( // 根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                                process[i].uid, // 使用当前开发流程的 UID
                                processConst.analysisProcess.key) // 涉及非京东分析流程
                            if (analysisInstance?.length) { // 根据条件执行不同逻辑
                                let first = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.first_operator) // 涉及非京东分析流程，读取非京东分析流程字段 first_operator
                                let second = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.second_operator) // 涉及非京东分析流程，读取非京东分析流程字段 second_operator
                                let third = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.third_operator) // 涉及非京东分析流程，读取非京东分析流程字段 third_operator
                                let variables = {} // 初始化流程变量容器，声明局部变量
                                variables[processConst.sampleCheckProcess.template.link] = processConst.previousUrl + process[i].uid // 拼接流程跳转链接并附带当前 UID，涉及样品选中流程，为样品选中流程模板字段 link 赋值，拼接流程详情页面链接，使用当前开发流程的 UID
                                variables[processConst.sampleCheckProcess.template.uid] = process[i].uid // 涉及样品选中流程，为样品选中流程模板字段 uid 赋值，使用当前开发流程的 UID
                                variables[processConst.sampleCheckProcess.template.is_jd] = processConst.jdStatusList.TRUE // 区分京东链路标识，涉及样品选中流程，为样品选中流程模板字段 is_jd 赋值
                                variables[processConst.sampleCheckProcess.template.first_operator] = first?.content // 涉及样品选中流程，为样品选中流程模板字段 first_operator 赋值
                                variables[processConst.sampleCheckProcess.template.second_operator] = second?.content // 涉及样品选中流程，为样品选中流程模板字段 second_operator 赋值
                                variables[processConst.sampleCheckProcess.template.third_operator] = third?.content // 涉及样品选中流程，为样品选中流程模板字段 third_operator 赋值
                                robotStartProcess(processConst.sampleCheckProcess.name, processConst.sampleCheckProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及样品选中流程
                                process_status.push(processConst.statusList.SAMPLE_CHECK) // 处理寄样状态，处理样品选中状态
                            } // 结束当前逻辑块
                        } else if ([processConst.typeList.IP, processConst.typeList.SELF].includes(process[i].type)) { // 针对IP 类型，针对自研类型，判断流程类型是否属于指定集合
                            // IP,自研审核通过触发企划审核
                            let reviewVarables = JSON.parse(JSON.stringify(processConst.reviewProcess.template.SUPPLIER)) // 复制企划审核流程的模板变量，涉及企划审核流程，为企划审核流程模板字段 SUPPLIER 赋值，声明局部变量，解析 JSON 字符串获取结构化数据，复制模板以避免原数据被修改
                            let variables = {} // 初始化流程变量容器，声明局部变量
                            process['link'] = processConst.previousUrl + process[i].uid // 拼接流程跳转链接并附带当前 UID，拼接流程详情页面链接，使用当前开发流程的 UID
                            process['start_time'] = moment(process[i].create_time).format('YYYY-MM-DD') // 格式化日期字符串
                            process['is_jd'] = processConst.jdStatusList.TRUE // 区分京东链路标识
                            for (let j = 0; j < reviewVarables.length; j++) { // 遍历集合执行批量逻辑
                                variables[reviewVarables[j].key] = reviewVarables[j].type == 'array' ? // 执行赋值操作
                                    [process[i][reviewVarables[j].name]] : process[i][reviewVarables[j].name] // 执行流程相关操作
                            } // 结束当前逻辑块
                            robotStartProcess(processConst.reviewProcess.name, processConst.reviewProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及企划审核流程
                            process_status.push(processConst.statusList.REVIEW) // 记录企划审核状态以便回写，处理企划审核状态
                        } // 结束当前逻辑块
                    } else if ([3,4].includes(instance[0].status)) { // 判断流程是否处于驳回或终止状态
                        developmentProcessesRepo.updateJDStatusToFinishByUid(process[i].uid) // 当京东链路流程结束时同步主流程为完成状态，将京东流程状态标记为完成，将京东流程标记为已完成，使用当前开发流程的 UID
                    } else { // 进入新的逻辑块
                        process_ids.push(instance[0].process_id) // 收集需要回写状态的流程实例 ID
                        process_status.push(processConst.statusList.SAMPLE) // 记录寄样状态以便回写，处理寄样状态
                    } // 结束当前逻辑块
                } else logger.error(`京东寄样流程触发失败, uid=${process[i].uid}`) // 使用当前开发流程的 UID
            } // 结束当前逻辑块
            if (process[i].status.indexOf(processConst.statusList.ANALYSIS) != -1) { // 处理非京东分析状态，判断非京东状态列表中是否包含目标状态
                let instance = await processesRepo.getProcessByUid( // 根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                    process[i].uid, // 使用当前开发流程的 UID
                    processConst.jdAnalysisProcess.key) // 涉及京东分析流程
                if (instance?.length) { // 根据条件执行不同逻辑
                    if (instance[0].status == 2) { // 判断流程状态是否为通过
                        if ([processConst.typeList.IP, processConst.typeList.SELF].includes(process[i].type)) { // 针对IP 类型，针对自研类型，判断流程类型是否属于指定集合
                            // IP、自研非京东分析通过触发开发审核，更新spu,sku_code
                            let developCheckInstance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                                process[i].uid, // 使用当前开发流程的 UID
                                processConst.developCheckProcess.key, // 涉及开发审核流程
                                processConst.developCheckProcess.column.is_jd, // 涉及开发审核流程，读取开发审核流程字段 is_jd
                                processConst.jdStatusList.TRUE) // 区分京东链路标识
                            if (!developCheckInstance?.length) { // 根据条件执行不同逻辑
                                let developCheckVarables = process[i].type == processConst.typeList.IP ? // 根据流程类型选择对应的开发审核模板，针对IP 类型，声明局部变量
                                    JSON.parse(JSON.stringify(processConst.developCheckProcess.template.IP)) : // 涉及开发审核流程，为开发审核流程模板字段 IP 赋值，解析 JSON 字符串获取结构化数据，复制模板以避免原数据被修改
                                    JSON.parse(JSON.stringify(processConst.developCheckProcess.template.SELF)) // 涉及开发审核流程，为开发审核流程模板字段 SELF 赋值，解析 JSON 字符串获取结构化数据，复制模板以避免原数据被修改
                                let variables = {} // 初始化流程变量容器，声明局部变量
                                process['link'] = processConst.previousUrl + process[i].uid // 拼接流程跳转链接并附带当前 UID，拼接流程详情页面链接，使用当前开发流程的 UID
                                process['start_time'] = moment(process[i].create_time).format('YYYY-MM-DD') // 格式化日期字符串
                                process['is_jd'] = processConst.jdStatusList.TRUE // 区分京东链路标识
                                for (let j = 0; j < developCheckVarables.length; j++) { // 遍历集合执行批量逻辑
                                    variables[developCheckVarables[j].key] = developCheckVarables[j].type == 'array' ? // 执行赋值操作
                                        [process[i][developCheckVarables[j].name]] : process[i][developCheckVarables[j].name] // 执行流程相关操作
                                } // 结束当前逻辑块
                                robotStartProcess(processConst.developCheckProcess.name, processConst.developCheckProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及开发审核流程
                                process_status.push(processConst.statusList.DEVELOPMENT_CHECK) // 处理开发审核状态
                                let spu = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                    instance[0].process_id, processConst.jdAnalysisProcess.column.spu) // 读取京东分析流程的 spu 信息，涉及京东分析流程，读取京东分析流程字段 spu
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'spu', spu.content) // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
                                let sku_code = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                    instance[0].process_id, processConst.jdAnalysisProcess.column.sku_code) // 读取京东分析流程的 sku_code 信息，涉及京东分析流程，读取京东分析流程字段 sku_code
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'sku_code', sku_code.content) // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
                            } // 结束当前逻辑块
                        } else if (process[i].type == processConst.typeList.SUPPLIER) { // 针对正推类型
                            // 正推京东分析选中触发企划审核，更新spu,sku_code
                            let reviewInstance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                                process[i].uid, // 使用当前开发流程的 UID
                                processConst.reviewProcess.key, // 涉及企划审核流程
                                processConst.reviewProcess.column.is_jd, // 涉及企划审核流程，读取企划审核流程字段 is_jd
                                processConst.jdStatusList.TRUE) // 区分京东链路标识
                            if (!reviewInstance?.length) { // 根据条件执行不同逻辑
                                let is_select = false // 声明局部变量
                                let select = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                    instance[0].process_id, processConst.jdAnalysisProcess.column.select) // 涉及京东分析流程，读取京东分析流程字段 select
                                if (select?.content == processConst.analysisStatusList.TRUE) is_select = true // 判断是否选中
                                if (is_select) { // 根据条件执行不同逻辑
                                    let reviewVarables = JSON.parse(JSON.stringify(processConst.reviewProcess.template.SUPPLIER)) // 复制企划审核流程的模板变量，涉及企划审核流程，为企划审核流程模板字段 SUPPLIER 赋值，声明局部变量，解析 JSON 字符串获取结构化数据，复制模板以避免原数据被修改
                                    let variables = {} // 初始化流程变量容器，声明局部变量
                                    process['link'] = processConst.previousUrl + process[i].uid // 拼接流程跳转链接并附带当前 UID，拼接流程详情页面链接，使用当前开发流程的 UID
                                    process['start_time'] = moment(process[i].create_time).format('YYYY-MM-DD') // 格式化日期字符串
                                    process['is_jd'] = processConst.jdStatusList.TRUE // 区分京东链路标识
                                    for (let j = 0; j < reviewVarables.length; j++) { // 遍历集合执行批量逻辑
                                        variables[reviewVarables[j].key] = reviewVarables[j].type == 'array' ? // 执行赋值操作
                                            [process[i][reviewVarables[j].name]] : process[i][reviewVarables[j].name] // 执行流程相关操作
                                    } // 结束当前逻辑块
                                    robotStartProcess(processConst.reviewProcess.name, processConst.reviewProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及企划审核流程
                                    process_status.push(processConst.statusList.REVIEW) // 记录企划审核状态以便回写，处理企划审核状态
                                    let spu = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                        instance[0].process_id, processConst.jdAnalysisProcess.column.spu) // 读取京东分析流程的 spu 信息，涉及京东分析流程，读取京东分析流程字段 spu
                                    developmentProcessesRepo.updateColumnByUid(process[i].uid, 'spu', spu.content) // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
                                    let sku_code = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                        instance[0].process_id, processConst.jdAnalysisProcess.column.sku_code) // 读取京东分析流程的 sku_code 信息，涉及京东分析流程，读取京东分析流程字段 sku_code
                                    developmentProcessesRepo.updateColumnByUid(process[i].uid, 'sku_code', sku_code.content) // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
                                } // 结束当前逻辑块
                            } // 结束当前逻辑块
                        } else { // 进入新的逻辑块
                            // 反推京东分析通过触发寄样
                            let sampleInstance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                                process[i].uid, // 使用当前开发流程的 UID
                                processConst.sampleProcess.key, // 涉及寄样流程
                                processConst.sampleProcess.template.is_jd, // 涉及寄样流程，为寄样流程模板字段 is_jd 赋值
                                processConst.jdStatusList.TRUE) // 区分京东链路标识
                            if (!sampleInstance?.length) { // 根据条件执行不同逻辑
                                let variables = {}, user_id, developer_id // 初始化流程变量容器，声明局部变量
                                let starter = await systemUsersRepo.getID(process[i].starter) // 根据用户账号获取系统用户 ID，等待异步结果返回，声明局部变量
                                if (starter?.length) user_id = starter[0].id // 如果查询到流程发起人则记录其 ID
                                let developer = await systemUsersRepo.getID(process[i].developer) // 根据用户账号获取系统用户 ID，等待异步结果返回，声明局部变量
                                if (developer?.length) developer_id = developer[0].id // 若能找到开发人员则提取其系统 ID
                                variables[processConst.sampleProcess.template.link] = processConst.previousUrl + process[i].uid // 拼接业务详情链接用于寄样流程，拼接流程跳转链接并附带当前 UID，涉及寄样流程，为寄样流程模板字段 link 赋值，拼接流程详情页面链接，使用当前开发流程的 UID
                                variables[processConst.sampleProcess.template.uid] = process[i].uid // 传递业务流程 UID 给寄样流程，涉及寄样流程，为寄样流程模板字段 uid 赋值，使用当前开发流程的 UID
                                variables[processConst.sampleProcess.template.is_jd] = processConst.jdStatusList.TRUE // 标记寄样流程是否属于京东链路，区分京东链路标识，涉及寄样流程，为寄样流程模板字段 is_jd 赋值
                                variables[processConst.sampleProcess.template.starter] = user_id // 为寄样流程设置发起人 ID，涉及寄样流程，为寄样流程模板字段 starter 赋值
                                variables[processConst.sampleProcess.template.type] = process[i].type // 将业务类型传递给寄样流程，涉及寄样流程，为寄样流程模板字段 type 赋值
                                variables[processConst.sampleProcess.template.developer] = developer_id // 传递开发人信息给寄样流程，涉及寄样流程，为寄样流程模板字段 developer 赋值
                                robotStartProcess(processConst.sampleProcess.name, processConst.sampleProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及寄样流程
                                process_status.push(processConst.statusList.SAMPLE) // 记录寄样状态以便回写，处理寄样状态
                            } // 结束当前逻辑块
                        } // 结束当前逻辑块
                    } else if ([3,4].includes(instance[0].status)) { // 判断流程是否处于驳回或终止状态
                        developmentProcessesRepo.updateJDStatusToFinishByUid(process[i].uid) // 当京东链路流程结束时同步主流程为完成状态，将京东流程状态标记为完成，将京东流程标记为已完成，使用当前开发流程的 UID
                    } else { // 进入新的逻辑块
                        process_ids.push(instance[0].process_id) // 收集需要回写状态的流程实例 ID
                        process_status.push(processConst.statusList.ANALYSIS) // 记录非京东分析状态以便回写，处理非京东分析状态
                    } // 结束当前逻辑块
                } else logProcessTriggerFailure('京东分析流程', process[i], '未查询到流程实例', {
                    expectedProcessKey: processConst.jdAnalysisProcess.key
                }) // 使用当前开发流程的 UID
            } // 结束当前逻辑块
            if (process[i].status.indexOf(processConst.statusList.SAMPLE_CHECK) != -1) { // 处理寄样状态，处理样品选中状态，判断非京东状态列表中是否包含目标状态
                // 反推样品选中触发企划审核，更新spu,sku_code
                let instance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                    process[i].uid, // 使用当前开发流程的 UID
                    processConst.sampleCheckProcess.key, // 涉及样品选中流程
                    processConst.sampleCheckProcess.template.is_jd, // 涉及样品选中流程，为样品选中流程模板字段 is_jd 赋值
                    processConst.jdStatusList.TRUE) // 区分京东链路标识
                if (instance?.length) { // 根据条件执行不同逻辑
                    if (instance[0].status == 2) { // 判断流程状态是否为通过
                        let reviewInstance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                            process[i].uid, // 使用当前开发流程的 UID
                            processConst.reviewProcess.key, // 涉及企划审核流程
                            processConst.reviewProcess.column.is_jd, // 涉及企划审核流程，读取企划审核流程字段 is_jd
                            processConst.jdStatusList.TRUE) // 区分京东链路标识
                        if (!reviewInstance?.length) { // 根据条件执行不同逻辑
                            let is_select = false // 声明局部变量
                            let analysisInstance = await processesRepo.getProcessByUid( // 根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                                process[i].uid, // 使用当前开发流程的 UID
                                processConst.analysisProcess.key) // 涉及非京东分析流程
                            if (analysisInstance?.length) { // 根据条件执行不同逻辑
                                let first = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.first_select) // 涉及非京东分析流程，读取非京东分析流程字段 first_select
                                if (first?.content == processConst.analysisStatusList.TRUE) is_select = true // 判断是否选中
                                else { // 处理其他分支情况
                                    let second = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                        analysisInstance[0].process_id, processConst.analysisProcess.column.second_select) // 涉及非京东分析流程，读取非京东分析流程字段 second_select
                                    if (second?.content == processConst.analysisStatusList.TRUE) is_select = true // 判断是否选中
                                    else { // 处理其他分支情况
                                        let third = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                            analysisInstance[0].process_id, processConst.analysisProcess.column.third_select) // 涉及非京东分析流程，读取非京东分析流程字段 third_select
                                        if (third?.content == processConst.analysisStatusList.TRUE) is_select = true // 判断是否选中
                                    } // 结束当前逻辑块
                                } // 结束当前逻辑块
                            } // 结束当前逻辑块
                            if (is_select) { // 根据条件执行不同逻辑
                                let reviewVarables = JSON.parse(JSON.stringify(processConst.reviewProcess.template.SUPPLIER)) // 复制企划审核流程的模板变量，涉及企划审核流程，为企划审核流程模板字段 SUPPLIER 赋值，声明局部变量，解析 JSON 字符串获取结构化数据，复制模板以避免原数据被修改
                                let variables = {} // 初始化流程变量容器，声明局部变量
                                process['link'] = processConst.previousUrl + process[i].uid // 拼接流程跳转链接并附带当前 UID，拼接流程详情页面链接，使用当前开发流程的 UID
                                process['start_time'] = moment(process[i].create_time).format('YYYY-MM-DD') // 格式化日期字符串
                                process['is_jd'] = processConst.jdStatusList.TRUE // 区分京东链路标识
                                for (let j = 0; j < reviewVarables.length; j++) { // 遍历集合执行批量逻辑
                                    variables[reviewVarables[j].key] = reviewVarables[j].type == 'array' ? // 执行赋值操作
                                        [process[i][reviewVarables[j].name]] : process[i][reviewVarables[j].name] // 执行流程相关操作
                                } // 结束当前逻辑块
                                robotStartProcess(processConst.reviewProcess.name, processConst.reviewProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及企划审核流程
                                process_status.push(processConst.statusList.REVIEW) // 记录企划审核状态以便回写，处理企划审核状态
                                let analysisInstance = await processesRepo.getProcessByUid( // 根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                                    process[i].uid, // 使用当前开发流程的 UID
                                    processConst.jdAnalysisProcess.key) // 涉及京东分析流程
                                let spu = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                    analysisInstance[0].process_id, processConst.jdAnalysisProcess.column.spu) // 读取京东分析流程的 spu 信息，涉及京东分析流程，读取京东分析流程字段 spu
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'spu', spu.content) // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
                                let sku_code = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                    analysisInstance[0].process_id, processConst.jdAnalysisProcess.column.sku_code) // 读取京东分析流程的 sku_code 信息，涉及京东分析流程，读取京东分析流程字段 sku_code
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'sku_code', sku_code.content) // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
                            } // 结束当前逻辑块
                        } // 结束当前逻辑块
                    } else if ([3,4].includes(instance[0].status)) { // 判断流程是否处于驳回或终止状态
                        developmentProcessesRepo.updateJDStatusToFinishByUid(process[i].uid) // 当京东链路流程结束时同步主流程为完成状态，将京东流程状态标记为完成，将京东流程标记为已完成，使用当前开发流程的 UID
                    } else { // 进入新的逻辑块
                        process_ids.push(instance[0].process_id) // 收集需要回写状态的流程实例 ID
                        process_status.push(processConst.statusList.SAMPLE_CHECK) // 处理寄样状态，处理样品选中状态
                    } // 结束当前逻辑块
                } else logger.error(`京东样品选中流程触发失败, uid=${process[i].uid}`) // 使用当前开发流程的 UID
            } // 结束当前逻辑块
            if (process[i].status.indexOf(processConst.statusList.REVIEW) != -1) { // 处理企划审核状态，判断非京东状态列表中是否包含目标状态
                // 更新选中平台，事业1部是否选中，事业2部是否选中，事业3部是否选中，非京东是否选中，采购方式, 视觉类型
                let instance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                    process[i].uid, // 使用当前开发流程的 UID
                    processConst.reviewProcess.key, // 涉及企划审核流程
                    processConst.reviewProcess.column.is_jd, // 涉及企划审核流程，读取企划审核流程字段 is_jd
                    processConst.jdStatusList.TRUE) // 区分京东链路标识
                if (instance?.length) { // 根据条件执行不同逻辑
                    if (instance[0].status == 2) { // 判断流程状态是否为通过
                        let select = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                            instance[0].process_id, processConst.reviewProcess.column.select_project) // 读取企划审核的选中平台信息，涉及企划审核流程，读取企划审核流程字段 select_project
                        let jd_is_select = processConst.analysisStatusList.FALSE // 判断是否未选中，声明局部变量
                        if (select) { // 根据条件执行不同逻辑
                            if (select.content.indexOf('京东') != -1) { // 根据条件执行不同逻辑
                                jd_is_select = processConst.analysisStatusList.TRUE // 判断是否选中
                            } // 结束当前逻辑块
                            developmentProcessesRepo.updateColumnByUid( // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表
                                process[i].uid, 'jd_is_select', jd_is_select) // 使用当前开发流程的 UID
                        } // 结束当前逻辑块
                        let vision_type = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                            instance[0].process_id, processConst.reviewProcess.column.vision_type) // 读取企划审核的视觉类型，涉及企划审核流程，读取企划审核流程字段 vision_type
                        if (vision_type) developmentProcessesRepo.updateColumnByUid( // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表
                            process[i].uid, 'jd_vision_type', vision_type.content) // 使用当前开发流程的 UID
                        // 触发爆款方案
                        let designProposalInstance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                            process[i].uid, // 使用当前开发流程的 UID
                            processConst.designProposalProcess.key, // 涉及爆款方案流程
                            processConst.designProposalProcess.template.is_jd, // 涉及爆款方案流程，为爆款方案流程模板字段 is_jd 赋值
                            processConst.jdStatusList.TRUE) // 区分京东链路标识
                        if (!designProposalInstance?.length) { // 根据条件执行不同逻辑
                            let division = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                instance[0].process_id, processConst.reviewProcess.column.division) // 涉及企划审核流程，读取企划审核流程字段 division
                            let variables = {} // 初始化流程变量容器，声明局部变量
                            variables[processConst.designProposalProcess.template.link] = processConst.previousUrl + process[i].uid // 拼接流程跳转链接并附带当前 UID，涉及爆款方案流程，为爆款方案流程模板字段 link 赋值，拼接流程详情页面链接，使用当前开发流程的 UID
                            variables[processConst.designProposalProcess.template.uid] = process[i].uid // 涉及爆款方案流程，为爆款方案流程模板字段 uid 赋值，使用当前开发流程的 UID
                            variables[processConst.designProposalProcess.template.is_jd] = processConst.jdStatusList.TRUE // 区分京东链路标识，涉及爆款方案流程，为爆款方案流程模板字段 is_jd 赋值
                            variables[processConst.designProposalProcess.template.name] = process[i].name // 涉及爆款方案流程，为爆款方案流程模板字段 name 赋值
                            variables[processConst.designProposalProcess.template.division] = division?.content // 涉及爆款方案流程，为爆款方案流程模板字段 division 赋值
                            variables[processConst.designProposalProcess.template.first_select] = first_select // 涉及爆款方案流程，为爆款方案流程模板字段 first_select 赋值
                            variables[processConst.designProposalProcess.template.second_select] = second_select // 涉及爆款方案流程，为爆款方案流程模板字段 second_select 赋值
                            variables[processConst.designProposalProcess.template.third_select] = third_select // 涉及爆款方案流程，为爆款方案流程模板字段 third_select 赋值
                            robotStartProcess(processConst.designProposalProcess.name, processConst.designProposalProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及爆款方案流程
                            process_status.push(processConst.statusList.DESIGN_PROPOSAL) // 记录爆款方案状态以便回写，处理爆款方案状态
                        } // 结束当前逻辑块
                    } else if ([3,4].includes(instance[0].status)) { // 判断流程是否处于驳回或终止状态
                        developmentProcessesRepo.updateJDStatusToFinishByUid(process[i].uid) // 当京东链路流程结束时同步主流程为完成状态，将京东流程状态标记为完成，将京东流程标记为已完成，使用当前开发流程的 UID
                    } else { // 进入新的逻辑块
                        process_ids.push(instance[0].process_id) // 收集需要回写状态的流程实例 ID
                        process_status.push(processConst.statusList.REVIEW) // 记录企划审核状态以便回写，处理企划审核状态
                    } // 结束当前逻辑块
                } else logger.error(`京东企划审核流程触发失败, uid=${process[i].uid}`) // 使用当前开发流程的 UID
            } // 结束当前逻辑块
            if (process[i].status.indexOf(processConst.statusList.DESIGN_PROPOSAL) != -1) { // 处理爆款方案状态，判断非京东状态列表中是否包含目标状态
                let instance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                    process[i].uid, // 使用当前开发流程的 UID
                    processConst.designProposalProcess.key, // 涉及爆款方案流程
                    processConst.designProposalProcess.template.is_jd, // 涉及爆款方案流程，为爆款方案流程模板字段 is_jd 赋值
                    processConst.jdStatusList.TRUE) // 区分京东链路标识
                if (instance?.length) { // 根据条件执行不同逻辑
                    if (instance[0].status == 2) { // 判断流程状态是否为通过
                        // 更新爆款方案负责人，触发视觉流程，京东订货流程
                        let operator = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                            instance[0].process_id, processConst.designProposalProcess.column.operator) // 获取爆款方案流程的负责人，涉及爆款方案流程，读取爆款方案流程字段 operator
                        if (operator) developmentProcessesRepo.updateColumnByUid( // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表
                            process[i].uid, 'jd_operator', operator.content) // 使用当前开发流程的 UID
                        let link_type = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                            instance[0].process_id, processConst.designProposalProcess.column.link_type) // 获取爆款方案流程的链接类型，涉及爆款方案流程，读取爆款方案流程字段 link_type
                        let visionDesignInstance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                            process[i].uid, // 使用当前开发流程的 UID
                            processConst.visionDesignProcess.key, // 涉及视觉流程
                            processConst.visionDesignProcess.template.is_jd, // 涉及视觉流程，为视觉流程模板字段 is_jd 赋值
                            processConst.jdStatusList.TRUE) // 区分京东链路标识
                        if (!visionDesignInstance?.length) { // 根据条件执行不同逻辑
                            let variables = {} // 初始化流程变量容器，声明局部变量
                            variables[processConst.designProposalProcess.template.link] = processConst.previousUrl + process[i].uid // 拼接流程跳转链接并附带当前 UID，涉及爆款方案流程，为爆款方案流程模板字段 link 赋值，拼接流程详情页面链接，使用当前开发流程的 UID
                            variables[processConst.designProposalProcess.template.uid] = process[i].uid // 涉及爆款方案流程，为爆款方案流程模板字段 uid 赋值，使用当前开发流程的 UID
                            variables[processConst.designProposalProcess.template.is_jd] = processConst.jdStatusList.TRUE // 区分京东链路标识，涉及爆款方案流程，为爆款方案流程模板字段 is_jd 赋值
                            variables[processConst.designProposalProcess.template.name] = process[i].name // 涉及爆款方案流程，为爆款方案流程模板字段 name 赋值
                            variables[processConst.designProposalProcess.template.vision_type] = process[i].vision_type // 涉及爆款方案流程，为爆款方案流程模板字段 vision_type 赋值
                            variables[processConst.designProposalProcess.template.project] = ['京东'] // 涉及爆款方案流程，为爆款方案流程模板字段 project 赋值
                            variables[processConst.designProposalProcess.template.link_type] = link_type?.content // 涉及爆款方案流程，为爆款方案流程模板字段 link_type 赋值
                            variables[processConst.designProposalProcess.template.developer] = process[i].developer // 涉及爆款方案流程，为爆款方案流程模板字段 developer 赋值
                            variables[processConst.designProposalProcess.template.image] = JSON.parse(process[i].image) // 涉及爆款方案流程，为爆款方案流程模板字段 image 赋值，解析 JSON 字符串获取结构化数据
                            variables[processConst.designProposalProcess.template.operator] = operator?.content // 涉及爆款方案流程，为爆款方案流程模板字段 operator 赋值
                            robotStartProcess(processConst.designProposalProcess.name, processConst.designProposalProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及爆款方案流程
                            process_status.push(processConst.statusList.DESIGN_PROPOSAL) // 记录爆款方案状态以便回写，处理爆款方案状态
                        } // 结束当前逻辑块
                        let purchaseInstance = await processesRepo.getProcessByUid( // 根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                            process[i].uid, // 使用当前开发流程的 UID
                            processConst.jdPurchaseProcess.key) // 涉及京东订货流程
                        if (!purchaseInstance?.length) { // 根据条件执行不同逻辑
                            let variables = {} // 初始化流程变量容器，声明局部变量
                            variables[processConst.jdPurchaseProcess.template.link] = processConst.previousUrl + process[i].uid // 拼接流程跳转链接并附带当前 UID，为京东订货流程设置业务链接，涉及京东订货流程，为京东订货流程模板字段 link 赋值，拼接流程详情页面链接，使用当前开发流程的 UID
                            variables[processConst.jdPurchaseProcess.template.uid] = process[i].uid // 传递业务 UID 给京东订货流程，涉及京东订货流程，为京东订货流程模板字段 uid 赋值，使用当前开发流程的 UID
                            variables[processConst.jdPurchaseProcess.template.type] = process[i].type // 传递业务类型给京东订货流程，涉及京东订货流程，为京东订货流程模板字段 type 赋值
                            variables[processConst.jdPurchaseProcess.template.operator] = operator?.content // 传递负责人给京东订货流程，涉及京东订货流程，为京东订货流程模板字段 operator 赋值
                            variables[processConst.jdPurchaseProcess.template.spu] = process[i].spu // 为京东订货流程设置 spu 信息，涉及京东订货流程，为京东订货流程模板字段 spu 赋值
                            variables[processConst.jdPurchaseProcess.template.developer] = process[i].developer // 为京东订货流程设置开发人信息，涉及京东订货流程，为京东订货流程模板字段 developer 赋值
                            robotStartProcess(processConst.jdPurchaseProcess.name, processConst.jdPurchaseProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及京东订货流程
                            process_status.push(processConst.statusList.PURCHASE) // 记录订货流程状态以便回写，处理订货状态
                        } // 结束当前逻辑块
                    } else if ([3,4].includes(instance[0].status)) { // 判断流程是否处于驳回或终止状态
                        developmentProcessesRepo.updateJDStatusToFinishByUid(process[i].uid) // 当京东链路流程结束时同步主流程为完成状态，将京东流程状态标记为完成，将京东流程标记为已完成，使用当前开发流程的 UID
                    } else { // 进入新的逻辑块
                        process_ids.push(instance[0].process_id) // 收集需要回写状态的流程实例 ID
                        process_status.push(processConst.statusList.DESIGN_PROPOSAL) // 记录爆款方案状态以便回写，处理爆款方案状态
                    } // 结束当前逻辑块
                } else logger.error(`京东爆款流程触发失败, uid=${process[i].uid}`) // 使用当前开发流程的 UID
            } // 结束当前逻辑块
            if (process[i].status.indexOf(processConst.statusList.VISION_DESIGN) != -1) { // 处理视觉流程状态，判断非京东状态列表中是否包含目标状态
                let instance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                    process[i].uid, // 使用当前开发流程的 UID
                    processConst.visionDesignProcess.key, // 涉及视觉流程
                    processConst.visionDesignProcess.template.is_jd, // 涉及视觉流程，为视觉流程模板字段 is_jd 赋值
                    processConst.jdStatusList.TRUE) // 区分京东链路标识
                if (instance?.length) { // 根据条件执行不同逻辑
                    if ([2,3,4].includes(instance[0].status)) { // 根据条件执行不同逻辑
                        let purchaseInstance = await processesRepo.getJDShelfProcess( // 获取京东上架流程实例，等待异步结果返回，声明局部变量
                            process[i].uid, // 使用当前开发流程的 UID
                            processConst.jdPurchaseProcess.key) // 涉及京东订货流程
                        if (purchaseInstance?.length && purchaseInstance[0].status == 2) { // 根据条件执行不同逻辑
                            // 触发上架流程
                            if (process[i].jd_is_select == processConst.analysisStatusList.TRUE) { // 判断是否选中
                                let variables = {} // 初始化流程变量容器，声明局部变量
                                variables[processConst.shelfProcess.template.link] = processConst.previousUrl + process[i].uid // 拼接流程跳转链接并附带当前 UID，涉及上架流程，为上架流程模板字段 link 赋值，拼接流程详情页面链接，使用当前开发流程的 UID
                                variables[processConst.shelfProcess.template.uid] = process[i].uid // 涉及上架流程，为上架流程模板字段 uid 赋值，使用当前开发流程的 UID
                                variables[processConst.shelfProcess.template.project] = ['京东'] // 涉及上架流程，为上架流程模板字段 project 赋值
                                variables[processConst.shelfProcess.template.developer] = process[i].developer // 涉及上架流程，为上架流程模板字段 developer 赋值
                                let designProposalInstance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                                    process[i].uid, // 使用当前开发流程的 UID
                                    processConst.designProposalProcess.key, // 涉及爆款方案流程
                                    processConst.designProposalProcess.template.is_jd, // 涉及爆款方案流程，为爆款方案流程模板字段 is_jd 赋值
                                    processConst.jdStatusList.TRUE) // 区分京东链路标识
                                let link_type = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                                    designProposalInstance[0].process_id, processConst.designProposalProcess.column.link_type) // 获取爆款方案流程的链接类型，涉及爆款方案流程，读取爆款方案流程字段 link_type
                                variables[processConst.shelfProcess.template.link_type] = link_type?.content // 涉及上架流程，为上架流程模板字段 link_type 赋值
                                robotStartProcess(processConst.shelfProcess.name, processConst.shelfProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及上架流程
                                process_status.push(processConst.statusList.SECOND_SHELF) // 记录事业二部上架状态以便回写，处理事业二部上架状态
                            } // 结束当前逻辑块
                        } // 结束当前逻辑块
                    } else { // 进入新的逻辑块
                        process_ids.push(instance[0].process_id) // 收集需要回写状态的流程实例 ID
                        process_status.push(processConst.statusList.VISION_DESIGN) // 记录视觉流程状态以便回写，处理视觉流程状态
                    } // 结束当前逻辑块
                } else logger.error(`京东视觉流程触发失败, uid=${process[i].uid}`) // 使用当前开发流程的 UID
            } // 结束当前逻辑块
            if (process[i].status.indexOf(processConst.statusList.PURCHASE) != -1) { // 处理订货状态，判断非京东状态列表中是否包含目标状态
                let instance = await processesRepo.getProcessByUid( // 根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                    process[i].uid, // 使用当前开发流程的 UID
                    processConst.jdPurchaseProcess.key) // 涉及京东订货流程
                if (instance?.length) { // 根据条件执行不同逻辑
                    if (instance[0].status == 2) { // 判断流程状态是否为通过
                        let visionDesignInstance = await processesRepo.getProcessByUidAndColumn( // 根据流程 UID 及指定字段查询流程实例，根据流程 UID 查询流程实例，等待异步结果返回，声明局部变量
                            process[i].uid, // 使用当前开发流程的 UID
                            processConst.visionDesignProcess.key, // 涉及视觉流程
                            processConst.visionDesignProcess.template.is_jd, // 涉及视觉流程，为视觉流程模板字段 is_jd 赋值
                            processConst.jdStatusList.TRUE) // 区分京东链路标识
                        // 更新订货数量
                        let order_num = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                            instance[0].process_id, processConst.jdPurchaseProcess.column.order_num) // 获取京东订货流程的订货数量，涉及京东订货流程，读取京东订货流程字段 order_num
                        if (order_num) developmentProcessesRepo.updateColumnByUid(process[i].uid, 'jd_order_num', order_num.content) // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
                        if (!visionDesignInstance?.length && [2,3,4].includes(visionDesignInstance[0].status)) { // 根据条件执行不同逻辑
                            // 触发上架流程
                            if (process[i].jd_is_select == processConst.analysisStatusList.TRUE) { // 判断是否选中
                                let variables = {} // 初始化流程变量容器，声明局部变量
                                variables[processConst.shelfProcess.template.link] = processConst.previousUrl + process[i].uid // 拼接流程跳转链接并附带当前 UID，涉及上架流程，为上架流程模板字段 link 赋值，拼接流程详情页面链接，使用当前开发流程的 UID
                                variables[processConst.shelfProcess.template.uid] = process[i].uid // 涉及上架流程，为上架流程模板字段 uid 赋值，使用当前开发流程的 UID
                                variables[processConst.shelfProcess.template.project] = ['京东'] // 涉及上架流程，为上架流程模板字段 project 赋值
                                variables[processConst.shelfProcess.template.developer] = process[i].developer // 涉及上架流程，为上架流程模板字段 developer 赋值
                                variables[processConst.shelfProcess.template.link_type] = process[i].link_type // 涉及上架流程，为上架流程模板字段 link_type 赋值
                                robotStartProcess(processConst.shelfProcess.name, processConst.shelfProcess.key, variables) // 自动发起下游流程，通过机器人触发新流程，涉及上架流程
                                process_status.push(processConst.statusList.SECOND_SHELF) // 记录事业二部上架状态以便回写，处理事业二部上架状态
                            } // 结束当前逻辑块
                        } // 结束当前逻辑块
                    } else if ([3,4].includes(instance[0].status)) { // 判断流程是否处于驳回或终止状态
                        developmentProcessesRepo.updateJDStatusToFinishByUid(process[i].uid) // 当京东链路流程结束时同步主流程为完成状态，将京东流程状态标记为完成，将京东流程标记为已完成，使用当前开发流程的 UID
                    } else { // 进入新的逻辑块
                        process_ids.push(instance[0].process_id) // 收集需要回写状态的流程实例 ID
                        process_status.push(processConst.statusList.PURCHASE) // 记录订货流程状态以便回写，处理订货状态
                    } // 结束当前逻辑块
                } else logger.error(`京东订货流程触发失败, uid=${process[i].uid}`) // 使用当前开发流程的 UID
            } // 结束当前逻辑块
            if (process[i].status.indexOf(processConst.statusList.SECOND_SHELF) != -1) { // 处理事业二部上架状态，判断非京东状态列表中是否包含目标状态
                let instance = await processesRepo.getJDShelfProcess( // 获取京东上架流程实例，等待异步结果返回，声明局部变量
                    process[i].uid, // 使用当前开发流程的 UID
                    processConst.shelfProcess.key) // 涉及上架流程
                if (instance?.length) { // 根据条件执行不同逻辑
                    if (instance[0].status == 2) { // 判断流程状态是否为通过
                        let firstInstance = await processesRepo.getJDShelfProcess( // 获取京东上架流程实例，等待异步结果返回，声明局部变量
                            process[i].uid, // 使用当前开发流程的 UID
                            processConst.shelfProcess.key) // 涉及上架流程
                        let second_goods_id = '' // 声明局部变量
                        let jd = await processInfoRepo.getByProcessIdAndField( // 根据流程实例与字段名查询填报信息，等待异步结果返回，声明局部变量
                            firstInstance[0].process_id, processConst.shelfProcess.column.jd) // 涉及上架流程，读取上架流程字段 jd
                        if (jd) second_goods_id = `${second_goods_id}京东:${jd.content};` // 根据条件执行不同逻辑
                        developmentProcessesRepo.updateColumnByUid(process[i].uid, 'second_goods_id', second_goods_id) // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
                        developmentProcessesRepo.updateJDStatusToFinishByUid(process[i].uid) // 当京东链路流程结束时同步主流程为完成状态，将京东流程状态标记为完成，将京东流程标记为已完成，使用当前开发流程的 UID
                    } else if ([3,4].includes(instance[0].status)) { // 判断流程是否处于驳回或终止状态
                        developmentProcessesRepo.updateJDStatusToFinishByUid(process[i].uid) // 当京东链路流程结束时同步主流程为完成状态，将京东流程状态标记为完成，将京东流程标记为已完成，使用当前开发流程的 UID
                    } else { // 进入新的逻辑块
                        process_ids.push(instance[0].process_id) // 收集需要回写状态的流程实例 ID
                        process_status.push(processConst.statusList.SECOND_SHELF) // 记录事业二部上架状态以便回写，处理事业二部上架状态
                    } // 结束当前逻辑块
                } else logger.error(`事业2部上架流程触发失败, uid=${process[i].uid}`) // 使用当前开发流程的 UID
            } // 结束当前逻辑块
            if (process_ids?.length) { // 根据条件执行不同逻辑
                process_ids = process_ids.join('","') // 将流程实例 ID 数组拼接成查询用的字符串
                let tasks = await processTasksRepo.getRunningTasksByProcessId(process_ids) // 查询流程实例当前正在执行的任务节点，等待异步结果返回，声明局部变量
                let tasks_names = '' // 拼接运行节点名称信息，声明局部变量
                for (let j = 0; j < tasks.length; j++) { // 遍历集合执行批量逻辑
                    tasks_names = `${tasks_names}${tasks[i].process_title}:${tasks[i].title};` // 拼接运行节点名称信息
                } // 结束当前逻辑块
                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'jd_running_node', tasks_names) // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
            } // 结束当前逻辑块
            if (process_status?.length) { // 根据条件执行不同逻辑
                process_status = process_status.join(',') // 将状态数组转换为逗号分隔的字符串
                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'jd_status', process_status) // 回写开发流程表中的指定字段，将字段 信息 回写到开发流程表，使用当前开发流程的 UID
            } // 结束当前逻辑块
            console.log(process_ids, process_status) // 输出调试日志
        } // 结束当前逻辑块
    } // 结束当前逻辑块
} // 结束当前逻辑块

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