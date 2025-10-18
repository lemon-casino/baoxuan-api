const userRepo = require("@/repository/userRepo")
const redisRepo = require("@/repository/redisRepo")
const oaProcessTemplateRepo = require("@/repository/oaProcessTemplateRepo")
const processTmpRepo = require("@/repository/processTmpRepo")
const processReviewTmpRepo = require("@/repository/processReviewTmpRepo")
const processDetailsTmpRepo = require("@/repository/processDetailsTmpRepo")
const departmentRepo = require("@/repository/departmentRepo")
const departmentUsersRepo = require("@/repository/departmentUsersRepo")
const oaProcessRepo = require("@/repository/oaProcessRepo")
const attendanceRepo = require("@/repository/attendanceRepo")
const outUsersRepo = require("@/repository/outUsersRepo")
const flowFormRepo = require("@/repository/flowFormRepo")
const flowFormProcessVersionRepo = require("@/repository/flowFormProcessVersionRepo")
const globalSetter = require("@/global/setter")
const dingDingService = require("@/service/dingDingService")
const flowService = require("@/service/flowService")
const flowFormService = require("@/service/flowFormService")
const workingDayService = require("@/service/workingDayService")
const userLogService = require("@/service/userLogService")
const userService = require("@/service/userService")
const redisUtil = require("@/utils/redisUtil")
const dateUtil = require("@/utils/dateUtil")
const {redisKeys} = require("@/const/redisConst")
const onlineCheckConst = require("@/const/onlineCheckConst")
const extensionsConst = require("@/const/tmp/extensionsConst")
const adminConst = require("@/const/adminConst")
const flowConst = require("@/const/flowConst")
const sequelizeErrorConst = require("@/const/sequelizeErrorConst")
const oaReq = require("@/core/dingDingReq/oaReq")
const intelligentHRReq = require("@/core/dingDingReq/intelligentHRReq")
const attendanceReq = require("@/core/dingDingReq/attendanceReq")
const crawlingPageReq = require("@/core/dingDingReq/crawlingPageReq")
const singleItemTaoBaoService = require("./singleItemTaoBaoService")
const {
    getLinknewvaCount
} = require("./singleItemTaoBaoService")
const tianmao__user_tableService = require("@/service/tianMaoUserTableService")
const resignEmployeePatch = require("@/patch/resignEmployeePatch")
const UserError = require("@/error/userError");
const {errorCodes} = require("@/const/errorConst");
const fs = require('fs');
const util = require('util');
const {join} = require("node:path");
const {Sequelize} = require("sequelize");
const {redisConfig} = require("@/config");
const axios = require("axios");
const {getInquiryTodayjdDailyReport} = require("@/service/JDDailyReportBaoService");
const {getOperateAttributesMaintainer} = require("@/repository/dianShangOperationAttributeRepo");
const {sendDingReportBao} = require("@/service/dingReportBaoService");
const {timingSynchronization} = require("@/service/notice/confirmationNoticeService");
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const syncWorkingDay = async () => {
    console.log("同步进行中...")
    const date = dateUtil.format2Str(new Date(), "YYYY-MM-DD")
    const isWorkingDay = await dingDingService.isWorkingDay(date)
    if (isWorkingDay) {
        await workingDayService.saveWorkingDay(date)
        await redisUtil.rPush(redisKeys.WorkingDays, date)
    }
    logger.info("同步完成：syncWorkingDay")
    console.log("同步完成")
}

const syncTodayRunningAndFinishedFlows = async () => {
    logger.info("开始同步今日流程数据...")
    const flows = await dingDingService.getTodayRunningAndFinishedFlows()
    await redisUtil.set(redisKeys.TodayRunningAndFinishedFlows, JSON.stringify(flows))
    globalSetter.setGlobalTodayRunningAndFinishedFlows(flows)
    logger.info(`同步完成，共:${flows.length}条数据`)
}

const syncMissingCompletedFlows = async () => {
    console.log("同步进行中...")
    await flowService.syncMissingCompletedFlows()
    logger.info("同步完成：syncMissingCompletedFlows")
    console.log("同步完成")
}

