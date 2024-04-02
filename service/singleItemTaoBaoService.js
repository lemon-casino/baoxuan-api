const singleItemTaoBaoRepo = require("../repository/singleItemTaoBaoRepo")
const departmentService = require("../service/departmentService")
const userService = require("../service/userService")
const flowService = require("../service/flowService")
const {taoBaoSingleItemMap, taoBaoErrorItems, taoBaoSingleItemStatuses} = require("../const/singleItemConst")
const whiteList = require("../config/whiteList")
const {logger} = require("../utils/log")
const dateUtil = require("../utils/dateUtil")
const linkTypeConst = require("../const/linkTypeConst")
const flowStatusConst = require("../const/flowStatusConst")
const globalGetter = require("../global/getter")

// 天猫链接打架流程表单id
const tmFightingFlowFormId = "FORM-495A1584CBE84928BB3B1E0D4AA4B56AYN1J"
// todo: 历史数据同步完成后，可以从数据库中获取
// 天猫链接打架流程表单中链接ID的key
const linkIdKeyInTmFightingFlowForm = "textField_lqhp0b0d"
// 天猫链接上架流程
const tmLinkShelvesFlowFormId = "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1"
// 运营新品流程formId
const operationNewFlowFormId = "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3"
// 运营新品流程表单中运营负责人所对应的fieldId
const operationLeaderFieldId = "employeeField_lii5gvq3_id";
// 天猫部门的id
const tmDeptId = "903075138"

/**
 * 根据中文获取真实的数据库字段
 * @param chineseName
 * @returns {string|null}
 */
const getRealKey = (chineseName) => {
    for (const key of Object.keys(taoBaoSingleItemMap)) {
        if (taoBaoSingleItemMap[key] === chineseName) {
            return key
        }
    }
    return null
}

/**
 * 保存单品表
 * @param item
 * @returns {Promise<*|null>}
 */
const saveSingleItemTaoBao = async (item) => {
    // 白少雄那边传来的key是中文（好认），转化下
    let validChineseKeys = []
    for (const key of Object.keys(taoBaoSingleItemMap)) {
        validChineseKeys.push(taoBaoSingleItemMap[key])
    }

    // 数据处理
    // 1. 将空白的数据删除，使用数据库默认字段
    // 2. 去掉%， 将字符串数字转成数字
    const newItem = {};
    for (const key of Object.keys(item)) {
        if (!validChineseKeys.includes(key)) {
            const errMsg = `当前单品数据中的${key}后端无法处理`
            logger.error(errMsg)
            throw new Error(errMsg)
        }
        let value = item[key]
        if (!value) {
            continue
        }
        // 去掉空格和%
        value = value.toString().trim()
        if (value.indexOf("%") > 0) {
            value = value.replace("%", "")
        }
        // 数字转化
        if (/^[0-9]+\.*[0-9]+$/.test(value)) {
            // 当前linkId是12位的数字，parseFloat转化15为长度的会异常
            if (value.length <= 14) {
                value = parseFloat(value)
            }
        }
        const realKey = getRealKey(key)
        newItem[realKey] = value;
    }
    // 必须包含 batchId，便于异常时删除同一批数据
    if (!newItem.batchId) {
        throw new Error("必须包含batchId信息，保证数据的保存完成性")
    }

    const result = await singleItemTaoBaoRepo.saveSingleItemTaoBao(newItem)
    return result
}

/**
 * 根据batchId 和 linkId删除数据
 * @param batchId
 * @param linkId
 * @returns {Promise<*|null>}
 */
const deleteSingleIteTaoBaoByBatchIdAndLinkId = async (batchId, linkId) => {
    if (!batchId || !linkId) {
        throw new Error("参数：batchId, linkId 不能为空")
    }
    return singleItemTaoBaoRepo.deleteSingleIteTaoBaoByBatchIdAndLinkId(batchId, linkId)
}

/**
 * 获取淘宝单品表数据
 * @param pageIndex 页码
 * @param pageSize 单页数据量
 * @param operationLeaderNames 产品线负责人姓名: 支持多人
 * @param firstLevelProductLine 一级产品线
 * @param secondLevelProductLine 二级产品线
 * @param errorItem 异常项目
 * @param linkType 链接类型
 * @param linkStatus 链接状态
 * @param timeRange 时间区间
 * @returns {Promise<{pageCount: *, data: *, pageIndex: *, pageSize: *}|null>}
 */
