const _ = require("lodash")
const FlowForm = require("@/model/flowfrom")
const flowRepo = require("@/repository/flowRepo")
const flowFormRepo = require("@/repository/flowFormRepo")
const userRepo = require("@/repository/userRepo")
const departmentRepo = require("@/repository/departmentRepo")
const departmentFlowFormRepo = require("@/repository/departmentFlowFormRepo")
const formService = require("@/service/flowFormService")
const departmentService = require("@/service/departmentService")
const dingDingService = require("@/service/dingDingService")
const processService = require("@/service/processService")
const flowCommonService = require("./common/flowCommonService")
const redisRepo = require("@/repository/redisRepo")
const globalGetter = require("@/global/getter")
const globalSetter = require("@/global/setter")
const dateUtil = require("@/utils/dateUtil")
const flowUtil = require("@/utils/flowUtil")
const flowFormReviewUtil = require("@/utils/flowFormReviewUtil")
const NotFoundError = require("@/error/http/notFoundError")
const ParameterError = require("@/error/parameterError")
const userFlowStat = require("@/core/statistic/userFlowsStat")
const {flowReviewTypeConst, flowStatusConst} = require("@/const/flowConst")
const noRequiredStatActivityConst = require("@/const/tmp/noRequiredStatActivityConst")
const whiteList = require("@/config/whiteList")
const extensionsConst = require("@/const/tmp/extensionsConst")
const deptHiddenFormsConst = require("@/const/tmp/deptHiddenFormsConst")
const deptFlowFormConst = require("@/const/deptFlowFormConst")
const patchUtil = require("@/patch/patchUtil")
const userCommonService = require("@/service/common/userCommonService");
const outUsersRepo = require("@/repository/outUsersRepo");
const newFormsRepo = require('../repository/newFormsRepo')
const { designerTags, nameFilter, tableHeaderExtra } = require("../const/newFormConst")
const userOperationRepo = require("../repository/operation/userOperationRepo")
const userFlowSettingRepo = require("../repository/userFlowSettingRepo")
const { typeList, operationSelectionFlow, operationSelectionFlowNode, analysisFieldMap, analysisFlowUUid, analysisLinkPrevious } = require("../const/operationConst")
const moment = require('moment')
const { createProcess } =  require('./dingDingService')

const filterFlowsByTimesRange = (flows, timesRange) => {
    const satisfiedFlows = []
    for (const flow of flows) {
        // 筛选符合条件 flow
        const createTime = dateUtil.formatGMT(flow.createTimeGMT)
        const startTime = new Date(timesRange[0])
        const endTime = new Date(timesRange[1])
        
        if (createTime >= startTime && createTime <= endTime) {
            satisfiedFlows.push(flow)
        }
    }
    return satisfiedFlows;
}

const filterFlowsByImportanceCondition = async (flows, importanceCondition) => {
    const allForms = await FlowForm.getFlowFormList()
    const satisfiedFlows = []
    for (const flow of flows) {
        const {type, forms} = importanceCondition
        if (forms && forms.includes(flow.formUuid)) {
            satisfiedFlows.push(flow)
            continue
        }
        const formDetails = allForms.filter((form) => {
            return form.formUuid === flow.formUuid
        })
        
        if ((type === "important" && formDetails[0].status === "1") || (type === "unImportant" && formDetails[0].status === "2")) {
            satisfiedFlows.push(flow)
        }
    }
    return satisfiedFlows;
}

const getFlowsOfDepartmentBy = async (departments, selfJoinOrLaunch, timesRange, formImportanceCondition) => {
    //  获取部门下所有人员的参与的符合条件的流程
    const satisfiedSelfFlows = [];
    for (const department of departments) {
        const depUsers = department.dep_user;
        for (const user of depUsers) {
            const satisfiedFlowOfTimesRange = await filterFlowsByTimesRange(user[selfJoinOrLaunch], timesRange)
            // 需要去重
            const uniqueFlowsKeys = {}
            const uniqueFlows = []
            for (const flow of satisfiedFlowOfTimesRange) {
                if (!Object.keys(uniqueFlowsKeys).includes(flow.processInstanceId)) {
                    uniqueFlows.push(flow)
                }
            }
            const satisfiedFlowOfImportance = await filterFlowsByImportanceCondition(uniqueFlows, formImportanceCondition)
            satisfiedSelfFlows.push(satisfiedFlowOfImportance)
        }
    }
    return satisfiedSelfFlows
}

const filterFlowByFlowStatus = (flows, flowStatus) => {
    const satisfiedFlows = flows.filter((flow) => {
        return flow.instanceStatus === flowStatus
    })
    return satisfiedFlows
}

const filterFlowByReviewType = (flows, type) => {
    const satisfiedFlows = flows.filter((flow) => {
        const reviewInfo = flow.overallprocessflow;
        if (reviewInfo) {
            return flow.overallprocessflow.filter((item) => {
                return item.type === type
            }).length > 0
        }
        return false;
    })
    return satisfiedFlows
}

const filterFlowByReviewTypeAndOperatorId = (flows, type, operatorId) => {
    const satisfiedFlows = flows.filter((flow) => {
        const reviewInfo = flow.overallprocessflow;
        if (reviewInfo) {
            return flow.overallprocessflow.filter((item) => {
                return item.type === type && item.operatorUserId === operatorId
            }).length > 0
        }
        return false;
    })
    return satisfiedFlows
}

const findReviewItemByType = (flow, reviewStatus) => {
    const reviewInfo = flow.overallprocessflow
    if (reviewInfo) {
        for (const item of reviewInfo) {
            if (item.type === reviewStatus) {
                return true
            }
        }
    }
    return null
}

/**
 * 根据按部门汇总的流程，按照部门进行统计返回
 * @param flowsOfDepartments
 * @returns {Promise<{ departments: {}}>}
 */
const sumFlowsByDepartment = async (flowsOfDepartments) => {
    const result = {ids: {}, departments: {}}
    for (const dep of Object.keys(flowsOfDepartments)) {
        const count = flowsOfDepartments[dep].length
        const ids = flowsOfDepartments[dep].map((flow) => flow.processInstanceId)
        for (const id of ids) {
            result.ids[id] = 1
        }
        result.departments[dep] = {sum: count, ids}
    }
    return result
}

/**
 * 将流程按照发起人所在的部门进行分类
 * @param flows
 * @returns {Promise<{}>}
 */
const flowsDividedByDepartment = async (flows) => {
    const result = {}
    for (const flow of flows) {
        // 根据流程发起人所在的部门汇总数据
        // warning: 如果userId用户存在多部门的情况，会重复计算
        const departmentsOfUser = await departmentService.getDepartmentOfUser(flow.originator.userId)
        
        // 人员的leader_in_dept 是一种扁平的结构，有子部门的归算的子部门，没有的就归算到一级部门下
        // 获取一级部门信息
        const topDepartments = departmentsOfUser.filter((dep) => {
            if (dep && dep.dep_detail && dep.dep_detail.parent_id) {
                return dep.dep_detail.parent_id === 1
            }
            return false
        })
        
        for (const department of topDepartments) {
            const subDepartments = departmentsOfUser.filter((dep) => {
                if (dep && dep.dep_detail && dep.dep_detail.parent_id) {
                    return dep.dep_detail.parent_id === department.dep_detail.dept_id
                }
                return false
            })
            // 存在子部门统计到子部门下
            if (subDepartments.length > 0) {
                for (const subDepartment of subDepartments) {
                    if (Object.keys(result).includes(subDepartment.dep_detail.name)) {
                        result[subDepartment.dep_detail.name].push(flow)
                    } else {
                        result[subDepartment.dep_detail.name] = [flow]
                    }
                }
            }
            // 没有子部门统计到一级部门下
            else {
                if (Object.keys(result).includes(department.dep_detail.name)) {
                    result[department.dep_detail.name].push(flow)
                } else {
                    result[department.dep_detail.name] = [flow]
                }
            }
        }
    }
    return result
}

