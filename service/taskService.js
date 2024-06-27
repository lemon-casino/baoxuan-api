const userRepo = require("../repository/userRepo")
const redisRepo = require("../repository/redisRepo")
const oaProcessTemplateRepo = require("../repository/oaProcessTemplateRepo")
const processTmpRepo = require("../repository/processTmpRepo")
const processReviewTmpRepo = require("../repository/processReviewTmpRepo")
const processDetailsTmpRepo = require("../repository/processDetailsTmpRepo")
const departmentRepo = require("../repository/departmentRepo")
const departmentUsersRepo = require("../repository/departmentUsersRepo")
const oaProcessRepo = require("../repository/oaProcessRepo")
const attendanceRepo = require("../repository/attendanceRepo")
const globalSetter = require("../global/setter")
const dingDingService = require("../service/dingDingService")
const flowService = require("../service/flowService")
const flowFormService = require("../service/flowFormService")
const workingDayService = require("../service/workingDayService")
const userLogService = require("../service/userLogService")
const userService = require("../service/userService")
const redisUtil = require("../utils/redisUtil")
const dateUtil = require("../utils/dateUtil")
const {redisKeys} = require("../const/redisConst")
const onlineCheckConst = require("../const/onlineCheckConst")
const extensionsConst = require("../const/tmp/extensionsConst")
const adminConst = require("../const/adminConst")
const flowConst = require("../const/flowConst")
const sequelizeErrorConst = require("../const/sequelizeErrorConst")
const oaReq = require("../core/dingDingReq/oaReq")
const intelligentHRReq = require("../core/dingDingReq/intelligentHRReq")
const attendanceReq = require("../core/dingDingReq/attendanceReq")
const {flowStatusConst} = require("../const/flowConst");
const singleItemTaoBaoService = require("./singleItemTaoBaoService");
const {
    getLinknewvaCount
} = require("./singleItemTaoBaoService");
const {createProcess} = require("../service/dingDingService")
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
            await departmentRepo.saveDepartmentToDb()
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
        if (extension.virtualDeps) {
            user.leader_in_dept.push(...extension.virtualDeps)
        }
    }

    await redisUtil.set(redisKeys.Users, JSON.stringify(usersWithDepartment))
    globalSetter.setGlobalUsers(usersWithDepartment)
    await userService.syncUserToDB(usersWithDepartment)
    logger.info("同步完成：syncUserWithDepartment")
    console.log("同步完成")
}

