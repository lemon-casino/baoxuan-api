const userRepo = require("../repository/userRepo")
const redisRepo = require("../repository/redisRepo")
const processTmpRepo = require("../repository/processTmpRepo")
const processReviewTmpRepo = require("../repository/processReviewTmpRepo")
const processDetailsTmpRepo = require("../repository/processDetailsTmpRepo")
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
const models = require("../model");
const uuidUtil = require("../utils/uuidUtil");
const flowFormDetailsRepo = require("../repository/flowFormDetailsRepo");

const syncWorkingDay = async () => {
    console.log("同步进行中...")
    const date = dateUtil.format2Str(new Date(), "YYYY-MM-DD")
    const isWorkingDay = await dingDingService.isWorkingDay(date)
    if (isWorkingDay) {
        await workingDayService.saveWorkingDay(date)
        await redisUtil.rPush(redisKeys.WorkingDays, date)
    }
    console.log("同步完成")
}

const syncTodayRunningAndFinishedFlows = async () => {
    logger.info("开始同步今日流程数据...")
    const flows = await dingDingService.getTodayRunningAndFinishedFlows()
    await redisUtil.setValue(redisKeys.TodayRunningAndFinishedFlows, JSON.stringify(flows))
    globalSetter.setGlobalTodayRunningAndFinishedFlows(flows)
    logger.info(`同步完成，共:${flows.length}条数据`)
}

const syncMissingCompletedFlows = async () => {
    console.log("同步进行中...")
    await flowService.syncMissingCompletedFlows()
    console.log("同步完成")
}

const syncDingDingToken = async () => {
    await dingDingService.getDingDingToken()
}

const syncDepartment = async () => {
    console.log("同步进行中...")
    const depList = await dingDingService.getDepartmentFromDingDing()
    await redisUtil.setValue(redisKeys.Departments, JSON.stringify(depList.result))
    globalSetter.setGlobalDepartments(depList.result)
}

const syncDepartmentWithUser = async () => {
    console.log("同步进行中...")
    const allDepartmentsWithUsers = await dingDingService.getDepartmentsWithUsersFromDingDing()
    await redisUtil.setValue(redisKeys.DepartmentsUsers, JSON.stringify(allDepartmentsWithUsers))
    globalSetter.setGlobalUsersOfDepartments(allDepartmentsWithUsers)
    console.log("同步完成")
}

const syncUserWithDepartment = async () => {
    console.log("同步进行中...")
    const usersWithDepartment = await dingDingService.getUsersWithDepartmentFromDingDing()
    // 添加需要补充的人员信息
    for (const extension of extensionsConst.userDeptExtensions) {
        for (let user of usersWithDepartment) {
            if (user.userid === extension.userId) {
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
                break
            }
        }
    }

    await redisUtil.setValue(redisKeys.Users, JSON.stringify(usersWithDepartment))
    globalSetter.setGlobalUsers(usersWithDepartment)
    await userService.syncUserToDB(usersWithDepartment)
    console.log("同步完成")
}

const syncForm = async () => {
    console.log("同步进行中...")
    await flowFormService.syncFormsFromDingDing()
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
    console.log("同步完成")
}

const syncResignEmployeeInfo = async () => {
    console.log("同步进行中...")
    const {access_token: accessToken} = await redisRepo.getToken()
    const allResignEmployees = await userRepo.getResignEmployees(accessToken)
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
    console.timeEnd("syncRunningProcess")
}

module.exports = {
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
    syncResignEmployeeInfo
}