/**
 * 根据流程状态和重要性(是否重要、forms 条件)过滤流程
 * @param status
 * @param importance
 * @returns {Promise<*>}
 */
const filterTodayFlowsByFlowStatusAndImportanceEndOfForms = async (status, importance) => {
    const flowsOfRunningAndFinishedOfToday = await globalGetter.getTodayFlows()
    if (!flowsOfRunningAndFinishedOfToday) {
        return []
    }
    const flowOfStatus = flowsOfRunningAndFinishedOfToday.filter((flow) => flow.instanceStatus === status)
    // 根据重要性和forms过滤流程
    const filteredFlows = await filterFlowsByImportance(flowOfStatus, importance)
    return filteredFlows;
}

/**
 * 根据重要性条件中的 isImportant forms
 * @param flows
 * @param importance
 * @returns {Promise<*>}
 */
const filterFlowsByImportance = async (flows, importance) => {
    let filteredFlows = flows
    if (importance) {
        const {isImportant, forms} = importance
        if (forms && forms.length > 0) {
            filteredFlows = filterFlowsByForms(filteredFlows, forms)
        }
        if (isImportant.toString() === "true" || isImportant.toString() === "false") {
            filteredFlows = await filterFlowsByImportant(filteredFlows, isImportant)
        }
    }
    return filteredFlows
}

/**
 * 根据重要性过滤流程
 * @param flows 需要筛选的流程
 * @param isImportant 是否重要 true | false
 * @returns {Promise<*>}
 */
const filterFlowsByImportant = async (flows, isImportant) => {
    const formsOfImportance = await formService.getFormsByImportance(isImportant)
    const filteredFlows = flows.filter((flow) => {
        return formsOfImportance.some((form) => {
            return form.flowFormId === flow.formUuid
        })
    })
    return filteredFlows;
}

/**
 * 根据forms条件过滤匹配的flows
 * @param flows 需要筛选的流程
 * @param forms 需要匹配的表单
 * @returns {Promise<*>}
 */
const filterFlowsByForms = (flows, forms) => {
    if (!forms || forms.length === 0) {
        return flows
    }
    const filteredFlows = flows.filter((flow) => {
        return forms.includes(flow.formUuid)
    })
    return filteredFlows;
}

const sumFlowsByDepartmentOfMultiType = async (flowsOfMultiType) => {
    const result = {}
    for (const type of Object.keys(flowsOfMultiType)) {
        const curFlows = flowsOfMultiType[type];
        if (curFlows && curFlows.length > 0) {
            const tmpResult = await sumFlowsByDepartment(curFlows)
            result[type] = tmpResult
            if (result.sum) {
                result.sum = result.sum + tmpResult.sum
            } else {
                result.sum = tmpResult.sum
            }
        } else {
            if (!result.sum) {
                result.sum = 0
            }
            result[type] = {sum: 0}
        }
    }
    return result
}

const getCompletedFlowsByIds = async (ids) => {
    return await flowRepo.getProcessByIds(ids);
}

const getFlowsByIds = async (ids) => {
    const flowsOfRunningAndFinishedOfToday = await globalGetter.getTodayFlows()
    const satisfiedFlows = []
    const matchedTodayFlowIds = []
    
    for (const id of ids) {
        const runningFlow = flowsOfRunningAndFinishedOfToday.find(item => item.processInstanceId === id)
        if (runningFlow) {
            satisfiedFlows.push(runningFlow)
            matchedTodayFlowIds.push(id)
        }
    }
    
    // 需要从数据库中获取流程
    const stockedFlowIds = ids.filter(id => !matchedTodayFlowIds.includes(id))
    if (stockedFlowIds.length > 0) {
        const stockedFlows = await flowRepo.getProcessByIds(stockedFlowIds)
        for (const flow of stockedFlows) {
            satisfiedFlows.push({...flow, originator: {userId: flow.originatorId}})
        }
    }
    
    // 为流程添加发起人的部门信息
    for (const flow of satisfiedFlows) {
        let departmentNames = ""
        const departmentsOfUser = await departmentService.getDepartmentOfUser(flow.originator.userId)
        
        // 人员的leader_in_dept 是一种扁平的结构，有子部门的归算的子部门，没有的就归算到一级部门下
        // 获取一级部门信息
        const topDepartments = departmentsOfUser.filter((dep) => {
            if (dep && dep.dep_detail && dep.dep_detail.parent_id) {
                return dep.dep_detail.parent_id === 1
            }
            return false
        })
        
        if (topDepartments.length > 0) {
            for (const department of topDepartments) {
                const subDepartments = departmentsOfUser.filter((dep) => {
                    if (dep && dep.dep_detail && dep.dep_detail.parent_id) {
                        return dep.dep_detail.parent_id === department.dep_detail.dept_id
                    }
                    return false
                })
                // 存在子部门统计到子部门下
                if (subDepartments.length > 0) {
                    for (const subDepartment of subDepartments) {
                        departmentNames = `${departmentNames},${subDepartment.dep_detail.name}`
                    }
                }
                // 没有子部门统计到一级部门下
                else {
                    departmentNames = `${departmentNames},${department.dep_detail.name}`
                }
            }
        } else {
            departmentNames = departmentsOfUser.map(dept => dept.dep_detail.name).join(",")
        }
        if (departmentNames.startsWith(",")) {
            flow.deptName = departmentNames.substring(1)
        } else {
            flow.deptName = departmentNames
        }
        
    }
    return satisfiedFlows.sort((curr, next) => next.modifiedTimeGMT - curr.modifiedTimeGMT)
}

/**
 * 将departments的json格式转成arr
 * @param departments
 * @returns {Promise<*[]>}
 */
const convertJonsToArr = async (departments) => {
    const tmpDepartments = []
    for (const key of Object.keys(departments)) {
        tmpDepartments.push({deptName: key, sum: departments[key].sum, ids: departments[key].ids})
    }
    return tmpDepartments
}

/**
 * 将本人统计的数据格式转成按部门统计的格式
 * @param statistic
 * @param userName
 * @param resultTemplate
 * @returns {*}
 */
const convertSelfStatisticToDept = (statistic, userName, resultTemplate) => {
    if (statistic.sum == 0) {
        return resultTemplate
    }
    
    for (const notComputedDept of statistic.departments) {
        // 保存所有用户（不分部门）都不重复的id
        for (const id of notComputedDept.ids) {
            resultTemplate.ids[id] = 1
        }
        
        // 开始时为空数据，直接加进去
        if (resultTemplate.departments.length === 0) {
            const tmpDeptIds = {}
            for (const id of notComputedDept.ids) {
                tmpDeptIds[id] = 1
            }
            resultTemplate.departments.push({
                deptName: notComputedDept.deptName,
                ids: tmpDeptIds,
                users: [{userName: userName, sum: notComputedDept.sum, ids: notComputedDept.ids}]
            })
            continue
        }
        
        for (let i = 0; i < resultTemplate.departments.length; i++) {
            const deptOfTemplate = resultTemplate.departments[i]
            if (notComputedDept.deptName === deptOfTemplate.deptName) {
                // 部门的sum 需要汇总所有组员的不同的id
                for (const id of notComputedDept.ids) {
                    deptOfTemplate.ids[id] = 1
                }
                deptOfTemplate.users.push({
                    userName: userName, sum: notComputedDept.sum, ids: notComputedDept.ids
                })
                resultTemplate.departments[i] = deptOfTemplate
                break
            } else if (i === resultTemplate.departments.length - 1) {
                const tmpDeptIds = {}
                for (const id of notComputedDept.ids) {
                    tmpDeptIds[id] = 1
                }
                resultTemplate.departments.push({
                    deptName: notComputedDept.deptName,
                    ids: tmpDeptIds,
                    users: [{userName: userName, sum: notComputedDept.sum, ids: notComputedDept.ids}]
                })
                break
            }
        }
    }
    return resultTemplate;
}