const getTaoBaoSingleItems = async (pageIndex,
                                    pageSize,
                                    productLineLeaderNames,
                                    firstLevelProductLine,
                                    secondLevelProductLine,
                                    errorItem,
                                    linkType,
                                    linkStatus,
                                    timeRange) => {

    const fightingLinkIds = []
    if (linkStatus) {
        const runningFightingFlows = await flowService.getTodayFlowsByFormIdAndFlowStatus(tmFightingFlowFormId, flowStatusConst.RUNNING)
        for (const runningFightingFlow of runningFightingFlows) {
            if (!runningFightingFlow.data) {
                continue
            }
            const runningLinkId = runningFightingFlow.data[linkIdKeyInTmFightingFlowForm]
            if (runningLinkId) {
                fightingLinkIds.push(runningLinkId)
            }
        }
    }

    const data = await singleItemTaoBaoRepo.getTaoBaoSingleItems(
        parseInt(pageIndex),
        parseInt(pageSize),
        JSON.parse(productLineLeaderNames),
        firstLevelProductLine,
        secondLevelProductLine,
        JSON.parse(errorItem || "{}"),
        linkType,
        linkStatus,
        fightingLinkIds,
        JSON.parse(timeRange))
    return data
}


/**
 *  获取用户在淘宝单品表页面查询需要的数据
 * @param userId
 * @returns {Promise<{firstLevelProductionLines: *[], linkStatuses: [{name: string, value: string}, {name: string, value: string}], productLineLeaders: *[], errorItems: [{name: string, value: {field: string, value: string, operator: string}}, {name: string, value: {field: string, value: string, operator: string}}, {name: string, value: {field: string, value: string, operator: string}}, {name: string, value: {field: string, value: string, operator: string}}, {name: string, value: {field: string, value: string, operator: string}}, null, null, null, null, null, null, null, null], linkTypes: *[], secondLevelProductionLines: *[]}>}
 */
const getSearchDataTaoBaoSingleItem = async (userId) => {
    const result = {
        productLineLeaders: [],
        firstLevelProductionLines: [],
        secondLevelProductionLines: [],
        errorItems: taoBaoErrorItems,
        linkTypes: [],
        linkStatuses: taoBaoSingleItemStatuses
    }
    // 判断用户是否是leader
    const userDDId = await userService.getDingDingUserId(userId)
    const user = await userService.getUserDetails(userId)
    const departments = await departmentService.getDepartmentOfUser(userDDId)

    // tm leader 需要获取该部门下的所有人
    let isTMLeader = false;
    if (whiteList.pepArr().includes(userDDId)) {
        isTMLeader = true
    } else {
        if (departments) {
            for (const dept of departments) {
                if (dept.dep_detail.name === "天猫组" && dept.leader) {
                    isTMLeader = true
                    break
                }
            }
        }
    }
    if (isTMLeader) {
        // 天猫组deptId：903075138
        const department = await departmentService.getDepartmentWithUsers("903075138")
        for (const user of department.dep_user) {
            result.productLineLeaders.push({
                userId: user.userid, userName: user.name
            })
        }
    } else {
        result.productLineLeaders = [{userId: userDDId, userName: user.nickname}]
    }

    const linkTypes = await singleItemTaoBaoRepo.getLinkTypes()
    result.linkTypes = linkTypes
    return result
}

/**
 * 返回单品数据详情
 * @param id
 * @returns {Promise<*|*[]|null>}
 */
const getSingleItemById = async (id) => {
    if (!id) {
        throw new Error("id不能为空")
    }
    const singleItem = await singleItemTaoBaoRepo.getSingleItemById(id)
    return singleItem
}

/**
 * 获取本人不同装填的的链接操作数
 * @param userId
 * @param username
 * @param status
 * @returns {Promise<{fightingOnOld: *, fightingOnNew: *}|{waitingOnNew: number, waitingOnUnsalable: number, waitingOnOld: number}|*[]>}
 */