const syncDingDingToken = async () => {
    await dingDingService.getDingDingToken()
    logger.info("同步完成：syncDingDingToken")
}

const syncDepartment = async () => {
    console.log("同步进行中...")
    const depList = await dingDingService.getDepartmentFromDingDing()
    await redisUtil.set(redisKeys.Departments, JSON.stringify(depList.result))
    globalSetter.setGlobalDepartments(depList.result)
    // 将部门信息同步数据库
    await loopSaveDept(depList.result)
    logger.info("同步完成：syncDepartment")
    console.log("同步完成")
}

const loopSaveDept = async (deps) => {
    for (const dept of deps) {
        try {
            await departmentRepo.saveDepartmentToDb(dept)
        } catch (e) {
            if (e.original.code !== "ER_DUP_ENTRY") {
                throw e
            }
        }
        if (dept.dep_chil && dept.dep_chil.length > 0) {
            await loopSaveDept(dept.dep_chil)
        }
    }
}

const syncDepartmentWithUser = async () => {
    console.log("同步进行中...")
    const allDepartmentsWithUsers = await dingDingService.getDepartmentsWithUsersFromDingDing()
    await redisUtil.set(redisKeys.DepartmentsUsers, JSON.stringify(allDepartmentsWithUsers))
    globalSetter.setGlobalUsersOfDepartments(allDepartmentsWithUsers)
    // 保存入库并设置无效关系： 离职、调部门等
    await loopSaveDeptUserAndSetInvalidInfo(allDepartmentsWithUsers)
    logger.info("同步完成：syncDepartmentWithUser")
    console.log("同步完成")
}

const loopSaveDeptUserAndSetInvalidInfo = async (depsUsers) => {
    for (const depUsers of depsUsers) {
        const users = depUsers.dep_user
        for (const user of users) {
            await departmentUsersRepo.save(depUsers.dept_id, user.userid)
        }
        const userIds = users.map(item => item.userid)
        await departmentUsersRepo.updateInvalidInfo(depUsers.dept_id, userIds)
        if (depUsers.dep_chil && depUsers.dep_chil.length > 0) {
            await loopSaveDeptUserAndSetInvalidInfo(depUsers.dep_chil)
        }
    }
}

const syncUserWithDepartment = async () => {
    console.log("同步进行中...")
    const usersWithDepartment = await dingDingService.getUsersWithDepartmentFromDingDing()
    // 添加需要补充的人员信息
    for (const extension of extensionsConst.getExtensions()) {
        const user = usersWithDepartment.find(user => user.userid === extension.userId)
        if (!user) {
            continue
        }
        // 补充附加属性
        if (extension.attachValues) {
            for (const attachKey of Object.keys(extension.attachValues)) {
                user[attachKey] = extension.attachValues[attachKey]
            }
        }
        // 部门信息扩展
        if (extension.depsExtensions) {
            for (const deptExt of extension.depsExtensions) {
                const tmpDeps = user.leader_in_dept.filter(dept => dept.dept_id.toString() === deptExt.deptId)
                if (tmpDeps.length > 0) {
                    tmpDeps[0].statForms = deptExt.statForms
                }
            }
        }
        // 添加虚拟部门
        // if (extension.virtualDeps) {
        //     user.leader_in_dept.push(...extension.virtualDeps)
        // }
    }
    
    await redisUtil.set(redisKeys.Users, JSON.stringify(usersWithDepartment))
    globalSetter.setGlobalUsers(usersWithDepartment)
    await userService.syncUserToDB(usersWithDepartment)
    logger.info("同步完成：syncUserWithDepartment")
    console.log("同步完成")
}

const syncForm = async (userId) => {
    console.log("同步进行中...")
    await flowFormService.syncFormsFromDingDing(userId)
    logger.info("同步完成：syncForm")
    console.log("同步完成")
}