/**
 * 中转调用 funOfTodaySelfStatistic 获取统计数据并进行格式转化
 * @param funOfTodaySelfStatistic
 * @param deptId
 * @param status
 * @param importance
 * @returns {Promise<null|{sum: number, departments: *[]}>}
 */
const getDeptStatistic = async (funOfTodaySelfStatistic, deptId, status, importance) => {
    const requiredDepartment = await departmentService.getDepartmentWithUsers(deptId);
    if (!requiredDepartment) {
        throw new NotFoundError(`未找到部门：${deptId}的信息`)
    }
    
    let resultTemplate = {sum: 0, ids: {}, departments: []}
    const usersOfDepartment = departmentService.simplifiedUsersOfDepartment(requiredDepartment)
    const users = usersOfDepartment.deptUsers
    
    if (!users || users.length === 0) {
        return resultTemplate
    }
    
    for (const user of users) {
        // 获取本人参与的流程并按流程发起人所在的组进行分类
        const sumByOriginatorDepartment = await funOfTodaySelfStatistic(user.userid, status, importance)
        // 在部门分组统计的数据中，进一步汇总到参与的个人
        resultTemplate = convertSelfStatisticToDept(sumByOriginatorDepartment, user.name, resultTemplate)
    }
    
    // 根据departments 下的ids和resultTemplate的ids 分别算出对应的sum
    const idArr = Object.keys(resultTemplate.ids)
    return {
        ids: idArr, sum: idArr.length, departments: resultTemplate.departments.map(item => {
            return {
                deptName: item.deptName,
                sum: Object.keys(item.ids).length,
                users: item.users,
                ids: Object.keys(item.ids)
            }
        })
    }
}

/**
 * 根据表单和流程状态获取今天的流程
 * @param formId
 * @param flowStatus
 * @returns {Promise<T[]>}
 */
const getTodayFlowsByFormIdAndFlowStatus = async (formId, flowStatus) => {
    const todayFlows = await globalGetter.getTodayFlows();
    return todayFlows.filter((flow) => {
        return flow.formUuid === formId && flow.instanceStatus === flowStatus
    })
}

/**
 * 获得拆分出来的表单和流程状态
 * @param formId  流程id
 * @param flowStatus 流程状态
 * @param status 状态
 * @returns {Promise<T[]>}
 */
const getTodaySplitFlowsByFormIdAndFlowStatus = async (formId, flowStatus, status) => {
    const todayFlows = await globalGetter.getSplitTodayFlows(status);
    return todayFlows.filter((flow) => {
        return flow.formUuid === formId && flow.instanceStatus === flowStatus
    })
}


/**
 * 获取所有的流程数据
 * @returns {Promise<*>}
 */
const getAllFlows = async () => {
    const allFlows = await flowRepo.getAllProcesses()
    return allFlows
}

const updateFlow = async (flow) => {
    const result = await flowRepo.updateProcess(flow)
    return result
}

/**
 * 同步missing的历史已完成的流程
 * @returns {Promise<void>}
 */
const syncMissingCompletedFlows = async () => {
    const pullTimeRange = []
    // 获取拉取钉钉完成流程的起始时间（异常情况下，当天更新失败，可能下次会拉取多天的）
    const latestProcess = await processService.getLatestModifiedProcess()
    if (latestProcess) {
        // 钉钉返回的时间精确到分钟，同一分钟内可能会有入库失败的情况，
        // 需要把这一分钟内的流程也筛出来，过滤掉
        const {doneTime} = latestProcess
        pullTimeRange.push(dateUtil.format2Str(doneTime, "YYYY-MM-DD"))
    }
    // 还没有历史数据，需要拉取全部的已完成的流程
    else {
        pullTimeRange.push(dateUtil.dateOfEarliest())
    }
    // 截止的日期取不到数据，所以用 -1
    pullTimeRange.push(dateUtil.dateEndOffToday(-1, "YYYY-MM-DD"))
    
    // 获取指定范围时间范围内的流程
    const finishedFlows = await dingDingService.getFinishedFlows(pullTimeRange)
    let syncCount = 0
    
    const uniqueFormIds = {}
    for (let flow of finishedFlows) {
        // 对历史数据打补丁
        flow = patchUtil.patchFlow(flow)
        
        // 同一天的完工流程可以存在失败的情况 已经入库
        if (dateUtil.formatGMT2Str(flow.modifiedTimeGMT, "YYYY-MM-DD") === pullTimeRange[0].toString()) {
            const savedFlow = await processService.getProcessByProcessInstanceId(flow.processInstanceId)
            if (savedFlow) {
                continue
            }
        }
        syncCount = syncCount + 1
        // 同步到数据库
        try {
            await processService.saveProcess(flow)
        } catch (e) {
            // 重复的数据异常直接忽略
            if (e.original.code !== "ER_DUP_ENTRY") {
                throw e
            }
        }
        // 将流程中的processCode反推回flowForms中
        if (!Object.keys(uniqueFormIds).includes(flow.formUuid)) {
            await flowFormRepo.updateFlowForm({processCode: flow.processCode, flowFormId: flow.formUuid})
            uniqueFormIds[flow.formUuid] = 1
        }
    }
}

/**
 * 获取指定状态的表单流程filed的值
 * @param formId
 * @param linkIdKeyInFightingFlowForm
 * @returns {Promise<*[]>}
 */
const getFlowFormValues = async (formId, fieldKey, flowStatus) => {
    let fightingLinkIds = []
    const flows = await getTodayFlowsByFormIdAndFlowStatus(formId, flowStatus)
    for (const flow of flows) {
        if (!flow.data) {
            continue
        }
        const runningLinkId = flow.data[fieldKey]
        if (runningLinkId) {
            if (runningLinkId.trim().includes(" ")) {
                fightingLinkIds = fightingLinkIds.concat(runningLinkId.split(/\s+/))
            } else {
                fightingLinkIds.push(runningLinkId)
            }
        }
    }
    return fightingLinkIds
}


const getFlowFormfieldKeyAndField = async (formId, fieldKey, selectField, flowStatus) => {
    let fightingLinkIds = []
    const flows = await getTodayFlowsByFormIdAndFlowStatus(formId, flowStatus)
    for (const flow of flows) {
        if (!flow.data) {
            continue
        }
        const runningLinkId = flow.data[fieldKey]
        const selectFieldValue = flow.data[selectField]  // Ensure selectField is properly accessed here
        if (runningLinkId) {
            if (runningLinkId.trim().includes(" ")) {
                const splitLinkIds = runningLinkId.split(/\s+/)
                for (const id of splitLinkIds) {
                    fightingLinkIds.push({[id]: selectFieldValue})
                }
            } else {
                fightingLinkIds.push({[runningLinkId]: selectFieldValue})
            }
        }
    }
    return fightingLinkIds
}

const updateRunningFlowEmergency = async (ids, emergency) => {
    const todayFlows = await globalGetter.getTodayFlows()
    const newTodayFlows = todayFlows.map(flow => {
        if (ids.includes(flow.processInstanceId)) {
            return {...flow, emergency}
        }
        return flow
    })
    
    await redisRepo.setTodayFlows(newTodayFlows)
    globalSetter.setGlobalTodayRunningAndFinishedFlows(newTodayFlows)
}

/**
 * 根据完成时间获取流程数据
 *
 * 历史数据转成Redis中的格式统一处理
 * @param startDoneDate
 * @param endDoneDate
 * @param formIds
 * @returns {Promise<*[]>}
 */