const getSelfLinkOperationCount = async (userId, username, status) => {
    // 操作数
    if (status === "do") {
        const result = await getSelfALLDoSingleItemLinkOperationCount(username)
        return result
    }
    // 待上架
    else if (status === "waiting-on") {
        const result = await getSelfWaitingOnSingleItemLinkOperationCount(userId)
        return result
    }
    // 打仗
    else if (status === "fighting") {
        const timeRange = [dateUtil.earliestDate, dateUtil.endOfToday()]
        const result = await getSelfFightingSingleItemLinkOperationCount(username, timeRange)
        return result
    } else if (status === "error") {
        const timeRange = [dateUtil.earliestDate, dateUtil.endOfToday()]
        const result = await getSelfErrorSingleItemLinkOperationCount(username, timeRange)
        return result
    }
    throw new Error(`${status}还不支持`)
}

/**
 * 获取天猫部门的统计数据
 * @param deptId
 * @param status
 * @returns {Promise<void>}
 */
const getDeptLinkOperationCount = async (userId, status) => {
    // 判断该用户时候有访问权限： 仅有部门领导和管理员可以查看
    const usersWithDepartment = await globalGetter.getUsers()
    const userWithDepartment = usersWithDepartment.filter((user) => user.userid === userId)

    if (!userWithDepartment || userWithDepartment.length === 0) {
        throw new Error("你没有权限访问该接口")
    }
    const isLeaderOfTM = userWithDepartment[0].leader_in_dept.filter((dept) => {
        return dept.dept_id === tmDeptId && dept.leader
    }).length > 0
    if (!isLeaderOfTM && !whiteList.pepArr().includes(userId)) {
        throw new Error("你没有权限访问该接口")
    }

    // 获取天猫下面的所有人
    const departmentsWithUser = await globalGetter.getUsersOfDepartments()

    let tmDepartment = null
    for (const department of departmentsWithUser) {
        tmDepartment = departmentService.findMatchedDepartmentFromRoot(tmDeptId, department)
        if (tmDepartment) {
            break
        }
    }
    if (!tmDepartment) {
        throw new Error("为找到天猫的部门信息")
    }

    const usersOfTM = tmDepartment.dep_user
    let result = null
    for (const user of usersOfTM) {
        const tmpResult = await getSelfLinkOperationCount(user.userid, user.name, status)
        if (!result) {
            result = tmpResult
            continue
        }
        // 合并多人的结果
        for (const tmpItem of tmpResult) {
            if (tmpItem.count <= 0) {
                continue
            }
            for (const item of result) {
                if (tmpItem.name == item.name) {
                    item.count = item.count + tmpItem.count
                    break;
                }
            }
        }
    }
    return result
}

/**
 * 获取本人所有链接操作数据（操作）
 * @param username
 * @returns {Promise<*[]>}
 */
const getSelfALLDoSingleItemLinkOperationCount = async (username) => {
    const timeRange = [dateUtil.earliestDate, dateUtil.endOfToday()]
    const result = await getSelfDoSingleItemLinkOperationCount(username, timeRange)
    return result
}

/**
 * 获取本人链接操作数据（操作）
 * @param username  产品线负责人姓名
 * @param timeRange 时间范围
 * @returns {Promise<*[]>}
 */
const getSelfDoSingleItemLinkOperationCount = async (username, timeRange) => {
    const result = []
    for (const key of Object.keys(linkTypeConst)) {
        const resultOfLinkType = await singleItemTaoBaoRepo.getSingleItemByProductLeaderLinkTypeTimeRange(
            username,
            linkTypeConst[key],
            timeRange)

        result.push({
            name: linkTypeConst[key],
            count: resultOfLinkType.length
        })
    }
    return result
}

/**
 * 获取本人链接操作数据（待上架）
 * @param userId
 * @returns {Promise<[{name: string, count: number}, {name: string, count: number}, {name: string, count: number}]>}
 */