const syncUserLogin = async () => {
    console.log("同步进行中...")
    const userOnlineInRedis = await redisUtil.getKeys(
        `${onlineCheckConst.REDIS_LOGIN_KEY_PREFIX}:*`)
    
    if (userOnlineInRedis && userOnlineInRedis.length > 0) {
        const userIdsOnlineInRedis = userOnlineInRedis.map(item => item.split(":")[1])
        
        const pageData = await userLogService.getUserLogs(0, 999, "",
            [dateUtil.startOfDay(dateUtil.dateOfEarliest()), dateUtil.endOfToday()],
            true)
        const usersOnlineInDb = pageData.data
        for (const user of usersOnlineInDb) {
            if (!userIdsOnlineInRedis.includes(user.userId)) {
                await userLogService.setUserDown(user.userId)
            }
        }
    }
    logger.info("同步完成：syncUserLogin")
    console.log("同步完成")
}

const syncResignEmployeeInfo = async () => {
    console.log("同步进行中...")
    const {access_token: accessToken} = await redisRepo.getToken()
    const allResignEmployees = await intelligentHRReq.getResignEmployees(accessToken)
    // 更新人员离职信息
    const onJobEmployees = await redisRepo.getAllUsersDetail()
    
    for (const employee of allResignEmployees) {
        if (resignEmployeePatch.userIds.includes(employee.userId)) {
            continue
        }
        
        let user = null
        try {
            user = await userRepo.getUserDetails({dingdingUserId: employee.userId})
        } catch (e) {
            if (e.code === errorCodes.userError) {
                continue
            }
        }
        
        if (!user) {
            continue
        }
        
        // employee中的userId和db中的userId不对应，对应dingdingUserId
        if (user.isResign) {
            continue
        }
        
        user.dingdingUserId = employee.userId
        if (employee.lastWorkDay) {
            user.lastWorkDay = dateUtil.convertTimestampToDate(employee.lastWorkDay)
        }
        user.isResign = true
        user.resignStatus = employee.status
        user.preStatus = employee.preStatus
        user.reasonMemo = employee.reasonMemo
        user.voluntaryReason = JSON.stringify(employee.voluntaryReason)
        user.passiveReason = JSON.stringify(employee.passiveReason)
        user.handoverUserId = employee.handoverUserId
        user.status = 0 // 停用
        if (employee.handoverUserId) {
            const tmpHandoverUsers = onJobEmployees.filter(user => user.userid === employee.handoverUserId)
            if (tmpHandoverUsers.length > 0) {
                user.handoverUserName = tmpHandoverUsers[0].name
            }
        }
        await userRepo.updateUserResignInfo(user)
    }
    logger.info("同步完成：syncResignEmployeeInfo")
    console.log("同步完成")
}

/**
 * 将Redis中的数据同步到数据库中
 * 当前需求时为了更准确的从sql中计算所有完成的工作
 *
 * 可以简单粗暴的进行删除-插入：核心的工作统计还是redis+process进行
 *
 * @returns {Promise<void>}
 */
const syncRunningProcess = async () => {
    console.time("syncRunningProcess")
    await processTmpRepo.truncate()
    await processReviewTmpRepo.truncate()
    await processDetailsTmpRepo.truncate()
    
    const todayRunningFlows = await redisRepo.getTodayRunningAndFinishedFlows()
    let count = 1
    for (const flow of todayRunningFlows) {
        console.log(`${count}/${todayRunningFlows.length}`)
        await processTmpRepo.save(flow)
        count = count + 1
    }
    logger.info("同步完成：syncRunningProcess")
    console.timeEnd("syncRunningProcess")
}

const syncOaProcessTemplates = async () => {
    console.log("同步进行中...")
    const {access_token: accessToken} = await redisRepo.getToken()
    const data = await oaReq.getOAProcessTemplates(accessToken, adminConst.adminDingDingId)
    for (const template of data.result) {
        template.modifiedTime = dateUtil.formatGMT2Str(template.gmtModified)
        try {
            await oaProcessTemplateRepo.save(template, false)
        } catch (e) {
            if (e.name === sequelizeErrorConst.SequelizeUniqueConstraintError) {
                await oaProcessTemplateRepo.update(template, template.processCode)
            } else {
                throw e
            }
        }
    }
    logger.info("同步完成：syncOaProcessTemplates")
    console.log("同步完成")
}


