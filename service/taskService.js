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
            const matchingUser = userlist.find((user) => user.nickname === record.productLineLeader);
            const uuid = matchingUser ? matchingUser.dingding_user_id : null;
            //不记录undefined 的数据
            if (acc[record.linkId]) {
                //如果 linkId 已存在，则将新名称推送到数组
                if (Array.isArray(acc[record.linkId].name)) {
                    acc[record.linkId].name.push(item.name);
                } else {
                    acc[record.linkId].name = [acc[record.linkId].name, item.name];
                }
                acc[record.linkId].productLineLeader = record.productLineLeader;
                acc[record.linkId].linkType = record.linkType;
                acc[record.linkId].uuid = uuid;
                //产品名称
                acc[record.linkId].productName = record.name;
            } else {
                acc[record.linkId] = {
                    productName: record.name,
                    name: [item.name],
                    productLineLeader: record.productLineLeader,
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
                logger.info(`发起宜搭  运营优化流程 for linkId ${key}`);
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
    const filePath = join(__dirname, '../logs/flows.json');
    // 从本地文件读取 flows 内容
    const fileContent = await readFlowsFromLocalFile(filePath);
    // console.log(fileContent)
    // 查看
    console.log(redisConfig.url)
    // 将内容设置到 Redis
    await redisUtil.set(redisKeys.TodayRunningAndFinishedFlows, JSON.stringify(fileContent));
}

const getProcessVersions = async (page, pageSize, processCode, cookies) => {
    let processVersions = []
    const result = await axios.get(`https://t8sk7d.aliwork.com/alibaba/web/APP_BXS79QCC8MY5ZV0EZZ07/query/process/pageProcessVersion.json?processCode=${processCode}&appType=APP_BXS79QCC8MY5ZV0EZZ07&status=&pageIndex=${page}&pageSize=${pageSize}&orderByCreateTime=desc`, {
        "headers": {
            "cookie": cookies,
            "Referer": `https://t8sk7d.aliwork.com/dingtalk/web/APP_BXS79QCC8MY5ZV0EZZ07/design/newDesigner?processCode=${processCode}`,
        }
    })
    
    const pagingData = result.data.content
    if ("data" in pagingData && "totalCount" in pagingData) {
        const {data, totalCount} = pagingData
        processVersions = processVersions.concat(data)
        
        const hasMore = totalCount > page * pageSize + data.length
        if (hasMore) {
            const currPageData = await getProcessVersions(page + 1, pageSize, processCode, cookies)
            processVersions = processVersions.concat(currPageData)
        }
    }
    return processVersions
}

const syncProcessVersions = async (cookies) => {
    const forms = await flowFormRepo.getAllForms({})
    let allProcessVersions = []
    for (const form of forms) {
        const processCode = form.processCode
        if (!processCode) {
            continue
        }
        cookies = "x-hng=lang=zh-CN; cna=CYHYHnrmpS4CAXLxWanIPjyt; corp_id=dingf5e887e4d232b1b835c2f4657eb6378f; login_type=514E440D8469FCA0F295D0E60E2491CD; tianshu_corp_id=dingf5e887e4d232b1b835c2f4657eb6378f; corp_industry_info=%7B%22hasIndustryAddressBook%22%3Afalse%2C%22industryType%22%3A%22INDUSTRY_GENERAL%22%7D; tianshu_user_identity=%7B%22inIndustry%22%3Afalse%2C%22innerCorp%22%3Atrue%2C%22userIdentitySet%22%3A%5B%22CORP_INNER%22%5D%7D; tianshu_corp_user=dingf5e887e4d232b1b835c2f4657eb6378f_156133016423090865; tianshu_csrf_token=598c404a-de03-4f9e-89eb-77dbd0de7a15; c_csrf=598c404a-de03-4f9e-89eb-77dbd0de7a15; xlly_s=1; yida_user_cookie=CB5431D466A6D58B2793047ADBA2564143EA429BE6C03153A28EB9B9B2C69823566FC0D0099E946D10CF82B46D6C9D21CCA447D1D2CB0BDCE9D5244E1B5ECE87049B16D873EF84079D471211BDBBEF4624E93F6936FC164BE6216400BF472F881C69A5731B50EC15A385FC27DFB95E1F13EDCFDB7A52CFAF0B255C2E340B58C4CEB161A17F9A974551DEBBE37570117D0AD2F220AED8696396E9D6DF60CA9CF4503C160AFE6EB3DDCB184EFBC0CFE96CA9BF49A167B98EF53C40AEE59E33D2BE04B28FCBAB1D666482E0FB232582C7BECF95ADB000609D6AA889F5B8804D7CD332240E8E9D3551528C8ABEA695B14F7430F339B3F90796A6AAFB9B60422AA70F3844C4764F105BB70D2CFADB0C6879D331B9BAB4A0FB7CF89DEAB7597923EEF8229E6A8E04710EEE01AFC7D61CB6761BCB064DECCCD81B6E3CD553BA9175EF5A8950A3F367E789163055AAED2F495E49D43E393A4372771A03789383CBD7E1D6; account=oauth_k1%3AuRO6WOx8Gt%2BnJam2zn7vEifsNjzMDn7Q4b5QMZl5vx51H%2FVQwZ8egTDSrrjSGrVkjK3IQ2yKV6fj%2Fe3JNOqUO6y%2BUlhfcaLmlheDyqjN7rM%3D; isg=BNvb6PHLOdJaSEVHLkLKII1bajlFsO-ykULSb80Yt1rxrPuOVYB_AvmvRgwijEeq; tfstk=fRknA6VQ1P_bs0jJ-A2Bwzx8JGROOwwSU4B8y8Uy_Pz1eazKJNruS42-v9eLaU4iPyFLLBotXfkRP96FTRUsUkPCAk556ckx9gaPLJozaqnxvXBLL1gsZA0uNHa8zz0-4XK9HKnIA8wrrEpvH56HpEH3zaezquzJ-ELvHddFb8YHkbe2JnygVPrU4yzyjRr8x85UT4za_orA88yrzc-g2u5FzTzF7OrSgmWzoYksQerekSOzOjkgxWRtYPWzfAq3troEKTWr0kV3uDzMki1T2703tAphlkcZmcEnPK6QL7crpRke7LyZcf3Uj48cZPlmdYVxKEfb8vaSSShHo90mRuou42vfmPknqAVI6iBmjSDZpJGMotUq10ku_DTcGlhrDvhoJF6zJjmZSSHOWteqGVDug-Sza154E_W7b3HGN_NUfl4fnYtRJBopp2KMjsOQTlZpkhxGNMFUfke9jhff4Wr_ACf..; tianshu_app_type=default_tianshu_app; due=BF67507217B92DE228242C2B7B8C9F5F5FC7EB63F26A7E3435F28D7D07E6A730; JSESSIONID=6E3E5EF5744F5C622B421031FC4E7C00"
        const processVersions = await getProcessVersions(1, 99, processCode, cookies)
        allProcessVersions = allProcessVersions.concat(processVersions)
    }
    await flowFormProcessVersionRepo.save(allProcessVersions)
    return true
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
    saveFlowsToRedisFromFile,
    syncProcessVersions
}