const getCombinedFlowsOfHistoryAndToday = async (startDoneDate, endDoneDate, formIds) => {
    
    if ((startDoneDate || endDoneDate) && !(startDoneDate && endDoneDate)) {
        throw new ParameterError("时间区间不完整")
    }
    
    let flows = []
    // 获取时间区间内的入库流程
    if (startDoneDate && endDoneDate) {
        if (dateUtil.duration(endDoneDate, startDoneDate) < 0) {
            throw new ParameterError("结束日期不能小于开始日期")
        }
        
        const processDataReviewItem = await Promise.all([
            flowRepo.getProcessDataByReviewItemDoneTime(dateUtil.startOfDay(startDoneDate), dateUtil.endOfDay(endDoneDate), formIds), // 2.8s
            flowRepo.getProcessWithReviewByReviewItemDoneTime(dateUtil.startOfDay(startDoneDate), dateUtil.endOfDay(endDoneDate), formIds)])
        
        flows = processDataReviewItem[1]
        // 合并流程的data和审核流信息
        for (let i = 0; i < flows.length; i++) {
            const currData = {}
            for (const item of processDataReviewItem[0][i].data) {
                const fieldValue = item.fieldValue
                if (fieldValue.startsWith("[") && fieldValue.endsWith("]")) {
                    currData[item.fieldId] = JSON.parse(fieldValue)
                } else {
                    currData[item.fieldId] = fieldValue
                }
            }
            flows[i].data = currData
        }
    }
    
    let todayFlows = await globalGetter.getTodayFlows()
    if (formIds && formIds.length > 0) {
        todayFlows = todayFlows.filter(flow => formIds.includes(flow.formUuid))
    }
    
    flows = flows.concat(todayFlows.map(flow => {
        // 返回新的Flow, 防止修改内存中的数据结构
        return {...flow}
    }))
    
    return flows
}

const removeNoRequiredActivities = (flows) => {
    const activitiesName = noRequiredStatActivityConst.names
    for (const flow of flows) {
        if (!flow.overallprocessflow) {
            continue
        }
        
        const newOverallProcessFlow = []
        for (const item of flow.overallprocessflow) {
            if (!activitiesName.includes(item.showName)) {
                newOverallProcessFlow.push(item)
            }
        }
        flow.overallprocessflow = newOverallProcessFlow
    }
    return flows
}

const getCoreActionsConfig = async (deptId) => {
    const coreActionsConfig = await flowRepo.getCoreActionsConfig(deptId)
    return coreActionsConfig
}
const getCoreFormFlowConfig = async (deptId) => {
    const coreFormFlowConfig = await flowRepo.getCoreFormFlowConfig(deptId)
    return coreFormFlowConfig
}

const getAllOverDueRunningFlows = async () => {
    const allFlows = await globalGetter.getTodayFlows()
    const doingFlows = allFlows.filter(flow => flow.instanceStatus === flowStatusConst.RUNNING)
    
    const overDueFlows = []
    for (const flow of doingFlows) {
        if (!flow.overallprocessflow) {
            continue
        }
        flow.overDueReviewItems = flow.overallprocessflow.filter(item => item.type === flowReviewTypeConst.TODO && item.isOverDue)
        // 添加当前操作人所在的部门
        for (const reviewItem of flow.overDueReviewItems) {
            const userDepartments = await departmentService.getDepartmentOfUser(reviewItem.operatorUserId)
            if (userDepartments.length > 0) {
                reviewItem.department = userDepartments[userDepartments.length - 1].dep_detail.name
            }
        }
        if (flow.overDueReviewItems.length > 0) {
            overDueFlows.push(flow)
        }
    }
    return overDueFlows
}

// 将审核节点中domainList的数据提出来
const levelUpDomainList = (flows) => {
    for (const flow of flows) {
        let newOverallProcessFlow = []
        for (const activity of flow.overallprocessflow) {
            if (activity.domainList && activity.domainList.length > 0) {
                newOverallProcessFlow = newOverallProcessFlow.concat(activity.domainList)
            } else {
                newOverallProcessFlow.push(activity)
            }
        }
        flow.overallprocessflow = newOverallProcessFlow
    }
    return flows
}

/**
 * 统计用户完成的工作量
 *
 * @param userNames 为空时，统计所有用户的工作量
 * @param userNames
 * @param startDoneDate
 * @param endDoneDate
 * @param formIds
 * @param deptIds 针对部门的统计: 不同分公司有相同名称的部门要合并统计
 * @param setActivitiesIgnoreStatFunc 设置对流程中的节点不进行统计
 * @returns {Promise<*[]>}
 */
const getUserFlowsStat = async (userNames, startDoneDate, endDoneDate, formIds, handleOutSourcingActivityFunc, setActivitiesIgnoreStatFunc) => {
    const originFlows = await getCombinedFlowsOfHistoryAndToday(startDoneDate, endDoneDate, formIds)
    
    let modifiedFlows = _.cloneDeep(originFlows)
    // 排除完成节点不在时间区间中的节点: 对待转入的统计没影响
    modifiedFlows = flowCommonService.removeDoneActivitiesNotInDoneDateRangeExceptStartNode(modifiedFlows, startDoneDate, endDoneDate, false)
    // 排除不需要统计的节点: 对待转入的统计没影响
    modifiedFlows = removeNoRequiredActivities(modifiedFlows)
    modifiedFlows = handleOutSourcingActivityFunc && handleOutSourcingActivityFunc(modifiedFlows)
    modifiedFlows = setActivitiesIgnoreStatFunc && setActivitiesIgnoreStatFunc(modifiedFlows)
    modifiedFlows = levelUpDomainList(modifiedFlows)
    
    // 对于视觉部(482162119)和管理中台(902643613)，将外包人的名字添加到userNames中
    // if (deptIds && ["902643613", "482162119"].includes(deptIds.toString())) {
    //     const outVisionSourcingUsers = await redisRepo.getOutSourcingUsers("482162119")
    //     userNames = userNames && `${userNames},${outVisionSourcingUsers.join(",")}`
    // }
    
    // 获取表单的最新的审核流
    const formsWithReview = await flowFormRepo.getAllFlowFormsWithReviews(formIds)
    // 统计流程数据
    const formResult = await userFlowStat.get(userNames, modifiedFlows, formsWithReview)
    
    // 将result中进行中和已完成的逾期单独提取出来
    for (const formStat of formResult) {
        for (const activityStat of formStat.children) {
            const activityOverdue = {
                name: "逾期",
                type: "OVERDUE",
                excludeUpSum: true,
                children: [{name: "进行中", type: "TODO", sum: 0, ids: [], children: []}, {
                    name: "已完成", type: "HISTORY", sum: 0, ids: [], children: []
                }]
            }
            for (const statusStat of activityStat.children) {
                if (statusStat.type === flowReviewTypeConst.FORCAST) {
                    continue
                }
                
                // 对进行中和已完成的状态进行处理
                // 对应状态的逾期
                const activityOverdueStat = activityOverdue.children.filter(item => item.type === statusStat.type)[0]
                // 将进行中或已完成中的逾期搬移到逾期
                activityOverdueStat.children = statusStat.children[1].children
                
                // 将进行中或已完成状态下的逾期和未逾期数据合并
                statusStat.children = statusStat.children[0].children.concat(statusStat.children[1].children)
                // 合并节点下逾期和未逾期数据：人名去重
                const uniqueStateStat = {}
                for (const item of statusStat.children) {
                    if (!Object.keys(uniqueStateStat).includes(item.userName)) {
                        uniqueStateStat[item.userName] = {}
                    }
                    uniqueStateStat[item.userName].ids = (uniqueStateStat[item.userName].ids || []).concat(item.ids)
                    uniqueStateStat[item.userName].sum = uniqueStateStat[item.userName].ids.length
                }
                statusStat.children = []
                for (const key of Object.keys(uniqueStateStat)) {
                    statusStat.children.push({
                        userName: key, ids: uniqueStateStat[key].ids, sum: uniqueStateStat[key].ids.length
                    })
                }
            }
            activityStat.children.push(activityOverdue)
        }
    }
    
    // 根据节点状态对流程进行统计
    for (const formStat of formResult) {
        // 统计流程状态的模版
        const flowStatusStatResult = [{
            status: flowStatusConst.RUNNING, name: "进行中", sum: 0, ids: []
        }, {status: flowStatusConst.COMPLETE, name: "已完成", sum: 0, ids: []}, {
            status: flowStatusConst.TERMINATED, name: "终止", sum: 0, ids: []
        }, {status: flowStatusConst.ERROR, name: "异常", sum: 0, ids: []}, {
            status: flowStatusConst.OVERDUE, name: "逾期", sum: 0, ids: []
        }]
        const statProcessToStatusResult = (processInstanceId, status, formStatusResult) => {
            const tmpStatusResult = formStatusResult.filter(statusResult => statusResult.status === status)[0]
            tmpStatusResult.ids.push(processInstanceId)
            tmpStatusResult.sum = tmpStatusResult.ids.length
        }
        
        
        const loopGetIds = (statNode) => {
            let ids = []
            if (statNode.ids) {
                ids = ids.concat(statNode.ids)
            }
            if (statNode.children && statNode.children.length > 0) {
                for (const ds of statNode.children) {
                    ids = ids.concat(loopGetIds(ds))
                }
            }
            return ids
        }
        
        const formStatIds = loopGetIds(formStat)
        const formFlows = originFlows.filter(flow => formStatIds.includes(flow.processInstanceId))
        for (const flow of formFlows) {
            // 流程异常则算为异常
            if (flow.instanceStatus === flowStatusConst.ERROR) {
                statProcessToStatusResult(flow.processInstanceId, flowStatusConst.ERROR, flowStatusStatResult)
                continue
            }
            
            // 终止节点的operator在userNames中，算为终止
            if (flow.instanceStatus === flowStatusConst.TERMINATED) {
                const lastActivity = flow.overallprocessflow[flow.overallprocessflow.length - 1]
                if (!lastActivity) {
                    continue
                }
                if (!userNames || (userNames && userNames.includes(lastActivity.operatorName))) {
                    statProcessToStatusResult(flow.processInstanceId, flowStatusConst.TERMINATED, flowStatusStatResult)
                }
                continue
            }
            
            // 获取仅包含 userNames 的节点，为空时获取所有节点
            let activities = flow.overallprocessflow
            if (userNames) {
                activities = activities.filter(activity => userNames.includes(activity.operatorName))
            }
            
            // 存在进行中的节点，则算为进行中
            const doingActivities = activities.filter(activity => activity.type === flowReviewTypeConst.TODO)
            if (doingActivities.length > 0) {
                statProcessToStatusResult(flow.processInstanceId, flowStatusConst.RUNNING, flowStatusStatResult)
                continue
            }
            
            // 如果节点都已完成，则算为完成
            const doneActivities = activities.filter(activity => activity.type === flowReviewTypeConst.HISTORY)
            if (doneActivities.length > 0 && doneActivities.length === activities.length) {
                statProcessToStatusResult(flow.processInstanceId, flowStatusConst.COMPLETE, flowStatusStatResult)
            }
            
            // 逾期：操作人的节点中有逾期计为逾期
            const overdueActivities = flow.overallprocessflow.filter(activity => activity.isOverDue)
            if (overdueActivities.length > 0) {
                if (userNames) {
                    const userOverdueActivities = overdueActivities.filter(activity => userNames.includes(activity.operatorName))
                    if (userOverdueActivities.length > 0) {
                        statProcessToStatusResult(flow.processInstanceId, flowStatusConst.OVERDUE, flowStatusStatResult)
                    }
                } else {
                    statProcessToStatusResult(flow.processInstanceId, flowStatusConst.OVERDUE, flowStatusStatResult)
                }
            }
        }
        
        formStat.flowsStat = flowStatusStatResult
    }
    return formResult
}