/*
* 天猫异常定时任务*/
const tmallLinkAnomalyDetection = async () => {
    logger.info("天猫链接异常同步进行中...")
    const originalString = await singleItemTaoBaoService.getLatestBatchIdRecords(1)
    let formattedArray = [originalString[0].batchId, originalString[0].batchId];
    //获得天猫链接数据异常的链接id
    const Links = await tianmao__user_tableService.getExceptionLinks(2);
    //循环 Links 里面的数据
    for (const link of Links) {
        let quantity = await singleItemTaoBaoService.updateCustom(link.id, link.name);
    }
    
    //更新来自链接数据面板的属性 更新自动打标 [累计60天负利润]功能 以及 [累计60天负利润]功能 (时间是自动更新的 默认是昨天的链接数据) 1代表昨天
    await singleItemTaoBaoService.Calculateyesterdaysdataandtagtheprofitin60days()
    const result = await singleItemTaoBaoService.getSearchDataTaoBaoSingleItem(14)

    // 获得所有负责人的信息
    const productLineLeaders = result.productLineLeaders.reduce((acc, group) => {
        // 使用展开操作符将当前对象的第一个键对应的数组的所有元素添加到累加器数组中
        acc.push(...group[Object.keys(group)[0]]);
        return acc;
    }, []); // 初始值是一个空数组 []
    logger.info("天猫链接异常同步进行中...来到了负责人这里", productLineLeaders)
    
    const singleItems = await singleItemTaoBaoService.getAllSatisfiedSingleItems(
        productLineLeaders,
        null,
        null,
        null,
        null,
        null,
        null,
        formattedArray,
        null)
    // 查询所有负责人属于 异常的链接的数据
    const data = await getLinknewvaCount(singleItems, productLineLeaders, formattedArray)
    logger.info("天猫总异常...", data)

//创建一个字典以合并正在进行的和按“name”完成
    const merged = {};
    data.ongoing.items.concat(data.done.items).forEach(item => {
        if (!merged[item.name]) {
            merged[item.name] = {...item};
        } else {
            merged[item.name].ids = Array.from(new Set([...merged[item.name].ids, ...item.ids]));
        }
    });

//将合并的字典转换为数组
    const xx = Object.values(merged);
    logger.info("天猫总异常之 运行中异常+已完成异常...", xx)
    const notStartedExceptions = {items: [], sum: 0};
    
    data.error.items.forEach(item => {
        const xxItem = xx.find(xxItem => xxItem.name === item.name);
        if (xxItem) {
            const remainingRecordTheLinkID = item.recordTheLinkID.filter(record => !xxItem.ids.includes(record.linkId));
            if (remainingRecordTheLinkID.length > 0) {
                notStartedExceptions.items.push({
                    name: item.name,
                    recordTheLinkID: remainingRecordTheLinkID
                });
            }
        } else {
            notStartedExceptions.items.push({
                name: item.name,
                recordTheLinkID: item.recordTheLinkID
            });
        }
    });
    //转换数据
    logger.info("天猫=====>异常...", notStartedExceptions.items)
    const userlist = await userService.getDingDingUserIdAndNickname()
    const linkIdMap = notStartedExceptions.items.reduce((acc, item) => {
        item.recordTheLinkID.forEach((record) => {
            const matchingUser = userlist.find((user) => user.nickname === record.operationLeader);
            const uuid = matchingUser ? matchingUser.dingding_user_id : null;
            //不记录undefined 的数据
            if (acc[record.linkId]) {
                //如果 linkId 已存在，则将新名称推送到数组
                if (Array.isArray(acc[record.linkId].name)) {
                    acc[record.linkId].name.push(item.name);
                } else {
                    acc[record.linkId].name = [acc[record.linkId].name, item.name];
                }
                acc[record.linkId].operationLeader = record.operationLeader;
                acc[record.linkId].linkType = record.linkType;
                acc[record.linkId].uuid = uuid;
                //产品名称
                acc[record.linkId].productName = record.name;
            } else {
                acc[record.linkId] = {
                    productName: record.name,
                    name: [item.name],
                    operationLeader: record.operationLeader,
                    linkType: record.linkType,
                    uuid: uuid,
                };
            }
        });
        return acc;
    }, {});

// 清理 undefined 键值对 cleanedLinkIdMap 现在是什么类型的数据
    const cleanedLinkIdMap = Object.entries(linkIdMap)
        //删除key 为undefined的
        .filter(([key, value]) =>
            key !== 'undefined'
            //删除 value的name 是数组  如果只是费比超过15%的  比如 name:['费比超过15%‘]和 linkType的标签是新品30 或者新品60 这条数据过滤掉
            && !((Array.isArray(value.name) && value.name.length === 1 && value.name[0] === '费比超过15%' && (value.linkType === '新品30' || value.linkType === '新品60')))
        )
        .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});
    
    
    logger.info("天猫最终异常...", cleanedLinkIdMap)
    
    
    const formId = "FORM-51A6DCCF660B4C1680135461E762AC82JV53";
    const processCode = "TPROC--YAB66P61TJ4MHTIKCZN606A840IS3MVPXMLXL2";
    
    const sendRequests = async () => {
        for (const [key, value] of Object.entries(cleanedLinkIdMap)) {
            //删除 value的name 是数组 有其它的异常 比如 name:['费比超过15%','老品利润率低于15%']   linkType的标签是新品30 或者新品60   删除掉  费比超过15% 这个数组中的费比超过15%
            if (Array.isArray(value.name) && value.name.length > 1 && value.name.includes('费比超过15%') && (value.linkType === '新品30' || value.linkType === '新品60')) {
                value.name = value.name.filter(name => name !== '费比超过15%');
            }
            
            const userId = value.uuid;
            const multiSelectField_lwufb7oy = value.name;
            // const cascadeDateField_lloq9vjk = getNextWeekTimestamps();
            const textField_liihs7kv = value.productName + key;
            const textField_liihs7kw = key;
            const employeeField_liihs7l0 = [userId];
            //value.linkType === '新品30' 或者是value.linkType === '新品60' 都改成新品
            value.linkType = value.linkType === '新品30' || value.linkType === '新品60' ? '新品' : value.linkType;
            const formDataJsonStr = JSON.stringify({
                radioField_lxlncgm1: "天猫",
                textField_liihs7kv,
                textField_liihs7kw,
                employeeField_liihs7l0,
                selectField_liihs7kz: value.linkType.toString(),
                multiSelectField_lwufb7oy,
            }, null, 2);
            
            try {
                 await dingDingService.createProcess(formId, "02353062153726101260", processCode, formDataJsonStr);
                logger.info(`发起宜搭  运营优化流程 for linkId ${key} formDataJsonStr ${formDataJsonStr}`);
            } catch (e) {
                logger.error(`发起宜搭  运营优化流程 失败 for linkId ${key}`, e);
            }
        }
    };
    await sendRequests();
    
    
    logger.info("同步完成：天猫链接异常检测")
}

