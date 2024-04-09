const BigNumber = require("bignumber.js")
const singleItemTaoBaoRepo = require("../repository/singleItemTaoBaoRepo")
const departmentService = require("../service/departmentService")
const userService = require("../service/userService")
const flowService = require("../service/flowService")
const whiteList = require("../config/whiteList")
const {logger} = require("../utils/log")
const linkTypeConst = require("../const/linkTypeConst")
const flowStatusConst = require("../const/flowStatusConst")
const {
    taoBaoSingleItemMap,
    taoBaoErrorItems,
    taoBaoSingleItemStatuses,
    profitRateRangeSumTypes,
    marketRatioGroup,
    fieldsWithPercentageTag
} = require("../const/singleItemConst")
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
 * 返回的单品信息百分比的数据需要加上%
 * @param pageIndex
 * @param pageSize
 * @param productLineLeaderNames
 * @param firstLevelProductLine
 * @param secondLevelProductLine
 * @param errorItem
 * @param linkType
 * @param linkStatus
 * @param timeRange
 * @returns {Promise<{pageCount: *, data: *, pageIndex: *, pageSize: *}|null>}
 */
const getTaoBaoSingleItemsWitPercentageTag = async (pageIndex,
                                                    pageSize,
                                                    productLineLeaderNames,
                                                    firstLevelProductLine,
                                                    secondLevelProductLine,
                                                    errorItem,
                                                    linkType,
                                                    linkStatus,
                                                    timeRange) => {
    const pagingSingleItems = await getTaoBaoSingleItems(pageIndex,
        pageSize,
        productLineLeaderNames,
        firstLevelProductLine,
        secondLevelProductLine,
        errorItem,
        linkType,
        linkStatus,
        timeRange)

    const items = pagingSingleItems.data
    for (const item of items) {
        for (const field of fieldsWithPercentageTag) {
            item[field] = `${item[field]}%`
        }
    }
    return pagingSingleItems
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
 *
 * @param productLineLeaders
 * @param firstLevelProductLine
 * @param secondLevelProductLine
 * @param errorItem
 * @param linkType
 * @param linkStatus
 * @param timeRange
 * @returns {Promise<void>}
 */
const getAllSatisfiedSingleItems = async (productLineLeaders,
                                          firstLevelProductLine,
                                          secondLevelProductLine,
                                          errorItem,
                                          linkType,
                                          linkStatus,
                                          timeRange) => {
    if (!timeRange) {
        throw new Error("查询条件：时间区间不能为空")
    }
    if (!productLineLeaders) {
        throw new Error("查询条件：产品线负责人不能为空")
    }
    productLineLeaders = JSON.parse(productLineLeaders)
    timeRange = JSON.parse(timeRange)
    const fightingLinkIds = await flowService.getFlowFormValues(tmFightingFlowFormId, linkIdKeyInTmFightingFlowForm, flowStatusConst.RUNNING)
    const satisfiedSingleItems = await singleItemTaoBaoRepo.getTaoBaoSingleItems(0,
        999999,
        productLineLeaders,
        firstLevelProductLine,
        secondLevelProductLine,
        JSON.parse(errorItem || "{}"),
        linkType,
        linkStatus,
        fightingLinkIds,
        timeRange)
    return satisfiedSingleItems.data
}

/**
 * 获取链接操作数据
 * @param status
 * @param satisfiedSingleItems
 * @returns {Promise<{sum: number, items: [{name: string, sum: number}, {name: string, sum: number}, {name: string, sum: number}]}|{sum: number, items: *[]}|{fightingOnOld: *, fightingOnNew: *}>}
 */
const getLinkOperationCount = async (status,
                                     satisfiedSingleItems,
                                     productLineLeaders) => {

    // 待上架
    if (status === "waiting-on") {
        // 找到ddUserId
        const result = {
            sum: 0,
            items: [
                {name: "新品", sum: 0},
                {name: "老品", sum: 0},
                {name: "滞销", sum: 0}
            ]
        }
        for (const productLineLeader of JSON.parse(productLineLeaders)) {
            const allUsers = await globalGetter.getUsers()
            const users = allUsers.filter((user) => user.name === productLineLeader)

            const curResult = await getSelfWaitingOnSingleItemLinkOperationCount(users[0].userid)
            result.sum = result.sum + curResult.sum
            result.items[0].sum = result.items[0].sum + curResult.items[0].sum
            result.items[1].sum = result.items[1].sum + curResult.items[1].sum
            result.items[2].sum = result.items[2].sum + curResult.items[2].sum
        }
        return result
    }

    if (status === "do") {
        const result = await getSelfDoSingleItemLinkOperationCount(satisfiedSingleItems)
        return result
    } else if (status === "fighting") {
        const fightingLinkIds = await flowService.getFlowFormValues(tmFightingFlowFormId, linkIdKeyInTmFightingFlowForm, flowStatusConst.RUNNING)
        const result = await getSelfFightingSingleItemLinkOperationCount(satisfiedSingleItems, fightingLinkIds)
        return result
    } else if (status === "error") {
        const result = await getSelfErrorSingleItemLinkOperationCount(satisfiedSingleItems)
        return result
    }
    throw new Error(`${status}还不支持`)
}

/**
 * 获取本人链接操作数据（操作）
 * @param username  产品线负责人姓名
 * @param timeRange 时间范围
 * @returns {Promise<{sum: number, items: *[]}>}
 */
const getSelfDoSingleItemLinkOperationCount = async (singleItems) => {
    const result = {sum: 0, items: []}

    const newSingleItems = singleItems.filter((item) => {
        if (item.linkType.includes("新品")) {
            const matchNewItems = item.linkType.match(/\d+/)
            if (!matchNewItems || matchNewItems[0] < 90) {
                return true
            }
        }
        return false
    })
    result.items.push({
        name: linkTypeConst["new"],
        sum: newSingleItems.length
    })
    result.sum = result.sum + newSingleItems.length
    const oldSingleItems = singleItems.filter((item) => {
        if (item.linkType.includes("新品")) {
            const matchNewItems = item.linkType.match(/\d+/)
            if (matchNewItems && matchNewItems[0] >= 90) {
                return true
            }
        } else if (item.linkType === "老品") {
            return true
        }
        return false
    })
    result.items.push({
        name: linkTypeConst["old"],
        sum: oldSingleItems.length
    })
    result.sum = result.sum + oldSingleItems.length
    result.items.push({
        name: linkTypeConst["unsalable"],
        sum: 0
    })
    return result
}

/**
 * 获取本人链接操作数据（待上架）
 * @param userId
 * @returns {Promise<{sum: number, items: [{name: string, sum: number}, {name: string, sum: number}, {name: string, sum: number}]}>}
 */
const getSelfWaitingOnSingleItemLinkOperationCount = async (userId) => {
    const result = {
        sum: 0,
        items: [{
            name: "新品",
            sum: 0
        }, {
            name: "老品",
            sum: 0
        }, {
            name: "滞销",
            sum: 0
        }]
    }
    //新品： 统计" running的 运营新品流程"
    const todayFlows = await globalGetter.getTodayFlows()
    const runningFlow = todayFlows.filter((flow) => flow.instanceStatus === flowStatusConst.RUNNING)
    const newOperationRunningFlows = runningFlow.filter((flow) => {
        return flow.formUuid === operationNewFlowFormId &&
            flow.data[operationLeaderFieldId] &&
            flow.data[operationLeaderFieldId].length > 0 &&
            flow.data[operationLeaderFieldId][0] === userId
    })
    result.items[0].sum = newOperationRunningFlows.length
    result.sum = result.sum + newOperationRunningFlows.length
    //老品： 统计" running的 老品重新流程"
    const oldTMLinkShelvesFlows = runningFlow.filter((flow) => {
        return flow.formUuid === tmLinkShelvesFlowFormId &&
            flow.data[operationLeaderFieldId] &&
            flow.data[operationLeaderFieldId].length > 0 &&
            flow.data[operationLeaderFieldId][0] === userId
    })
    result.items[1].sum = oldTMLinkShelvesFlows.length
    result.sum = result.sum + oldTMLinkShelvesFlows.length
    //todo: 滞销： 暂无
    return result
}

/**
 * 获取链接操作数据（待转出）
 * @returns {Promise<{waitingOnNew: number, waitingOnUnsalable: number, waitingOnOld: number}>}
 */
const getSelfWaitingOutSingleItemLinkOperationCount = async (userId) => {

}

/**
 * 获取本人链接操作数据（打仗链接）
 * @param username
 * @param timeRange
 * @returns {Promise<{fightingOnOld: *, fightingOnNew: *}>}
 */
const getSelfFightingSingleItemLinkOperationCount = async (singleItems, fightingLinkIds) => {
    const result = {
        sum: 0,
        items: [
            {name: "新品", sum: 0},
            {name: "老品", sum: 0},
            {name: "滞销品", sum: 0}
        ]
    }
    singleItems = singleItems.filter((item) => {
        return fightingLinkIds.includes(item.linkId)
    })
    // 获取本人指定链接类型的单品数据
    const newSingleItems = singleItems.filter((item) => {
        if (item.linkType.includes("新品")) {
            const matchNewItems = item.linkType.match(/\d+/)
            if (!matchNewItems || matchNewItems[0] < 90) {
                return true
            }
        }
        return false
    })
    result.items[0].sum = newSingleItems.length
    result.sum = newSingleItems.length
    const oldSingleItems = singleItems.filter((item) => {
        if (item.linkType.includes("新品")) {
            const matchNewItems = item.linkType.match(/\d+/)
            if (matchNewItems && matchNewItems[0] >= 90) {
                return true
            }
        } else if (item.linkType === "老品") {
            return true
        }
        return false
    })
    result.items[1].sum = oldSingleItems.length
    result.sum = result.sum + oldSingleItems.length
    // todo: 滞销待定
    return result
}

/**
 * 获取本人链接操作数据（异常数据）
 * @param username
 * @param timeRange
 * @returns {Promise<{sum: number, items: *[]}>}
 */
const getSelfErrorSingleItemLinkOperationCount = async (singleItems) => {
    const result = {sum: 0, items: []}
    // 通过map过滤重复的数据
    const uniqueItems = {}
    for (const item of taoBaoErrorItems) {
        const items = singleItems.filter((singleItem) => {
            return eval(`parseFloat(${singleItem[item.value.field]})
            ${item.value.comparator}
            ${parseFloat(item.value.value)}`)
        })
        result.items.push({name: item.name, sum: items.length})
        for (const tmp of items) {
            uniqueItems[tmp.id] = 1
        }
    }
    result.sum = Object.keys(uniqueItems).length
    return result;
}

/**
 * 获取数据
 * @param userId
 * @param status
 */
const getErrorLinkOperationCount = async (singleItems, status) => {

    const findSingleItemsDividedByUser = (runningErrorLinkIds, singleItems) => {
        const result = {sum: 0, items: []}
        const errorSingleItems = singleItems.filter((item) => {
            return runningErrorLinkIds.includes(item.linkId)
        })

        for (const user of usersOfTM) {
            const singleItemsOfUser = errorSingleItems.filter((item) => item.productLineLeader === user.name)
            result.sum = result.sum + singleItemsOfUser.length
            result.items.push({
                name: user.name,
                sum: singleItemsOfUser.length
            })
        }
        return result
    }
    // 链接问题处理数据需要筛选的流程表单id (运营优化方案流程)
    const errorLinkFormId = "FORM-CP766081CPAB676X6KT35742KAC229LLKHIILB";
    const linkIdField = "textField_liihs7kw"
    const usersOfTM = await departmentService.getUsersOfDepartment(tmDeptId)

    // 进行中
    if (status.toUpperCase() === flowStatusConst.RUNNING) {
        const runningErrorLinkIds = await flowService.getFlowFormValues(errorLinkFormId, linkIdField, flowStatusConst.RUNNING)
        const result = findSingleItemsDividedByUser(runningErrorLinkIds, singleItems)
        return result
    }
    //  已完成
    // todo: 后面需要补充上历史的数据
    if (status.toUpperCase() === flowStatusConst.COMPLETE) {
        const completeErrorLinkIds = await flowService.getFlowFormValues(errorLinkFormId, linkIdField, flowStatusConst.COMPLETE)
        const result = findSingleItemsDividedByUser(completeErrorLinkIds, singleItems)
        return result
    }
    // todo: 需要确认成功的条件在判断
    if (status === "success") {
        return 0
    }
    // todo: 需要确认成功的条件在判断
    if (status == "fail") {
        return 0
    }
    throw new Error(`${status}还不支持`)
}

/**
 * 付费数据： 精准人群、车、万象台
 * @param userName
 * @returns {Promise<*|*[]>}
 */
const getPayment = async (singleItems) => {
    const result = [
        {
            type: "payment",
            name: "支付金额",
            sum: 0,
            items: [
                {name: "精准词", sum: 0},
                {name: "万相台", sum: 0},
                {name: "精准人群", sum: 0}]
        },
        {
            type: "promotionAmount",
            name: "推广金额",
            sum: 0,
            items: [
                {name: "精准词", sum: 0},
                {name: "万相台", sum: 0},
                {name: "精准人群", sum: 0}]
        },
        {
            type: "roi",
            name: "投产比",
            sum: 0,
            items: [
                {name: "精准词", sum: 0},
                {name: "万相台", sum: 0},
                {name: "精准人群", sum: 0}
            ]
        }
    ]
    for (const singleItem of singleItems) {
        // 支付金额
        let {cartSumPayment, wanXiangTaiSumPayment, accuratePeopleSumPayment} = singleItem
        cartSumPayment = parseFloat(cartSumPayment || "0")
        wanXiangTaiSumPayment = parseFloat(wanXiangTaiSumPayment || "0")
        accuratePeopleSumPayment = parseFloat(accuratePeopleSumPayment || "0")

        result[0].sum = new BigNumber(result[0].sum).plus(cartSumPayment).plus(wanXiangTaiSumPayment).plus(accuratePeopleSumPayment)
        result[0].items[0].sum = new BigNumber(result[0].items[0].sum).plus(cartSumPayment)
        result[0].items[1].sum = new BigNumber(result[0].items[1].sum).plus(wanXiangTaiSumPayment)
        result[0].items[2].sum = new BigNumber(result[0].items[2].sum).plus(accuratePeopleSumPayment)

        // 推广金额
        let {accuratePeoplePromotionCost, wanXiangTaiCost, shoppingCartSumAmount} = singleItem
        accuratePeoplePromotionCost = parseFloat(accuratePeoplePromotionCost || "0")
        wanXiangTaiCost = parseFloat(wanXiangTaiCost || "0")
        shoppingCartSumAmount = parseFloat(shoppingCartSumAmount || "0")

        result[1].sum = new BigNumber(result[1].sum).plus(shoppingCartSumAmount).plus(accuratePeoplePromotionCost).plus(wanXiangTaiCost)
        result[1].items[0].sum = new BigNumber(result[1].items[0].sum).plus(shoppingCartSumAmount)
        result[1].items[1].sum = new BigNumber(result[1].items[1].sum).plus(wanXiangTaiCost)
        result[1].items[2].sum = new BigNumber(result[1].items[2].sum).plus(accuratePeoplePromotionCost)
    }
    // 投产比
    result[2].sum = result[1].sum === 0 ? 0 : (result[0].sum / result[1].sum).toFixed(2)
    result[2].items[0].sum = result[0].items[0].sum === 0 ? 0 : (result[1].items[0].sum / result[0].items[0].sum).toFixed(2)
    result[2].items[1].sum = result[0].items[1].sum === 0 ? 0 : (result[1].items[1].sum / result[0].items[1].sum).toFixed(2)
    result[2].items[2].sum = result[0].items[2].sum === 0 ? 0 : (result[1].items[2].sum / result[0].items[2].sum).toFixed(2)

    return result
}

/**
 *  * 支付数据：按照新品老品分别统计发货金额和利润额，
 *         利润率按照新老品指定的利润区间统计
 * @param usernames
 * @returns {Promise<[{name: string, sum: number, items: *[]}, {name: string, sum: null, items: *[]}, {name: string, sum: null, items: *[]}]>}
 */
const getProfitData = async (singleItems) => {
    const linkTypes = await singleItemTaoBaoRepo.getLinkTypes()
    // 返回的数据模版
    const result = [
        {type: "deliveryAmount", name: "发货金额", sum: 0, items: []},
        {type: "profitAmount", name: "利润额", sum: 0, items: []},
        {type: "profitRate", name: "利润率", sum: null, items: []}
    ]
    // 按照类别统计发货金额、利润额
    // 根据linkTypes初始化发货金额的items
    for (const linkType of linkTypes) {
        result[0].items.push({name: linkType.link_type, sum: 0})
    }

    // 根据 profitRateRangeSumTypes 初始化sumProfitRate的items
    for (const profitRateRangeSumType of profitRateRangeSumTypes) {
        result[2].items.push({name: profitRateRangeSumType.name, sum: 0})
    }

    for (const singleItem of singleItems) {
        // 发货金额
        const reallyShipmentAmount = parseFloat(singleItem.reallyShipmentAmount)
        // 汇总发货金额
        result[0].sum = new BigNumber(result[0].sum).plus(reallyShipmentAmount)
        // 分类汇总发货金额统计不同linkType的单品表数
        for (const resultItem of result[0].items) {
            if (resultItem.name === singleItem.linkType) {
                resultItem.sum = new BigNumber(resultItem.sum).plus(reallyShipmentAmount)
                break
            }
        }
        // 利润额
        const profitAmount = parseFloat(singleItem.profitAmount)
        // 汇总利润额
        result[1].sum = new BigNumber(result[1].sum).plus(profitAmount)
        // 分类汇总利润额
        for (const resultItem of result[1].items) {
            if (resultItem.name === singleItem.linkType) {
                resultItem.sum = new BigNumber(resultItem.sum).plus(profitAmount)
                break
            }
        }

        // 判断当前的单品是新品还是老品，新品90、新品150 归算为老品
        let singleItemType = "老品"
        if (singleItem.linkType.includes("新品")) {
            const matchDays = singleItem.linkType.match(/\d+/)
            if (matchDays && parseInt(matchDays[0]) < 90) {
                singleItemType = "新品"
            }
        }
        // 根据利润率按照新老品指定的利润区间统计
        let profitRateRangeSumTypesIndex = 0
        for (const item of profitRateRangeSumTypes) {
            if (item.type === singleItemType && parseFloat(singleItem.profitRate) >= item.range[0] && parseFloat(singleItem.profitRate) <= item.range[1]) {
                const currentSumProfitRateItems = result[2].items
                for (let i = 0; i < currentSumProfitRateItems.length; i++) {
                    if (currentSumProfitRateItems[i].name === item.name) {
                        currentSumProfitRateItems[i].sum = currentSumProfitRateItems[i].sum + 1
                        break
                    }
                }
                break
            }
            if (profitRateRangeSumTypesIndex === profitRateRangeSumTypes.length - 1) {
                throw new Error(`单品：${singleItem.productName}，linkType:${singleItem.linkType}, profitRate: ${singleItem.profitRate} 未匹配到有效的利润区间`)
            }
            profitRateRangeSumTypesIndex = profitRateRangeSumTypesIndex + 1;
        }
    }
    result[2].sum = 0
    if (result[0].sum > 0) {
        result[2].sum = (result[1].sum / result[0].sum * 100).toFixed(2)
    }
    result[0].sum = result[0].sum.toFixed(2)
    result[1].sum = result[1].sum.toFixed(2)
    return result
}

const getMarketRatioData = async (singleItems) => {
    const tmpResult = []
    // 初始化结果: 扁平处理
    for (const marketRatio of marketRatioGroup) {
        tmpResult.push({
            ...marketRatio,
            item: {name: marketRatio.item.name, sum: 0}
        })
    }

    for (const singleItem of singleItems) {
        let salesMarketRateHasComputed = false
        let shouTaoPeopleNumMarketRateHasComputed = false
        // 坑产占比、流量占比（手淘人数市场占比环比（7天））
        // todo: 流量占比先按照手淘人数市场占比环比（日）计算
        const {
            salesMarketRate,
            shouTaoPeopleNumMarketRateCircleRateDay: shouTaoPeopleNumMarketRateCircleRate7Day
        } = singleItem
        // 判断占比所在的区间
        for (const marketRatio of marketRatioGroup) {
            // 统计坑产占比
            if (!salesMarketRateHasComputed &&
                marketRatio.name.includes("坑产占比") &&
                salesMarketRate >= marketRatio.item.range[0] &&
                salesMarketRate <= marketRatio.item.range[1]) {
                // 将数据统计到result对应的节点中
                for (const item of tmpResult) {
                    if (item.item.name === marketRatio.item.name) {
                        item.item.sum = item.item.sum + 1
                        salesMarketRateHasComputed = true
                        break;
                    }
                }
            }
            // 统计流量占比
            if (!shouTaoPeopleNumMarketRateHasComputed &&
                marketRatio.name.includes("流量占比") &&
                shouTaoPeopleNumMarketRateCircleRate7Day >= marketRatio.item.range[0] &&
                shouTaoPeopleNumMarketRateCircleRate7Day <= marketRatio.item.range[1]) {
                // 将数据统计到result对应的节点中
                for (const item of tmpResult) {
                    if (item.item.name === marketRatio.item.name) {
                        item.item.sum = item.item.sum + 1
                        shouTaoPeopleNumMarketRateHasComputed = true
                        break;
                    }
                }
            }
            if (salesMarketRateHasComputed && shouTaoPeopleNumMarketRateHasComputed) {
                break
            }
        }
    }

    // 根据type进行汇总
    const result = []
    for (const tmpItem of tmpResult) {
        if (result.length === 0) {
            result.push({
                type: tmpItem.type,
                name: tmpItem.name,
                sum: tmpItem.item.sum,
                items: [{
                    name: tmpItem.item.name,
                    sum: tmpItem.item.sum
                }]
            })
            continue
        }
        let hasComputed = false
        for (let i = 0; i < result.length; i++) {
            if (result[i].type === tmpItem.type) {
                result[i].sum = result[i].sum + tmpItem.item.sum
                const items = result[i].items
                for (let j = 0; j < items.length; j++) {
                    if (items[j].name === tmpItem.item.name) {
                        items[j].sum = items[j].sum + tmpItem.item.sum
                        hasComputed = true
                        break;
                    } else if (j === items.length - 1) {
                        items.push({
                            name: tmpItem.item.name,
                            sum: tmpItem.item.sum
                        })
                        hasComputed = true
                        break;
                    }
                }
            } else if (i === result.length - 1) {
                result.push({
                    type: tmpItem.type,
                    name: tmpItem.name,
                    sum: tmpItem.item.sum,
                    items: [{
                        name: tmpItem.item.name,
                        sum: tmpItem.item.sum
                    }]
                })
                hasComputed = true
            }
            if (hasComputed) {
                break
            }
        }
    }

    return result
}

/**
 * 将金额amount根据类型linkType合并到resultItems中
 * @param amount
 * @param linkType
 * @param resultItems
 * @returns {*}
 */
const mergeAmountToResultItemsByLinkType = (amount, linkType, resultItems) => {
    for (let i = 0; i < resultItems.length; i++) {
        if (resultItems[i].name === linkType) {
            resultItems[i].sum = resultItems[i].sum + amount
        } else if (i === resultItems.length - 1) {
            resultItems.push({name: linkType, sum: amount})
        }
    }
    return resultItems
}

/**
 * 获取最新的几条数据
 * @param count
 * @returns {Promise<*>}
 */
const getLatestBatchIdRecords = async (count) => {
    const data = singleItemTaoBaoRepo.getLatestBatchIdRecords(count)
    return data
}

/**
 * 获取不重复singleItems
 * @param singleItems
 * @returns {*[]}
 */
const getUniqueSingleItems = (singleItems) => {
    const linkIds = {}
    const uniqueSingleItems = []
    for (const singleItem of singleItems) {
        if (Object.keys(linkIds).includes(singleItem.linkId.toString())) {
            continue
        }
        uniqueSingleItems.push(singleItem)
        linkIds[singleItem.linkId.toString()] = 1
    }
    return uniqueSingleItems
}

module.exports = {
    saveSingleItemTaoBao,
    deleteSingleIteTaoBaoByBatchIdAndLinkId,
    getSelfDoSingleItemLinkOperationCount,
    getTaoBaoSingleItems,
    getTaoBaoSingleItemsWitPercentageTag,
    getSearchDataTaoBaoSingleItem,
    getSingleItemById,
    getErrorLinkOperationCount,
    getLinkOperationCount,
    getPayment,
    getProfitData,
    getAllSatisfiedSingleItems,
    getMarketRatioData,
    getLatestBatchIdRecords,
    getUniqueSingleItems
}