const getSelfWaitingOnSingleItemLinkOperationCount = async (userId) => {
    const result = [{
        name: "新品",
        count: 0
    }, {
        name: "老品",
        count: 0
    }, {
        name: "滞销",
        count: 0
    }]
    //新品： 统计" running的 运营新品流程"
    const todayFlows = await globalGetter.getTodayFlows()
    const runningFlow = todayFlows.filter((flow) => flow.instanceStatus === flowStatusConst.RUNNING)
    const newOperationRunningFlows = runningFlow.filter((flow) => {
        return flow.formUuid === operationNewFlowFormId &&
            flow.data[operationLeaderFieldId] &&
            flow.data[operationLeaderFieldId].length > 0 &&
            flow.data[operationLeaderFieldId][0] === userId
    })
    result[0].count = newOperationRunningFlows.length
    //老品： 统计" running的 老品重新流程"
    const oldTMLinkShelvesFlows = runningFlow.filter((flow) => {
        return flow.formUuid === tmLinkShelvesFlowFormId &&
            flow.data[operationLeaderFieldId] &&
            flow.data[operationLeaderFieldId].length > 0 &&
            flow.data[operationLeaderFieldId][0] === userId
    })
    result[1].count = oldTMLinkShelvesFlows.length
    //todo: 滞销： 暂无
    return result
}

/**
 * 获取本人链接操作数据（待转出）
 * @returns {Promise<{waitingOnNew: number, waitingOnUnsalable: number, waitingOnOld: number}>}
 */
const getSelfWaitingOutSingleItemLinkOperationCount = async (userId) => {

}

/**
 * 根据链接类型获取本人的正在打仗单品信息
 * @returns {Promise<void>}
 */
const getSelfFightingSingleItemsByLinkType = async (username, linkType, timeRange) => {
    try {
        // 获取正在打仗的流程
        const runningFightingFlows = await flowService.getTodayFlowsByFormIdAndFlowStatus(tmFightingFlowFormId, flowStatusConst.RUNNING)
        // 获取正在打仗流程的linkId(s)
        const fightingLinkIds = []
        for (const runningFightingFlow of runningFightingFlows) {
            if (!runningFightingFlow.data) {
                continue
            }
            const runningLinkId = runningFightingFlow.data[linkIdKeyInTmFightingFlowForm]
            if (runningLinkId) {
                fightingLinkIds.push(runningLinkId)
            }
        }
        // 获取本人指定链接类型的单品数据
        const newSelfSingleItems = await singleItemTaoBaoRepo.getSingleItemByProductLeaderLinkTypeTimeRange(username, linkType, timeRange)
        const selfFightingSingleItems = newSelfSingleItems.filter((item) => {
            return fightingLinkIds.includes(item.linkId)
        })
        return selfFightingSingleItems
    } catch (e) {
        throw new Error(e.message)
    }
}

/**
 * 获取本人链接操作数据（打仗链接）
 * @param username
 * @param timeRange
 * @returns {Promise<{fightingOnOld: *, fightingOnNew: *}>}
 */
const getSelfFightingSingleItemLinkOperationCount = async (username, timeRange) => {
    const newProductSelfFightingSingleItems = await getSelfFightingSingleItemsByLinkType(username, "新品", timeRange)
    const oldProductSelfFightingSingleItems = await getSelfFightingSingleItemsByLinkType(username, "老品", timeRange)
    // todo: 带滞销 (需求还未确定)
    return [{
        name: "新品",
        count: newProductSelfFightingSingleItems.length
    }, {
        name: "老品",
        count: oldProductSelfFightingSingleItems.length,
    }, {
        name: "滞销品",
        count: 0
    }]
}

/**
 * 获取本人链接操作数据（异常数据）
 * @param username
 * @returns {Promise<*[]>}
 */
const getSelfErrorSingleItemLinkOperationCount = async (username, timeRange) => {
    const result = []
    for (const item of taoBaoErrorItems) {
        const count = await singleItemTaoBaoRepo.getErrorSingleItemsTotal([username], item.value, timeRange)
        result.push({name: item.name, count})
    }
    return result;
}


module.exports = {
    saveSingleItemTaoBao,
    deleteSingleIteTaoBaoByBatchIdAndLinkId,
    getSelfLinkOperationCount,
    getSelfDoSingleItemLinkOperationCount,
    getSelfALLDoSingleItemLinkOperationCount,
    getTaoBaoSingleItems,
    getSearchDataTaoBaoSingleItem,
    getSingleItemById,
    getDeptLinkOperationCount
}