/**
 * 将已完成和取消的流程入库
 *
 * @param processCode
 * @returns {Promise<void>}
 */
const syncHROaFinishedProcess = async (processCode) => {
    const finishedOaProcesses = await getHROaDifferentStatusProcess(processCode, [flowConst.oaApprovalStatus.COMPLETED, flowConst.oaApprovalStatus.TERMINATED], null)
    for (const oaProcess of finishedOaProcesses) {
        await oaProcessRepo.save(oaProcess)
    }
}

/**
 * 将进行中的流程保存到Redis
 *
 * @param processCodes
 * @returns {Promise<void>}
 */
const syncHROaNotStockedProcess = async (processCodes) => {
    let allNotStockedOaProcesses = []
    for (const processCode of processCodes) {
        const notStockedOaProcesses = await getHROaDifferentStatusProcess(
            processCode,
            [flowConst.oaApprovalStatus.RUNNING, flowConst.oaApprovalStatus.COMPLETED, flowConst.oaApprovalStatus.TERMINATED],
            null)
        allNotStockedOaProcesses = allNotStockedOaProcesses.concat(notStockedOaProcesses)
    }
    
    await redisUtil.set(redisKeys.Oa, JSON.stringify(allNotStockedOaProcesses))
}

/**
 * 获取流程数据
 *
 * @param processCode oa流程表单id
 * @param statuses 流程状态
 * @param startTime 筛选的开始时间，为空时，从数据库中获取，库中不存在时，设置为最早的时间：2024-06-01 00:00:00
 * @returns {Promise<*[]>}
 */