const syncForm = async () => {
    console.log("同步进行中...")
    await flowFormService.syncFormsFromDingDing()
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
        // employee中的userId和db中的userId不对应，对应dingdingUserId
        const newEmployee = {}
        newEmployee.dingdingUserId = employee.userId
        if (employee.lastWorkDay) {
            newEmployee.lastWorkDay = dateUtil.convertTimestampToDate(employee.lastWorkDay)
        }
        newEmployee.resignStatus = employee.status
        newEmployee.preStatus = employee.preStatus
        newEmployee.reasonMemo = employee.reasonMemo
        newEmployee.voluntaryReason = JSON.stringify(employee.voluntaryReason)
        newEmployee.passiveReason = JSON.stringify(employee.passiveReason)
        newEmployee.handoverUserId = employee.handoverUserId
        if (employee.handoverUserId) {
            const tmpHandoverUsers = onJobEmployees.filter(user => user.userid === employee.handoverUserId)
            if (tmpHandoverUsers.length > 0) {
                newEmployee.handoverUserName = tmpHandoverUsers[0].name
            }
        }
        await userRepo.updateUserResignInfo(newEmployee)
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
    //获得天猫链接数据异常的链接id
    const result = await singleItemTaoBaoService.getSearchDataTaoBaoSingleItem(14)
    // 获得所有负责人的信息
    const productLineLeaders = result.productLineLeaders.reduce((acc, group) => {
        // 使用展开操作符将当前对象的第一个键对应的数组的所有元素添加到累加器数组中
        acc.push(...group[Object.keys(group)[0]]);
        return acc;
    }, []); // 初始值是一个空数组 []
    // logger.info("天猫链接异常同步进行中...来到了负责人这里")
    const singleItems = await singleItemTaoBaoService.getAllSatisfiedSingleItems(
        productLineLeaders,
        null,
        null,
        null,
        null,
        null,
        null,
        //开始时间"2024-06-24", 结束时间  "2024-06-25"
        JSON.parse("[\"2024-06-25 00:0\",\"2024-06-25 23:59\"]"),
        null)
    // 查询所有负责人属于 异常的链接的数据
    const data = await getLinknewvaCount(singleItems, productLineLeaders, ['2024-06-25 00:0', '2024-06-25 23:59'])
    // 获取所有 recordTheLinkID
    const getAllRecordTheLinkID = (items) => {
        return items.reduce((acc, item) => {
            return acc.concat(item.recordTheLinkID);
        }, []);
    };

// 获取所有 ongoing 和 done 的 recordTheLinkID
    const ongoingRecordTheLinkID = getAllRecordTheLinkID(data.ongoing.items);
    const doneRecordTheLinkID = getAllRecordTheLinkID(data.done.items);

// 创建一个 Set 来存储 ongoing 和 done 的 recordTheLinkID
    const ongoingAndDoneRecordTheLinkID = new Set([...ongoingRecordTheLinkID, ...doneRecordTheLinkID]);

// 初始化一个对象来存储没有发起的异常
    const notStartedExceptions = {items: [], sum: 0};

// 从 error 中的每个异常项中移除 ongoing 和 done 中已经存在的 recordTheLinkID
    data.error.items.forEach(item => {
        const remainingRecordTheLinkID = item.recordTheLinkID.filter(id => !ongoingAndDoneRecordTheLinkID.has(id));
        if (remainingRecordTheLinkID.length > 0) {
            notStartedExceptions.items.push({
                name: item.name,
                recordTheLinkID: remainingRecordTheLinkID
            });
            notStartedExceptions.sum += remainingRecordTheLinkID.length;
        }
    });
    //  logger.info("天猫链接异常同步进行中...来到了数据刷选：", notStartedExceptions)

    //转换数据

    const userlist = await userService.getDingDingUserIdAndNickname()
    logger.info("天猫链接异常同步进行中...notStartedExceptions.items：", notStartedExceptions.items)
    const linkIdMap = notStartedExceptions.items.reduce((acc, item) => {
        item.recordTheLinkID.forEach((record) => {
            const matchingUser = userlist.find((user) => user.nickname === record.productLineLeader);
            const uuid = matchingUser ? matchingUser.dingding_user_id : null;
            //不记录undefined 的数据
            if (acc[record.linkId]) {
                acc[record.linkId].name = [acc[record.linkId].name, item.name].join(',');
                acc[record.linkId].productLineLeader = record.productLineLeader;
                acc[record.linkId].linkType = record.linkType;
                acc[record.linkId].uuid = uuid;
                //产品名称
                acc[record.linkId].productName = record.name;
            } else {
                acc[record.linkId] = {
                    productName: record.name,
                    name: item.name,
                    productLineLeader: record.productLineLeader,
                    linkType: record.linkType,
                    uuid: uuid,
                };
            }
        });
        return acc;
    }, {});
    // const linkIdMap = notStartedExceptions.items.reduce((acc, item) => {
    //     item.recordTheLinkID.forEach((record) => {
    //         if (acc[record.linkId]) {
    //             acc[record.linkId].name = [acc[record.linkId].name, item.name].join(',');
    //             acc[record.linkId].productLineLeader = record.productLineLeader;
    //             acc[record.linkId].linkType = record.linkType;
    //         } else {
    //             acc[record.linkId] = {
    //                 name: item.name,
    //                 productLineLeader: record.productLineLeader,
    //                 linkType: record.linkType,
    //             };
    //         }
    //     });
    //     return acc;
    // }, {});

// 清理 undefined 键值对
    const cleanedLinkIdMap = Object.entries(linkIdMap)
        .filter(([key, value]) => key !== 'undefined')
        .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});

    logger.info('transformedData', cleanedLinkIdMap)


    const formId = "FORM-CP766081CPAB676X6KT35742KAC229LLKHIILB";
    const processCode = "TPROC--CP766081CPAB676X6KT35742KAC22BLLKHIILC";
    const getNextWeekTimestamps = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime();
        const end = start + 7 * 24 * 60 * 60 * 1000;
        return [start.toString(), end.toString()];
    };

    const sendRequests = async () => {
        for (const [key, value] of Object.entries(cleanedLinkIdMap)) {
            const userId = value.uuid;
            const multiSelectField_lwufb7oy = value.name.split(',');
            const cascadeDateField_lloq9vjk = getNextWeekTimestamps();
            const textField_liihs7kv = value.productName;

            const formDataJsonStr = JSON.stringify({
                textField_liihs7kv,
                radioField_lx30hv7y: "否",
                radioField_lwuecm6c: "是",
                selectField_liihs7ky: "老猫",
                selectField_liihs7kz: "老品问题",
                multiSelectField_lwufb7oy,
                cascadeDateField_lloq9vjk
            }, null, 2);

            try {
                await dingDingService.createProcess(formId, userId, processCode, formDataJsonStr);
                logger.info(`发起宜搭 bi测试流程成功 for linkId ${key}`);
            } catch (e) {
                logger.error(`发起宜搭 bi测试流程失败 for linkId ${key}`, e);
            }
        }
    };
    await sendRequests();
    /*    // bi测试流程
        const formId = "FORM-CP766081CPAB676X6KT35742KAC229LLKHIILB"
        const userId = "223851243926087312"
        const processCode = "TPROC--CP766081CPAB676X6KT35742KAC22BLLKHIILC"
        const formDataJsonStr = "{\n" +
            "  \"textField_liihs7kv\": \"113测试\",\n" +
            "  \"radioField_lx30hv7y\": \"否\",\n" +
            "  \"radioField_lwuecm6c\": \"是\",\n" +
            "  \"selectField_liihs7ky\": \"老猫\",\n" +
            "  \"selectField_liihs7kz\": \"老品问题\",\n" +
            "  \"multiSelectField_lwufb7oy\": [\"累计60天负利润\",\"老品利润率低于15%\"],\n" +
            "  \"cascadeDateField_lloq9vjk\": [\"1719417600000\",\"1719763200000\"],\n" +
            "}"


        await dingDingService.createProcess(formId, userId, processCode, formDataJsonStr).catch(
            e => {
                logger.error("发起宜搭 bi测试流程失败", e)
            }
        ).finally(
            () => {
                logger.info("发起宜搭 bi测试流程成功")
            }
        )*/

    //发起宜搭 bi测试流程


    //所有的异常 id 减去正在进行中的异常 减去已完成的 剩下的 都是需要推送的异常


    //是否需要从redis中获取正在进行中的流程


    // 获得运营优化方案 FORM-CP766081CPAB676X6KT35742KAC229LLKHIILB 的redis 运行中的流程
    //  const runningFlows = await redisRepo.getTodayRunningAndFinishedFlows()


    logger.info("同步完成：天猫链接异常检测")
}


tmallLinkAnomalyDetection().then(r => {
    console.log("xx")
})
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
    syncResignEmployeeInfo,
    syncHROaNotStockedProcess,
    syncHROaFinishedProcess,
    syncAttendance,
    resetDingDingApiInvokeCount
}