const overdueAloneStatusStructure = [
    {
        name: "待转入", type: flowReviewTypeConst.FORCAST, excludeUpSum: true, children: []
    },
    {
        name: "进行中", type: flowReviewTypeConst.TODO, children: []
    },
    {
        name: "已完成", type: flowReviewTypeConst.HISTORY, children: []
    },
    {
        name: "已逾期", type: "OVERDUE", excludeUpSum: true, children: [
            {
                name: "进行中", type: flowReviewTypeConst.TODO, children: []
            },
            {
                name: "已完成", type: flowReviewTypeConst.HISTORY, children: []
            }
        ]
    }
]

/**
 * 获取全流程数据
 *
 * @param userId
 * @param startDoneDate
 * @param endDoneDate
 * @param formIds
 * @param deptIds 管理中台（管理员）查看全部门的数据：默认 [] 代表全部部门
 * @returns {Promise<{activityStat: *[], deptStat: *[], users: *}>}
 */
const getFormsFlowsActivitiesStat = async (userId, startDoneDate, endDoneDate, formIds, deptIds) => {
    const tmpUsers = await userRepo.getAllUsers({userId})
    if (tmpUsers.length === 0) {
        throw new NotFoundError(`${userId}所对应的用户在库中不存在`)
    }
    const user = tmpUsers[0]
    const isAdmin = whiteList.pepArr().includes(user.dingdingUserId)
    
    if (!isAdmin && (!deptIds || deptIds.length === 0)) {
        throw new ParameterError("用户是非管理员，参数deptIds不能为空")
    }
    
    const isLeader = await userCommonService.isDeptLeaderOfTheUser(user.dingdingUserId, deptIds)
    // 为空时，默认会抓取全部人员的数据（管理员）
    // 人员角色区分： 管理员（userNames为空，全部门全员工）、部门主管（部门下的全部员工含离职的）、普通员工（自己的）
    let userNames = ""
    // 非管理员和来自管理中台 都要获取根据leader获取部门人名或个人
    if (!(isAdmin && deptIds.length === 0)) {
        if (isLeader) {
            for (const deptId of deptIds) {
                const deptOnJobUsers = await userRepo.getDeptOnJobUsers([deptId])
                const deptOnJobUserNames = deptOnJobUsers.map(user => user.nickname).join(",")
                
                const tmpDeptResignUsers = await userRepo.getDeptResignUsers([deptId])
                const deptResignUserNames = tmpDeptResignUsers.map(item => `${item.nickname}[已离职]`).join(",")
                
                const deptSourcingUsers = await redisRepo.getOutSourcingUsers([deptId])
                const deptSourcingUserNames = deptSourcingUsers.map(oUser => oUser.userName).join(",")
                
                userNames = `${userNames},${deptOnJobUserNames},${deptResignUserNames},${deptSourcingUserNames}`
            }
        } else {
            userNames = user.nickname
        }
    }
    
    const pureUsersWithDepartment = await redisRepo.getAllUsersWithKeyFields()
    const originResult = await getUserFlowsStat(userNames, startDoneDate, endDoneDate, formIds,
        // 1.全流程deptId=""，进行节点clone
        // 2.执行中台本部门deptId="902515853"或者其他部门,不需要改变
        // 3.视觉部deptIds="482162119", 需要进行替换
        (flows) => {
            const requiredReplacedActivityId = ["node_oclx49xlb31"]
            // 替换节点[通知外包摄影师等待收图]为外包人的信息
            const outSourcingPhotography = {
                formId: "FORM-30500E23B9C44712A5EBBC5622D3D1C4TL18",
                formName: "外包拍摄视觉流程",
                outSourceChargerFieldId: "textField_lvumnj2k"
            }
            
            // 执行中台需要看到他们自己的工作，其他部门或者全流程都算视觉-外包美编的
            const executionMidPlatformId = "902515853"
            if (deptIds.length > 0 && !deptIds.includes(executionMidPlatformId)) {
                const outSourcingPhotographyFlows = flows.filter(flow => flow.formUuid === outSourcingPhotography.formId)
                for (const flow of outSourcingPhotographyFlows) {
                    const fieldValue = flowFormReviewUtil.getFieldValue(outSourcingPhotographyFlows.outSourceChargerFieldId, flow.data)
                    const assignerActivities = flow.overallprocessflow.filter(activity => requiredReplacedActivityId.includes(activity.activityId))
                    
                    for (const activity of assignerActivities) {
                        activity.operatorName = fieldValue
                        activity.operatorDisplayName = fieldValue
                        activity.operatorUserId = ""
                    }
                }
            }
            
            // 替换最后一个节点为外包人的信息
            const outSourcingEditPicture = {
                formId: "FORM-4D592E41E1C744A3BCD70DB5AC228B01V8GV",
                formName: "外包修图视觉流程",
                outSourceChargerFieldId: "textField_lx48e5gk"
            }
            
            const outSourcingEditPictureFlows = flows.filter(flow => flow.formUuid === outSourcingEditPicture.formId)
            for (const flow of outSourcingEditPictureFlows) {
                if (flow.overallprocessflow && flow.overallprocessflow.length > 0) {
                    const fieldValue = flowFormReviewUtil.getFieldValue(outSourcingEditPicture.outSourceChargerFieldId, flow.data)
                    const lastActivity = flow.overallprocessflow[flow.overallprocessflow.length - 1]
                    lastActivity.operatorName = fieldValue
                    lastActivity.operatorDisplayName = fieldValue
                    lastActivity.operatorUserId = ""
                }
            }
            return flows
        },
        (flows) => {
            // 人员跨部门的情况下，在指定部门下统计指定的表单，管理中台全流程忽略
            // 针对部门的统计，存在人员跨部门，需要根据forms分别统计
            if (deptIds.length > 0) {
                const multiDeptUserIds = pureUsersWithDepartment.filter(user => userNames.includes(user.userName) && user.multiDeptStat).map(user => user.userId)
                for (const flow of flows) {
                    // 过滤掉不必要的流程
                    const multiDeptUserActivities = flow.overallprocessflow.filter(activity => multiDeptUserIds.includes(activity.operatorUserId))
                    for (const activity of multiDeptUserActivities) {
                        // 用户多部门的配置信息
                        const userDepsExtensions = extensionsConst.getUserDepsExtensions(activity.operatorUserId)
                        // 配置中部门统计的form跟当前的deptId部门参数不匹配时，过滤掉
                        for (const deptExt of userDepsExtensions) {
                            const isFormInStatForms = deptExt.statForms.filter(form => form.formId === flow.formUuid).length > 0
                            // 跨部门人配置中该流程所在的form不在当前部门，为该节点添加ignoreStat标记
                            if (isFormInStatForms && !deptIds.includes(deptExt.deptId.toString())) {
                                const currActivity = flow.overallprocessflow.filter(item => item.activityId === activity.activityId)[0]
                                currActivity.ignoreStat = true
                            }
                        }
                    }
                }
            }
            return flows
        })
    
    // 转化成按部门统计的结构数据
    const formsDepsStatResult = []
    for (const originFormResult of originResult) {
        const newFormResult = {formId: originFormResult.formId, formName: originFormResult.formName, children: []}
        for (const originActivityResult of originFormResult.children) {
            // 找到当前节点最底下的人所在的部门
            // - 将状态下对从人的角度的统计 => 拉出人的统计加上状态信息
            const originOperatorsResult = []
            for (const originStatusResult of originActivityResult.children) {
                const tmpTypes = [originStatusResult.type]
                // 为了通过人计算部门的统计便利和结合状态抓取在新结构中需要被统计到哪个节点的便利，
                // 将activity下状态-人的信息进行扁平处理，转成{userName: "", ids:[], sum:0, types:[]}
                //    - types:逾期被单独统计的，又分为进行中和已完成逾期，这种情况下types-["overdue", "running"]
                //    - 若是进行中， 则types-[running]
                for (const originMaybeOperatorResult of originStatusResult.children) {
                    if (originMaybeOperatorResult.children) {
                        for (const operatorResult of originMaybeOperatorResult.children) {
                            const newTypes = _.cloneDeep(tmpTypes)
                            newTypes.push(originMaybeOperatorResult.type)
                            originOperatorsResult.push({
                                types: newTypes, ...operatorResult
                            })
                        }
                    } else {
                        originOperatorsResult.push({
                            types: tmpTypes, ...originMaybeOperatorResult
                        })
                    }
                }
            }
            
            // 根据上面对人和状态的转换数据，转成人所在部门的统计
            for (const originOperatorResult of originOperatorsResult) {
                let userDepName = "未知"
                // 外包人员汇总部门
                const visionOutSourcingUsers = await redisRepo.getOutSourcingUsers("482162119")
                if (visionOutSourcingUsers.includes(originOperatorResult.userName)) {
                    userDepName = "视觉部"
                } else {
                    // 多部门的情况下： 按流程表单汇总不同的部门
                    // 根据配置中汇总部门需要统计的流程，将结果拆分进行统计
                    const currUser = pureUsersWithDepartment.filter(user => user.userName === originOperatorResult.userName)[0]
                    // 查找用户在该form(跨部门)和部门(可为空)下需要被统计到的部门名称
                    const findUserStatDeptName = (user, formId, deptIds) => {
                        let userDepName = "未知"
                        if (!user) {
                            return userDepName
                        }
                        // 部门模块数据
                        if (deptIds.length > 0) {
                            const tmpUserDept = user.departments.filter(dept => deptIds.includes(dept.deptId.toString()))
                            if (tmpUserDept.length > 0) {
                                userDepName = tmpUserDept[0].deptName
                            }
                        }
                        // 管理中台的全流程
                        else {
                            if (user.multiDeptStat) {
                                // 找到当前表单需要被统计到的部门
                                const tmpDeps = user.departments.filter(dept => {
                                    return dept.statForms && dept.statForms.filter(item => item.formId === formId).length > 0
                                })
                                if (tmpDeps.length > 0) {
                                    userDepName = tmpDeps[0].deptName
                                } else {
                                    userDepName = user.departments[0].deptName
                                }
                            } else {
                                userDepName = user.departments[0].deptName
                            }
                        }
                        return userDepName
                    }
                    userDepName = findUserStatDeptName(currUser, originFormResult.formId, deptIds)
                }
                
                // 1. 从最终的结果中找到该用户所在的部门节点，没有的话则添加
                let deptResult = null
                const tmpDepartmentsResult = newFormResult.children.filter(depResult => depResult.deptName === userDepName)
                if (tmpDepartmentsResult.length === 0) {
                    newFormResult.children.push({
                        deptName: userDepName, children: _.cloneDeep(overdueAloneStatusStructure)
                    })
                    deptResult = newFormResult.children[newFormResult.children.length - 1]
                } else {
                    deptResult = tmpDepartmentsResult[0]
                }
                
                // 2. 找到新的部门结构中对应的 statusResult
                let deptStatusResult = deptResult.children.filter(item => item.type === originOperatorResult.types[0])[0]
                if (originOperatorResult.types.length > 1) {
                    deptStatusResult = deptStatusResult.children.filter(item => item.type === originOperatorResult.types[1])[0]
                }
                
                // 3. 从上一步的 statusResult 中找到进一步要被统计到的工作节点
                let activityResult = null
                const tmpActivityResults = deptStatusResult.children.filter(item => item.activityName === originActivityResult.activityName)
                if (tmpActivityResults.length === 0) {
                    deptStatusResult.children.push({activityName: originActivityResult.activityName, children: []})
                    activityResult = deptStatusResult.children[deptStatusResult.children.length - 1]
                } else {
                    activityResult = tmpActivityResults[0]
                }
                
                // 4. 将原来对人的统计数据，转移到新的节点上
                activityResult.children.push({
                    userName: originOperatorResult.userName,
                    ids: originOperatorResult.ids,
                    sum: originOperatorResult.sum
                })
                
            }
        }
        newFormResult.flowsStat = originFormResult.flowsStat
        formsDepsStatResult.push(newFormResult)
    }
    
    let activityStatResult = flowUtil.removeSumEqualZeroFormStat(flowUtil.statIdsAndSumFromBottom(originResult))
    let deptStatResult = flowUtil.removeSumEqualZeroFormStat(flowUtil.statIdsAndSumFromBottom(formsDepsStatResult))
    
    // 根据配置过滤部门要隐藏的表单统计
    if (deptIds) {
        const tmpDeps = deptHiddenFormsConst.filter(item => item.deptId.toString() === deptIds.toString())
        if (tmpDeps.length > 0) {
            const deptHiddenFormIds = tmpDeps[0].forms.map(item => item.formId)
            activityStatResult = activityStatResult.filter(item => !deptHiddenFormIds.includes(item.formId))
            deptStatResult = deptStatResult.filter(item => !deptHiddenFormIds.includes(item.formId))
        }
    }
    // 根据流程配置的是否核心进行排序
    let deptCoreForms = []
    if (deptIds) {
        deptCoreForms = await departmentFlowFormRepo.getDepartmentFlowForms({
            deptId: deptIds, type: deptFlowFormConst.deptFlowFormCore, isCore: true
        })
    } else {
        deptCoreForms = await flowFormRepo.getAllForms({status: "1"})
    }
    
    let orderedActivityStatResult = []
    let orderedDeptStatResult = []
    for (const deptCoreFlow of deptCoreForms) {
        const tmpActivityStatResult = activityStatResult.find(item => item.formId === deptCoreFlow.formId)
        if (tmpActivityStatResult) {
            orderedActivityStatResult.push(tmpActivityStatResult)
            const index = activityStatResult.findIndex(item => item.formId === deptCoreFlow.formId)
            activityStatResult.splice(index, 1)
        }
        const tmpDeptStatResult = deptStatResult.find(item => item.formId === deptCoreFlow.formId)
        if (tmpDeptStatResult) {
            orderedDeptStatResult.push(tmpDeptStatResult)
            const index = deptStatResult.findIndex(item => item.formId === deptCoreFlow.formId)
            deptStatResult.splice(index, 1)
        }
    }
    orderedActivityStatResult = orderedActivityStatResult.concat(activityStatResult)
    orderedDeptStatResult = orderedDeptStatResult.concat(deptStatResult)
    return {activityStat: orderedActivityStatResult, deptStat: orderedDeptStatResult, users: pureUsersWithDepartment}
}