const getHROaDifferentStatusProcess = async (processCode, statuses, startTime) => {
    const oAFormLatestDoneTime = startTime || new Date(await oaProcessRepo.getOAFormLatestDoneTime(processCode) || "2024-06-01 00:00:00").valueOf()
    const endTimeStamp = Date.now()
    const {access_token: token} = await redisRepo.getToken()
    const allUsers = await userRepo.getAllUsers({isResign: false})
    const userIds = allUsers.map(item => item.dingdingUserId)
    
    const getPagingOAProcessIds = async (token, processCode, startTime, endTime, nextToken, userIds, statuses) => {
        let oaProcessIds = []
        const data = {
            processCode,
            startTime,
            endTime,
            nextToken,
            // 接口限制最大20
            maxResults: 20,
            // 一次最多为10
            userIds,
            statuses
        }
        const result = await oaReq.getOAProcessIds(token, data)
        
        if (result.success) {
            const {list, nextToken} = result.result
            oaProcessIds = oaProcessIds.concat(list)
            if (nextToken) {
                const pagingOaProcessIds = await getPagingOAProcessIds(token, processCode, startTime, endTime, nextToken, userIds)
                oaProcessIds = oaProcessIds.concat(pagingOaProcessIds)
            }
        }
        return oaProcessIds
    }
    
    let oaProcessIds = []
    while (userIds.length > 0) {
        const _10UserIds = userIds.splice(0, Math.min(10, userIds.length))
        const tmpOaProcessIds = await getPagingOAProcessIds(
            token,
            processCode,
            oAFormLatestDoneTime,
            endTimeStamp,
            0,
            _10UserIds,
            statuses)
        oaProcessIds = oaProcessIds.concat(tmpOaProcessIds)
    }
    
    let oaProcesses = []
    for (const oaProcessId of oaProcessIds) {
        const details = await oaReq.getOAProcessDetails(token, oaProcessId)
        if (details.success) {
            details.result.processCode = processCode
            details.result.processInstanceId = oaProcessId
            oaProcesses.push(details.result)
        }
    }
    return oaProcesses.sort((cur, next) => dateUtil.formatGMT(cur.finishTime) - dateUtil.formatGMT(next.finishTime))
}

const syncAttendance = async () => {
    const userIds = (await userRepo.getAllUsers({isResign: false})).map(item => item.dingdingUserId)
    const {access_token: token} = await redisRepo.getToken()
    const result = await attendanceReq.getTodayAttendances(userIds, token)
    for (const item of result) {
        try {
            await attendanceRepo.save(item)
        } catch (e) {
            if (e.name !== sequelizeErrorConst.SequelizeUniqueConstraintError) {
                throw e
            }
        }
    }
}
const resetDingDingApiInvokeCount = async () => {
    await redisUtil.set(redisKeys.StatCountTodayDingDingApiInvoke, 0)
}

const syncVisionOutUsers = async () => {
    const visionOutUsersInDb = await outUsersRepo.getOutUsers({deptId: "482162119"})
    const visionOutUserNamesInDb = visionOutUsersInDb.map(item => item.userName)
    const visionOutUsersInRedis = await redisRepo.getOutSourcingUsers("482162119")
    const visionOutUsersNotInDb = visionOutUsersInRedis.filter(item => !visionOutUserNamesInDb.includes(item))
    for (const user of visionOutUsersNotInDb) {
        await outUsersRepo.saveOutUser({userName: user, deptId: "482162119", deptName: "视觉部"})
    }
}


