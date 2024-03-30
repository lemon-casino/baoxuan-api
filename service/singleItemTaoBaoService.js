const singleItemTaoBaoRepo = require("../repository/singleItemTaoBaoRepo")
const departmentService = require("../service/departmentService")
const userService = require("../service/userService")
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
        const todayFlows = await globalGetter.getTodayFlows();
        const runningFightingFlows = todayFlows.filter((flow) => {
            return flow.formUuid === tmFightingFlowFormId && flow.instanceStatus === flowStatusConst.RUNNING
        })
        for (const runningFightingFlow of runningFightingFlows) {
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
 * 获取用户在淘宝单品表页面查询需要的数据
 * @param userId
 * @returns {Promise<{firstLevelProductionLines: *[], linkStatuses: [{name: string, value: string}, {name: string, value: string}], productLineLeaders: *[], errorItems: [{name: string, value: {filed: string, value: string, operator: string}}, {name: string, value: {filed: string, value: string, operator: string}}, {name: string, value: {filed: string, value: string, operator: string}}, {name: string, value: {filed: string, value: string, operator: string}}, {name: string, value: {filed: string, value: string, operator: string}}, null, null, null, null, null, null, null, null], linkTypes: *[], secondLevelProductionLines: *[]}>}
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
 * @param username
 * @param status
 * @returns {Promise<*[]>}
 */
const getSelfLinkOperationCount = async (username, status) => {
    if (status === "do") {
        const result = await getSelfALLDoSingleItemLinkOperationCount(username)
        return result
    }
    throw new Error(`${status}还不支持`)
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
        const resultOfLinkType = await singleItemTaoBaoRepo.getSingleItemByProductionLineLeaderLinkTypeTimeRange(
            username,
            linkTypeConst[key],
            timeRange)

        result.push({
            linkTypeName: key,
            linkTypeValue: linkTypeConst[key],
            count: resultOfLinkType.length
        })
    }
    return result
}

/**
 * 获取本人链接操作数据（待上架）
 * @returns {Promise<void>}
 */
const getSelfWaitingOnSingleItemLinkOperationCount = async () => {

}

/**
 * 获取本人链接操作数据（待转出）
 * @returns {Promise<void>}
 */
const getSelfWaitingOutSingleItemLinkOperationCount = async () => {

}

/**
 * 获取本人链接操作数据（打仗链接）
 * @returns {Promise<void>}
 */
const getSelfFightingSingleItemLinkOperationCount = async () => {

}

/**
 * 获取本人链接操作数据（异常数据）
 * @returns {Promise<void>}
 */
const getSelfErrorSingleItemLinkOperationCount = async () => {

}


module.exports = {
    saveSingleItemTaoBao,
    deleteSingleIteTaoBaoByBatchIdAndLinkId,
    getSelfLinkOperationCount,
    getSelfDoSingleItemLinkOperationCount,
    getSelfALLDoSingleItemLinkOperationCount,
    getTaoBaoSingleItems,
    getSearchDataTaoBaoSingleItem,
    getSingleItemById
}