const getFlowSplitFormValues = async (formId, fieldKey, flowStatus) => {
    let fightingLinkIds = []
    const flows = await getTodaySplitFlowsByFormIdAndFlowStatus(formId, flowStatus, `flows:today:form:${formId.replace("FORM-", "")}`);
    for (const flow of flows) {
        if (!flow.data) {
            continue
        }
        const runningLinkId = flow.data[fieldKey]
        if (runningLinkId) {
            if (runningLinkId.trim().includes(" ")) {
                fightingLinkIds = fightingLinkIds.concat(runningLinkId.split(/\s+/))
            } else {
                fightingLinkIds.push(runningLinkId)
            }
        }
    }
    return fightingLinkIds
}

const getFlowSplitFormfieldKeyAndField = async (formId, fieldKey, selectField, flowStatus) => {
    let fightingLinkIds = []
    console.log("formId", formId)
    const flows = await getTodaySplitFlowsByFormIdAndFlowStatus(formId, flowStatus, `flows:today:form:${formId.replace("FORM-", "")}`)
    for (const flow of flows) {
        if (!flow.data) {
            continue
        }
        const runningLinkId = flow.data[fieldKey]
        const selectFieldValue = flow.data[selectField]  // Ensure selectField is properly accessed here
        if (runningLinkId) {
            if (runningLinkId.trim().includes(" ")) {
                const splitLinkIds = runningLinkId.split(/\s+/)
                for (const id of splitLinkIds) {
                    fightingLinkIds.push({[id]: selectFieldValue})
                }
            } else {
                fightingLinkIds.push({[runningLinkId]: selectFieldValue})
            }
        }
    }
    return fightingLinkIds
}