async function saveFlowsToLocalFile(filePath, flows) {
    // 将 flows 写入本地文件
    await writeFile(filePath, JSON.stringify(flows), 'utf8');
}

async function readFlowsFromLocalFile(filePath) {
    // 从本地文件读取 flows
    const data = await readFile(filePath, 'utf8');
    return JSON.parse(data);
}

async function saveFlowsToRedisFromFile() {
    console.log("来到这里")
    const filePath = join(__dirname, '../logs/flows.json');
    const flowsto = join(__dirname, '../logs/flowsto.json');
    console.log(filePath)
    // 从本地文件读取 flows 内容
    const fileContent = await readFlowsFromLocalFile(filePath);
    const flowstoContent = fileContent.filter(obj => obj.formUuid === 'FORM-33666CB1FV8BQCCE9IWPV4DYQIEJ34M5Q9IILP');

    await saveFlowsToLocalFile(flowsto, flowstoContent);


    // 查看
    console.log(redisConfig.url)
    // 将内容设置到 Redis
    await redisUtil.set(redisKeys.TodayRunningAndFinishedFlows, JSON.stringify(fileContent));
}

const syncProcessVersions = async (cookies) => {
    const forms = await flowFormRepo.getAllForms({})
    let allProcessVersions = []
    for (const form of forms) {
        const processCode = form.processCode
        if (!processCode) {
            continue
        }
        const processVersions = await crawlingPageReq.getProcessVersions(processCode, cookies)
        allProcessVersions = allProcessVersions.concat(processVersions)
    }
    await flowFormProcessVersionRepo.save(allProcessVersions)
    return true
}



const jdLinkDataIsAutomaticallyInitiated = async () => {
    logger.info("京东同步进行中...")
    const userList = await userService.getDingDingUserIdAndNickname()
    const removeDuplicateLinkIds = async () => {
        const runningFightingFlows = await getInquiryTodayjdDailyReport();

        // 使用 Set 存储已出现的 linkId
        const seenLinkIds = new Set();
        const uniqueFlows = runningFightingFlows.filter(item => {
            if (!seenLinkIds.has(item.linkId)) {
                seenLinkIds.add(item.linkId);
                return true;
            }
            return false;
        });
        for (const runningFightingFlow of uniqueFlows) {
            const listingInfo = runningFightingFlow.listingInfo;
            const selectField_lma827of = (listingInfo === '新品30' || listingInfo === '新品60') ? '新品' : '老品';

            if (selectField_lma827of==='老品'){
                const maintenance=await  getOperateAttributesMaintainer(runningFightingFlow.linkId)
                runningFightingFlow.operationsLeader = maintenance.maintenanceLeader
            }

            if(runningFightingFlow.operationsLeader==="无操作"){
                logger.info(" 发送通知 ?--->..."+runningFightingFlow.linkId,runningFightingFlow.operationsLeader,runningFightingFlow.questionType)
            }else {
                const matchingUser = userList.find((user) => user.nickname === runningFightingFlow.operationsLeader);
                const uuid = matchingUser ? matchingUser.dingding_user_id : null;

                const textField_lma827od = runningFightingFlow.code
                const employeeField_lma827ok= uuid
                const textField_lma827oe= runningFightingFlow.linkId


                const checkboxField_m11r277t = runningFightingFlow.questionType
                const  radioField_locg3nxq= '简单'

                const formDataJsonStr = JSON.stringify({
                    textField_lma827od,
                    employeeField_lma827ok,
                    textField_lma827oe,
                    selectField_lma827of,
                    checkboxField_m11r277t,
                    radioField_locg3nxq
                }, null, 2);
                 await dingDingService.createProcess('FORM-KW766OD1UJ0E80US7YISQ9TMNX5X36QZ18AMLW', "02353062153726101260", 'TPROC--KW766OD1UJ0E80US7YISQ9TMNX5X36QZ18AMLX', formDataJsonStr);
            }
            }
            }
            await removeDuplicateLinkIds();
    logger.info("同步完成：京东异常发起")
    };

const purchaseSelectionMeetingInitiated = async () => {
    await  sendDingReportBao()
}
// 转正通知
const confirmationNotice = async () => {
await  timingSynchronization()
}



async function executeTask(type) {
    //增加延迟时间，防止数据未及时更新
    //随机延迟 1分钟 2分钟 3分钟
    let random = Math.floor(Math.random() * 3 + 1)
    console.log(random)
    await dateUtil.delay(1000 * 60 * random)
    // 获取当前任务状态，若没有则初始化状态
    const taskStatus = JSON.parse(await redisUtil.get(redisKeys.synchronizedState)) || {
        isRunningTianMao: false,
        isRunningJD: false,
        tianMaoRunTime: null,
        JDRunTime: null,
        taskInterval: 1000 * 60 * 60 * 10 // 任务间隔：默认 10 小时
    };

    const currentTime = new Date().getTime();

    // 任务类型映射
    const taskTypeMap = {
        tianmao: {
            isRunningKey: 'isRunningTianMao',
            lastRunTimeKey: 'tianMaoRunTime',
            taskFunction: tmallLinkAnomalyDetection
        },
        jingdong: {
            isRunningKey: 'isRunningJD',
            lastRunTimeKey: 'JDRunTime',
            taskFunction: jdLinkDataIsAutomaticallyInitiated
        }
    };

    // 检查任务类型是否有效
    if (!taskTypeMap[type]) {
        console.log(`无效的任务类型: ${type}`);
        return;
    }

    const { isRunningKey, lastRunTimeKey, taskFunction } = taskTypeMap[type];

    try {
        // 判断任务是否正在执行，或者距离上次执行不满足间隔
        if (taskStatus[isRunningKey] ||
            (taskStatus[lastRunTimeKey] && currentTime - taskStatus[lastRunTimeKey] < taskStatus.taskInterval)) {
            console.log(`${type} 任务正在执行或未到执行间隔，跳过本次调用`);
            return; // 跳过本次执行
        }

        // 标记任务正在执行
        taskStatus[isRunningKey] = true;
        await redisUtil.set(redisKeys.synchronizedState, JSON.stringify(taskStatus));

        // 执行任务
        console.log(`${type} 任务开始执行`);
        await taskFunction();
        console.log(`${type} 任务执行完成`);
        // 更新任务执行状态
        taskStatus[isRunningKey] = false; // 任务执行完毕，标记为未执行
        console.log(`${type} 任务状态更新成功`);
    } catch (error) {
        // 更新任务执行状态
        taskStatus[isRunningKey] = false; // 任务执行完毕，标记为未执行
        taskStatus[lastRunTimeKey] = currentTime; // 更新最后执行时间
        await redisUtil.set(redisKeys.synchronizedState, JSON.stringify(taskStatus));
        logger.error(`${type} 执行任务时出错:`, error);
    }
    finally {
        taskStatus[lastRunTimeKey] = currentTime; // 更新最后执行时间
        await redisUtil.set(redisKeys.synchronizedState, JSON.stringify(taskStatus));
        await redisUtil.set(redisKeys.synchronizedState, JSON.stringify(taskStatus));
    }
}



module.exports = {
    syncOaProcessTemplates,
    syncRunningProcess,
    syncWorkingDay,
    syncTodayRunningAndFinishedFlows,
    syncMissingCompletedFlows,
    syncDepartment,
    syncDepartmentWithUser,
    syncUserWithDepartment,
    syncForm,
    syncDingDingToken,
    syncUserLogin,
    syncResignEmployeeInfo,
    tmallLinkAnomalyDetection,
    syncHROaNotStockedProcess,
    syncHROaFinishedProcess,
    syncAttendance,
    resetDingDingApiInvokeCount,
    syncVisionOutUsers,
    syncProcessVersions,
    jdLinkDataIsAutomaticallyInitiated,
    purchaseSelectionMeetingInitiated,
    saveFlowsToRedisFromFile,
    confirmationNotice,
    executeTask
}