const getFlows = async (params, id) => {
    let result, setting = []
    if (params.tag) result = await newFormsRepo.getFlowInstances(params)
    if (params.dept) result = await newFormsRepo.getDevelopmentFlowInstances(params)
    else result = await newFormsRepo.getOperationFlowInstances(params)
    if (result?.length) {
        for (let index = 0; index < result.length; index++) {
            result[index]['flowFormDetails'].push({
				fieldId: "processInstanceId",
				fieldName: "实例ID",
				search: false,
			}, {
				fieldId: "creator",
				fieldName: "创建者",
				search: false
			}, {
				fieldId: "title",
				fieldName: "流程名称",
				search: false
			})
            if (tableHeaderExtra[result[index].id]?.length > 0) {
                result[index]['flowFormDetails'] = result[index]['flowFormDetails']
                    .concat(tableHeaderExtra[result[index].id])
            }
            setting = await userFlowSettingRepo.getSetting(id, result[index].id)
            result[index]['setting'] = []
            for (let i = 0; i < result[index]['flowFormDetails'].length; i++) {
                let isFind = false
                for (let j = 0; j < setting.length; j++) {
                    if (setting[j].fieldId == result[index]['flowFormDetails'][i].fieldId) {
                        isFind = true
                        result[index]['setting'].push(setting[j])
                        setting.splice(j, 1)
                        break
                    }
                }
                if (!isFind) {
                    result[index]['setting'].push({
                        fieldId: result[index]['flowFormDetails'][i].fieldId,
                        fieldName: result[index]['flowFormDetails'][i].fieldName,
                        sort: 0,
                        visible: true
                    })
                }
            }
            result[index]['setting'].sort((a, b) => a.sort - b.sort)
        }
    }
    return result
}

const setFlowHeader = async (user_id, form_id, setting) => {
    let result
    let tableSet = await userFlowSettingRepo.getSetting(user_id, form_id)
    if (tableSet?.length) {
        result = await userFlowSettingRepo.updateSetting(user_id, form_id, JSON.stringify(setting))
    } else {
        result = await userFlowSettingRepo.insertSetting(user_id, form_id, JSON.stringify(setting))
    }
    return result
}

const getFlowsProcesses = async (params, offset, limit) => {
    if (params.creator) {
        let userInfo = await userRepo.getUserDetails({ userId: params.creator })
        if (userInfo) params.creator = userInfo.dingdingUserId
    }
    let result = await newFormsRepo.getFlowProcessInstances(params, offset, limit)
    return result
}

const getOperationProcesses = async (user, params, offset, limit) => {
    let permissions = await userOperationRepo.getPermission(user.id)
    params.type = 0
    if (permissions[0].type != typeList.division.key) {
        let userInfo = await userOperationRepo.getUserById(user.id)
        if (userInfo?.length) {
            params.nickname = userInfo[0].nickname
            params.type = 1
        }
    }
    let result = await newFormsRepo.getOperationProcessInstances(params, offset, limit)
    return result
}

const getDevelopmentProcesses = async (params, offset, limit) => {
    let users = await userRepo.getUserByDeptName('产品开发部')
    let userNames = ''
    for (let i = 0; i < users.length; i++) {
        if (users[i].nickname != '崔竹') {
            userNames = `${userNames}"${users[i].nickname}",`
        }
    }
    if (userNames?.length) userNames = userNames.substring(0, userNames.length - 1)
    let result = await newFormsRepo.getDevelopmentProcessInstances(userNames, params, offset, limit)
    return result
}

const getVisionProcesses = async (params, offset, limit) => {
    if (params.userNames?.length == 1) {
        let users = await userRepo.getUsersByTagCodesAndNickname(params.userNames, designerTags)
        if (users.length) {
            params.is_designer = 1
        }
    }
    if (params.userNames?.length) {
        for (let i = 0; i < params.userNames.length; i++) {
            if (nameFilter[params.userNames[i]])
                params.userNames.push(nameFilter[params.userNames[i]])
        }
    }
    if (params.creator) {
        let userInfo = await userRepo.getUserDetails({ userId: params.creator })
        if (userInfo) params.creator = userInfo.dingdingUserId
    }
    let result = await newFormsRepo.getVisionProcessInstances(params, offset, limit)
    return result
}

const getFlowsActions = async (id) => {
    let res = await newFormsRepo.getFlowActions(id)
    let result = [], j = 0, ids = {}
    for (let i = 0; i < res.length; i++) {
        let info = JSON.parse(JSON.stringify(res[i]))
        info.children = []
        if (res[i].parent_id == 0) {
            result.push(info)
            ids[res[i].id] = {
                offset: j,
                root: 0
            }
            j = j + 1
        } else {
            result[ids[res[i].parent_id].offset].children.push(info)
            ids[res[i].id] = {
                offset: result[ids[res[i].parent_id].offset].children.length,
                root: res[i].parent_id
            }
        }
    }
    return result
}

const getVisionReview = async () => {
    let result = await newFormsRepo.getVisionInfo(0)
    return result
}

const getVisionPlan = async () => {
    let result = await newFormsRepo.getVisionInfo(1)
    return result
}

const getOperateSelection = async (params, userId) => {
    let result = {
        currentPage: parseInt(params.currentPage),
        pageSize: parseInt(params.pageSize),
        data: [],
        total: 0
    }, type = parseInt(params.type)
    let start = null
    if (params.startDate) start =moment(params.startDate).format('YYYY-MM-DD') + ' 00:00:00'
    let end = null
    if (params.endDate) end = moment(params.endDate).format('YYYY-MM-DD') + ' 23:59:59'
    if (operationSelectionFlow.length <= type || 
        type < 0 || 
        type == undefined) 
        return result
    let {data, total} = await newFormsRepo.getOperateSelection(
        start, 
        end, 
        params.title, 
        parseInt(params.currentPage),
        parseInt(params.pageSize),
        operationSelectionFlow[params.type],
        JSON.parse(params.search)
    )
    result.total = total
    if (data.length) {
        let dataMap = {}, j = 0
        for (let i = 0; i < data.length; i++) {
            if (dataMap[data[i].id] != undefined) {
                if (data[i].value.indexOf('downloadUrl') != -1) {
                    data[i].value = JSON.parse(data[i].value.replace(/\\/g, '\"'))
                }
                if (data[i].field_id.indexOf('tableField') != -1) {
                    data[i].value = JSON.parse(
                        data[i].value.replace(/{/g, '{"')
                            .replace(/}/g, '"}')
                            .replace(/:/g, '":"')
                            .replace(/,/g, '","')
                            .replace(/}","{/g, '},{')
                    )
                }
                result.data[dataMap[data[i].id]][data[i].field_id] = data[i].value
            } else {
                dataMap[data[i].id] = j
                let tmp = {
                    instance_id: data[i].instance_id,
                    title: data[i].title,
                    create_time: data[i].create_time,
                    selected: false
                }
                tmp.selected = await newFormsRepo.checkOperationNodes(
                    data[i].id,
                    operationSelectionFlowNode[params.type],
                    userId
                )
                let analysis = await newFormsRepo.getOperationAnalysisStats(data[i].instance_id)
                if (analysis?.length) {
                    for (let j = 0; j < analysis.length; j++) {
                        tmp[analysis[j].platform] = analysis[j].count
                    }
                }
                if (data[i].value.indexOf('downloadUrl') != -1) {
                    data[i].value = JSON.parse(data[i].value.replace(/\\/g, '\"'))
                }
                if (data[i].field_id.indexOf('tableField') != -1) {
                    data[i].value = JSON.parse(
                        data[i].value.replace(/{/g, '{"')
                            .replace(/}/g, '"}')
                            .replace(/:/g, '":"')
                            .replace(/,/g, '","')
                            .replace(/}","{/g, '},{')
                    )
                }
                tmp[data[i].field_id] = data[i].value
                result.data.push(tmp)
                j += 1
            }
        }
    }
    return result
}

const getOperateSelectionHeader = async (type, id) => {
    if (operationSelectionFlow.length <= type || 
        type < 0 || 
        type == undefined) 
        return result
    let result = [
        {field_id: 'title', title: '流程名称', search: false, children: []},
        {field_id: 'create_time', title: '创建时间', search: false, children: []},
    ]
    let columns = await newFormsRepo.getOperateSelectionHeader(
        operationSelectionFlow[type]
    )
    if (columns.length) {        
        let dataMap = {}, j = 2
        for (let i = 0; i < columns.length; i++) {
            if (dataMap[columns[i].id] != undefined) {
                result[dataMap[columns[i].id]].value.push(columns[i].value)
            } else {
                dataMap[columns[i].id] = j
                let tmp = {
                    field_id: columns[i].field_id,
                    title: columns[i].title,
                    value: [],
                    children: [],
                    search: columns[i].field_id.indexOf('attachmentField') != -1 ? false:true
                }
                if (columns[i].field_id.indexOf('tableField') != -1) {
                    tmp.children = await newFormsRepo.getOperateSubField(
                        operationSelectionFlow[type],
                        columns[i].field_id
                    )
                }
                if (columns[i].value) {
                    tmp.value.push(columns[i].value)
                }
                result.push(tmp)
                j += 1
            }
        }
    }
    const permissions = await userOperationRepo.getPermission(id)
    return {data: result, permit: permissions?.length && permissions[0].type < 4}
}

const createOperateAnalysis = async (platform, operator, instance_id, id) => {
    const permissions = await userOperationRepo.getPermission(id)
    if (!permissions?.length || permissions[0].type >= 4) return false
    let userInfo = await userRepo.getUserDetails({userId: id})
    let operatorInfo = await userRepo.getUserDetails({userId: operator})
    let params = {}
    params[analysisFieldMap.platform] = platform
    params[analysisFieldMap.selected] = '是'
    params[analysisFieldMap.instance_id] = instance_id
    params[analysisFieldMap.link] = `${analysisLinkPrevious}${instance_id}`
    params[analysisFieldMap.operator] = [operatorInfo.dingdingUserId]
    let result = await createProcess(
        analysisFlowUUid,
        userInfo.dingdingUserId,
        null,
        JSON.stringify(params)
    )
    return result
}

module.exports = {
    filterFlowsByTimesRange,
    filterFlowsByImportanceCondition,
    getFlowsOfDepartmentBy,
    filterFlowByFlowStatus,
    filterFlowByReviewType,
    filterFlowByReviewTypeAndOperatorId,
    findReviewItemByType,
    filterFlowsByForms,
    filterFlowsByImportant,
    filterFlowsByImportance,
    filterTodayFlowsByFlowStatusAndImportanceEndOfForms,
    flowsDividedByDepartment,
    sumFlowsByDepartment,
    sumFlowsByDepartmentOfMultiType,
    getCompletedFlowsByIds,
    getFlowsByIds,
    convertJonsToArr,
    convertSelfStatisticToDept,
    getDeptStatistic,
    getAllFlows,
    updateFlow,
    getTodayFlowsByFormIdAndFlowStatus,
    syncMissingCompletedFlows,
    getFlowFormValues,
    updateRunningFlowEmergency,
    getCoreActionsConfig,
    getCoreFormFlowConfig,
    getFormsFlowsActivitiesStat,
    getAllOverDueRunningFlows,
    getFlowFormfieldKeyAndField,
    getFlowSplitFormfieldKeyAndField,
    getTodaySplitFlowsByFormIdAndFlowStatus,
    getFlowSplitFormValues,
    getFlows,
    setFlowHeader,
    getFlowsProcesses,
    getOperationProcesses,
    getDevelopmentProcesses,
    getVisionProcesses,
    getFlowsActions,
    getVisionReview,
    getVisionPlan,
    getOperateSelection,
    getOperateSelectionHeader,
    createOperateAnalysis
}