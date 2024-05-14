const BigNumber = require("bignumber.js")
const singleItemTaoBaoRepo = require("../repository/singleItemTaoBaoRepo")
const departmentService = require("../service/departmentService")
const userService = require("../service/userService")
const flowService = require("../service/flowService")
const whiteList = require("../config/whiteList")
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
const linkTypeUtil = require("../utils/linkTypeUtil")
const jsonUtil = require("../utils/jsonUtil")
const globalGetter = require("../global/getter")
const NotFoundError = require("../error/http/notFoundError")
const ForbiddenError = require("../error/http/forbiddenError")
const ParameterError = require("../error/parameterError")
const tmpTMInnerGroupingConst = require("../const/tmp/tmInnerGroupingConst")

// 天猫链接打架流程表单id
const tmFightingFlowFormId = "FORM-495A1584CBE84928BB3B1E0D4AA4B56AYN1J"
// todo: 历史数据同步完成后，可以从数据库中获取
// 天猫链接打架流程表单中链接ID的key
const linkIdKeyInTmFightingFlowForm = "textField_lqhp0b0d"
// 天猫链接上架流程
const tmLinkShelvesFlowFormId = "FORM-0X966971LL0EI3OC9EJWUATDC84838H8V09ML1"
// 运营新品流程formId
const operationNewFlowFormId = "FORM-6L966171SX9B1OIODYR0ICISRNJ13A9F75IIL3"
// 宝可梦 新品开发流程
const baoKeMengNewFlowFormId = "FORM-CC0B476071F24581B129A24835910B81AK56"
// 运营新品流程表单中运营负责人所对应的fieldId
const operationLeaderFieldId = "employeeField_lii5gvq3_id";
// 天猫部门的id
const tmDeptId = "903075138"
// 链接问题处理数据需要筛选的流程表单id (运营优化方案流程)
const errorLinkFormId = "FORM-CP766081CPAB676X6KT35742KAC229LLKHIILB";
const linkIdField = "textField_liihs7kw"

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
            throw new ForbiddenError(`当前单品数据中的${key}后端无法处理`)
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
        throw new NotFoundError("必须包含batchId信息，保证数据的保存完成性")
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
        throw new ParameterError("参数：batchId, linkId 不能为空")
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
 * @param errorItems 异常项目
 * @param linkTypes 链接类型
 * @param linkStatus 链接状态
 * @param timeRange 时间区间
 * @returns {Promise<{pageCount: *, data: *, pageIndex: *, pageSize: *}|null>}
 */
const getTaoBaoSingleItems = async (pageIndex,
                                    pageSize,
                                    productLineLeaderNames,
                                    firstLevelProductLine,
                                    secondLevelProductLine,
                                    errorItems,
                                    linkTypes,
                                    linkHierarchies,
                                    linkStatus,
                                    timeRange,
                                    clickingAdditionalParams) => {

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
        pageIndex, pageSize,
        productLineLeaderNames,
        firstLevelProductLine,
        secondLevelProductLine,
        errorItems,
        linkTypes,
        linkHierarchies,
        linkStatus,
        fightingLinkIds,
        timeRange,
        clickingAdditionalParams)
    return data
}

/**
 * 返回的单品信息百分比的数据需要加上%
 * @param pageIndex
 * @param pageSize
 * @param productLineLeaderNames
 * @param firstLevelProductLine
 * @param secondLevelProductLine
 * @param errorItems
 * @param linkTypes
 * @param linkHierarchies
 * @param linkStatus
 * @param timeRange
 * @param clickingAdditionalParams
 * @returns {Promise<{pageCount: *, data: *, pageIndex: *, pageSize: *}|null>}
 */
const getTaoBaoSingleItemsWitPercentageTag = async (pageIndex,
                                                    pageSize,
                                                    productLineLeaderNames,
                                                    firstLevelProductLine,
                                                    secondLevelProductLine,
                                                    errorItems,
                                                    linkTypes,
                                                    linkHierarchies,
                                                    linkStatus,
                                                    timeRange,
                                                    clickingAdditionalParams) => {
    const pagingSingleItems = await getTaoBaoSingleItems(pageIndex,
        pageSize,
        productLineLeaderNames,
        firstLevelProductLine,
        secondLevelProductLine,
        errorItems,
        linkTypes,
        linkHierarchies,
        linkStatus,
        timeRange,
        clickingAdditionalParams)

    const items = pagingSingleItems.data
    for (let item of items) {
        item = attachPercentageTagToField(item)
    }
    return pagingSingleItems
}

/**
 * 没有被显式引用，误删！！！！！！
 *
 * 获取需要对于链接问题处理数据点击需要额外理的查询条件()
 * @returns {[{field: string, value: *[], operator: string}]}
 */
const getLinkErrorQueryFields = async (status) => {
    const errorLinkIds = await flowService.getFlowFormValues(errorLinkFormId, linkIdField, status)
    return {field: "linkId", operator: "$in", value: errorLinkIds}
}

/**
 * 获取单品表数据，并进行付费数据、支付数据、市场占有率的汇总
 * @param pageIndex
 * @param pageSize
 * @param productLineLeaderNames
 * @param firstLevelProductLine
 * @param secondLevelProductLine
 * @param errorItems
 * @param linkTypes
 * @param linkHierarchies
 * @param linkStatus
 * @param timeRange
 * @param clickingAdditionalParams
 * @returns {Promise<{marketRioData: *[], profitData: ({name: string, sum: number, items: *[]}|{name: string, sum: null, items: *[]})[], paymentData: (*|*[]), pagingSingleItems: ({pageCount: *, data: *, pageIndex: *, pageSize: *}|null)}>}
 */
const getTaoBaoSingleItemsWithStatistic = async (pageIndex,
                                                 pageSize,
                                                 productLineLeaderNames,
                                                 firstLevelProductLine,
                                                 secondLevelProductLine,
                                                 errorItems,
                                                 linkTypes,
                                                 linkHierarchies,
                                                 linkStatus,
                                                 timeRange,
                                                 clickingAdditionalParams) => {

    // 链接问题处理数据需要对clickingAdditionalParams进行转化
    for (let i = 0; i < clickingAdditionalParams.length; i++) {
        const param = clickingAdditionalParams[i]
        if (Object.keys(param).includes("method") && Object.keys(availableFunctionsMap).includes(param["method"])) {
            clickingAdditionalParams[i] = await availableFunctionsMap[param["method"]](param["param"])
        }
    }
    // todo: 如果速度影响较大，两个查询可以可以考虑一个查询然后做处理
    // 获取分页单品表数据
    const pagingSingleItems = await getTaoBaoSingleItemsWitPercentageTag(
        pageIndex,
        pageSize,
        productLineLeaderNames,
        firstLevelProductLine,
        secondLevelProductLine,
        errorItems,
        linkTypes,
        linkHierarchies,
        linkStatus,
        timeRange,
        clickingAdditionalParams)

    const singleItems = await getAllSatisfiedSingleItems(
        productLineLeaderNames,
        firstLevelProductLine,
        secondLevelProductLine,
        errorItems,
        linkTypes,
        linkHierarchies,
        linkStatus,
        timeRange,
        clickingAdditionalParams)
    /**
     *  付费数据： 精准人群、车、万象台
     * 支付数据：按照新品老品分别统计发货金额和利润额，
     *         利润率按照新老品指定的利润区间统计
     * 获取市场占有率数据
     */
        //付费数据
    const paymentData = await getPayment(singleItems)
    //  支付数据
    const profitData = await getProfitData(singleItems)
    // 市场占有率
    const marketRioData = await getMarketRatioData(singleItems)

    return {
        pagingSingleItems,
        paymentData,
        profitData,
        marketRioData
    }
}

const attachPercentageTagToField = (item) => {
    for (const field of fieldsWithPercentageTag) {
        if (item[field] && item[field] !== "0.00") {
            item[field] = `${item[field]}%`
        }
    }
    return item;
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
        linkHierarchies: [],
        linkStatuses: taoBaoSingleItemStatuses
    }
    // 判断用户是否是leader
    const userDDId = await userService.getDingDingUserId(59)
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
    // 天猫组deptId：903075138
    const department = await departmentService.getDepartmentWithUsers("903075138")
    const groupingResult = Object.keys(tmpTMInnerGroupingConst.tmInnerGroupVersion1).map(key => {
        return {[key]: tmpTMInnerGroupingConst.tmInnerGroupVersion1[key]}
    })
    let hasGroupedUsers = []
    for (const key of Object.keys(tmpTMInnerGroupingConst.tmInnerGroupVersion1)) {
        hasGroupedUsers = hasGroupedUsers.concat(tmpTMInnerGroupingConst.tmInnerGroupVersion1[key])
    }
    const noGroupedUsers = []
    for (const user of department.dep_user) {
        if (hasGroupedUsers.includes(user.name)) {
            continue
        }
        noGroupedUsers.push(user.name)
    }
    groupingResult.push({"未分组": noGroupedUsers})


    if (isTMLeader) {
        result.productLineLeaders = groupingResult
    } else {
        const currentUser = department.dep_user.filter(user => user.userid === userDDId)
        if (currentUser.length > 0) {
            for (const group of groupingResult) {
                const groupName = Object.keys(group)[0]
                const isInThisGroup = group[groupName].filter(item => item === currentUser[0].name).length > 0
                if (isInThisGroup) {
                    // 组长
                    if (groupName.includes(currentUser[0].name)) {
                        result.productLineLeaders = [{[groupName]: group[groupName]}]
                    } else {
                        result.productLineLeaders = [{[groupName]: [currentUser[0].name]}]
                    }
                    break
                }
            }

        } else {
            result.productLineLeaders = []
        }
    }


    let linkTypes = await singleItemTaoBaoRepo.getLinkTypes()
    linkTypes = linkTypes.map(linkType => linkType.link_type)
    result.linkTypes = linkTypes.filter(linkType => linkType)
    let linkHierarchies = await singleItemTaoBaoRepo.getLinkHierarchy()
    linkHierarchies = linkHierarchies.map(hierarchy => hierarchy.link_hierarchy)
    result.linkHierarchies = linkHierarchies.filter(hierarchy => hierarchy)
    return result
}

/**
 * 返回单品数据详情
 * @param id
 * @returns {Promise<*|*[]|null>}
 */
const getSingleItemById = async (id) => {
    const singleItem = await singleItemTaoBaoRepo.getSingleItemById(id)
    return singleItem
}

/**
 *
 * @param productLineLeaders
 * @param firstLevelProductLine
 * @param secondLevelProductLine
 * @param errorItems
 * @param linkType
 * @param linkStatus
 * @param timeRange
 * @returns {Promise<void>}
 */
const getAllSatisfiedSingleItems = async (productLineLeaders,
                                          firstLevelProductLine,
                                          secondLevelProductLine,
                                          errorItems,
                                          linkTypes,
                                          linkHierarchies,
                                          linkStatus,
                                          timeRange,
                                          clickingAdditionalParams) => {
    const fightingLinkIds = await flowService.getFlowFormValues(tmFightingFlowFormId, linkIdKeyInTmFightingFlowForm, flowStatusConst.RUNNING)
    const satisfiedSingleItems = await singleItemTaoBaoRepo.getTaoBaoSingleItems(0,
        999999,
        productLineLeaders,
        firstLevelProductLine,
        secondLevelProductLine,
        errorItems,
        linkTypes,
        linkHierarchies,
        linkStatus,
        fightingLinkIds,
        timeRange,
        clickingAdditionalParams)
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
            items: linkTypeConst.ToBeOnTheShelves.map(group => {
                return {name: group.name, sum: 0, ids: []}
            })
        }
        for (const productLineLeader of productLineLeaders) {
            const allUsers = await globalGetter.getUsers()
            const users = allUsers.filter((user) => user.name === productLineLeader)
            if (users.length === 0) {
                logger.error(`用户${productLineLeader}不存在详细信息`)
                continue
            }

            const curResult = await getSelfWaitingOnSingleItemLinkOperationCount(users[0].userid)
            result.sum = result.sum + curResult.sum
            result.items[0].sum = result.items[0].sum + curResult.items[0].sum
            //   curResult.items[0].ids 追加 result.items[0].ids
            result.items[0].ids = result.items[0].ids.concat(curResult.items[0].ids)
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
        //根据result 的items 的clickingAdditionalParams 排序  最高的在前
        return result
    }
    throw new NotFoundError(`${status}还不支持`)
}

/**
 * 获取本人链接操作数据（操作）
 * @param username  产品线负责人姓名
 * @param timeRange 时间范围
 * @returns {Promise<{sum: number, items: *[]}>}
 */
const getSelfDoSingleItemLinkOperationCount = async (singleItems) => {
    const result = await getResultTemplateByLinkTypeAndLinkHierarchy()
    for (let i = 0; i < result.items.length - 1; i++) {
        let resultItem = result.items[i]
        const satisfiedSingleItems = singleItems.filter((item) => {
            return resultItem.linkTypes.includes(item.linkType) && resultItem.linkHierarchy === item.linkHierarchy
        })
        result.items[i] = {name: resultItem.name, sum: satisfiedSingleItems.length}
        result.sum = result.sum + satisfiedSingleItems.length
    }

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
        items: linkTypeConst.ToBeOnTheShelves.map(group => {
            return {name: group.name, sum: 0, ids: []}
        })
    };

// 获取今日所有流程
    const todayFlows = await globalGetter.getTodayFlows();
    const runningFlow = todayFlows.filter((flow) => flow.instanceStatus === flowStatusConst.RUNNING);
// 定义一个函数来处理流程并更新结果
    const processFlows = (formUuid, itemIndex) => {
        const item = result.items[itemIndex];
        // 初始化id数组和计数
        item.ids = [];
        item.sum = 0;
        runningFlow.forEach(flow => {
            if (flow.formUuid === formUuid &&
                flow.data[operationLeaderFieldId] &&
                flow.data[operationLeaderFieldId].length > 0 &&
                flow.data[operationLeaderFieldId][0] === userId) {
                item.ids.push(flow.processInstanceId);
                item.sum++;
            }
        });
        result.sum += item.sum;
    };


// 处理新品流程
    processFlows(operationNewFlowFormId, 0);
    // console.log(result.items[0].ids)
// 天猫链接上架流程
    processFlows(tmLinkShelvesFlowFormId, 1);
// 处理宝可梦新品流程
    processFlows(baoKeMengNewFlowFormId, 2);


// 返回最终结果
    return result;
}

/**
 * 获取链接操作数据（待转出）
 * @returns {Promise<{waitingOnNew: number, waitingOnUnsalable: number, waitingOnOld: number}>}
 */
const getSelfWaitingOutSingleItemLinkOperationCount = async (userId) => {

}

/**
 * 根据linkType和linkHierarchy 返回新品、老品+ linkHierarchy的结果模版数据
 * @returns {Promise<{sum: number, items: *[]}>}
 */
const getResultTemplateByLinkTypeAndLinkHierarchy = async () => {
    const result = {sum: 0, items: []}
    const linkHierarchies = await singleItemTaoBaoRepo.getLinkHierarchy()
    // 按照类别统计发货金额、利润额 根据linkTypes和linkHierarchy初始化发货金额的items
    for (const linkTypeGroup of linkTypeConst.groups) {
        for (const hierarchy of linkHierarchies) {
            const linkHierarchy = hierarchy.link_hierarchy
            result.items.push({
                name: `${linkTypeGroup.name}${linkHierarchy || ''}`,
                sum: 0,
                linkTypes: linkTypeGroup.items,
                linkHierarchy: linkHierarchy
            })
        }
    }
    return result
}

/**
 * 获取本人链接操作数据（打仗链接）
 * @param username
 * @param timeRange
 * @returns {Promise<{fightingOnOld: *, fightingOnNew: *}>}
 */
const getSelfFightingSingleItemLinkOperationCount = async (singleItems, fightingLinkIds) => {
    const result = await getResultTemplateByLinkTypeAndLinkHierarchy()

    singleItems = singleItems.filter((item) => {
        return fightingLinkIds.includes(item.linkId)
    })

    for (let i = 0; i < result.items.length - 1; i++) {
        let resultItem = result.items[i]

        const satisfiedSingleItems = singleItems.filter((item) => {
            return resultItem.linkTypes.includes(item.linkType) && resultItem.linkHierarchy === item.linkHierarchy
        })
        result.items[i] = {name: resultItem.name, sum: satisfiedSingleItems.length}
        result.sum = result.sum + satisfiedSingleItems.length
    }
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
        //打印singleItems 的长度
        // console.log(singleItems.length)
        const items = singleItems.filter((singleItem) => {
            for (const exp of item.values) {
                let value = exp.value
                let fieldValue = singleItem[exp.field]
                if (exp.field === "profitRate") {
                    // if(singleItem[exp.lessThan] === "true"){
                    //reallyShipmentAmount 小于0
                    if (exp.lessThan === "negative_profit_60") {
                        if (singleItem[exp.lessThan] === "true") {
                            return singleItem["profitRate"] * 1 < 0
                        }
                        return false
                    } else {
                        return singleItem[exp.lessThan] === "true";
                    }

                    //     return  singleItem[exp.field] < parseFloat(exp.value)
                    // }

                }
                // 坑市场占比环比（7天）
                if (exp.field === "salesMarketRateCircleRate7Day") {
                    return singleItem["salesMarketRateCircleRate7Day"] * 1 < -20 && singleItem["shouTaoPeopleNumMarketRateCircleRate7Day"] * 1 > -20
                }
                //手淘人数市场占比环比（7天）
                if (exp.field === "shouTaoPeopleNumMarketRateCircleRate7Day") {

                    return (singleItem["salesMarketRateCircleRate7Day"] * 1 < -20 && singleItem["shouTaoPeopleNumMarketRateCircleRate7Day"] * 1 < -20) || (singleItem["shouTaoPeopleNumMarketRateCircleRate7Day"] * 1 < -20 && singleItem["salesMarketRateCircleRate7Day"] * 1 > -20)


                }

                // 坑市场占比环比（日天）
                if (exp.field === "salesMarketRateCircleRateDay") {
                    return singleItem["salesMarketRateCircleRateDay"] * 1 < -20 && singleItem["shouTaoPeopleNumMarketRateCircleRateDay"] * 1 > -20
                }
                //手淘人数市场占比环比（日天）
                if (exp.field === "shouTaoPeopleNumMarketRateCircleRateDay") {

                    return (singleItem["salesMarketRateCircleRateDay"] * 1 < -20 && singleItem["shouTaoPeopleNumMarketRateCircleRateDay"] * 1 < -20) || (singleItem["shouTaoPeopleNumMarketRateCircleRateDay"] * 1 < -20 && singleItem["salesMarketRateCircleRateDay"] * 1 > -20)


                }


                if (exp.comparator) {
                    let tmpResult = true
                    // 如果value为数字需要转化
                    const isNumber = /^(\-|\+)?\d+(\.\d+)?$/.test(value)
                    if (isNumber) {
                        value = parseFloat(value)
                        fieldValue = parseFloat(fieldValue)
                        tmpResult = eval(`${fieldValue}${exp.comparator}${value}`)
                    } else {
                        tmpResult = eval(`"${fieldValue}"
                        ${exp.comparator}
                        "${value}"`)
                    }

                    if (!tmpResult) {
                        return false
                    }
                }
                if (exp.min) {
                    const minMatch = fieldValue >= parseFloat(exp.min)
                    if (!minMatch) {
                        return false
                    }
                }
            }
            return true
        })

        result.items.push({name: item.name, sum: items.length, clickingAdditionalParams: item.values})
        for (const tmp of items) {
            uniqueItems[tmp.id] = 1
        }
    }
    result.sum = Object.keys(uniqueItems).length
    // result.items.sort((a, b) => b.sum - a.sum);
    return result;
}


/**
 * 获取数据
 * @param userId
 * @param status
 */
const getErrorLinkOperationCount = async (singleItems, status) => {

    const findSingleItemsDividedByUser = (runningErrorLinkIds, singleItems, status) => {
        const result = {sum: 0, items: []}
        const errorSingleItems = singleItems.filter((item) => {
            return runningErrorLinkIds.includes(item.linkId)
        })

        for (const user of usersOfTM) {
            const singleItemsOfUser = errorSingleItems.filter((item) => item.productLineLeader === user.name)
            result.sum = result.sum + singleItemsOfUser.length
            result.items.push({
                name: user.name,
                sum: singleItemsOfUser.length,
                clickingAdditionalParams: [{"method": "getLinkErrorQueryFields", "param": status}]
            })
        }
        return result
    }

    const usersOfTM = await departmentService.getUsersOfDepartment(tmDeptId)

    // 进行中
    if (status.toUpperCase() === flowStatusConst.RUNNING) {
        const runningErrorLinkIds = await flowService.getFlowFormValues(errorLinkFormId, linkIdField, flowStatusConst.RUNNING)
        const result = findSingleItemsDividedByUser(runningErrorLinkIds, singleItems, flowStatusConst.RUNNING)
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
    throw new NotFoundError(`${status}还不支持`)
}

/**
 * 付费数据： 精准人群、车、万象台
 * @param userName
 * @returns {Promise<*|*[]>}
 */
const getPayment = async (singleItems) => {

    const result = []
    result.push({
        type: "payment",
        name: "支付金额",
        sum: 0,
        items: [
            {
                name: "精准词", sum: 0,
                clickingAdditionalParams: [
                    jsonUtil.getSqlFieldQuery("cartSumPayment", "$gt", 0)
                ]
            },
            {
                name: "万相台", sum: 0,
                clickingAdditionalParams: [
                    jsonUtil.getSqlFieldQuery("wanXiangTaiSumPayment", "$gt", 0)
                ]
            },
            {
                name: "精准人群", sum: 0,
                clickingAdditionalParams: [
                    jsonUtil.getSqlFieldQuery("accuratePeopleSumPayment", "$gt", 0)
                ]
            }
        ]
    })
    result.push({
        type: "promotionAmount",
        name: "推广金额",
        sum: 0,
        items: [
            {
                name: "精准词", sum: 0,
                clickingAdditionalParams: [
                    jsonUtil.getSqlFieldQuery("shoppingCartSumAmount", "$gt", 0)
                ]
            },
            {
                name: "万相台", sum: 0,
                clickingAdditionalParams: [
                    jsonUtil.getSqlFieldQuery("wanXiangTaiCost", "$gt", 0)
                ]
            },
            {
                name: "精准人群", sum: 0,
                clickingAdditionalParams: [
                    jsonUtil.getSqlFieldQuery("accuratePeoplePromotionCost", "$gt", 0)
                ]
            }]
    })
    const roiResult = {
        type: "roi", name: "投产比", sum: 0,
        items: [
            {name: "精准词", sum: 0},
            {name: "万相台", sum: 0},
            {name: "精准人群", sum: 0}
        ]
    }
    const cartSumPaymentLinkIds = singleItems.filter(item => item.cartSumPayment === 0 && item.shoppingCartSumAmount === 0).map(item => item.linkId)
    if (cartSumPaymentLinkIds.length > 0) {
        roiResult.items[0].clickingAdditionalParams = [
            jsonUtil.getSqlFieldQuery("linkId", "$notIn", cartSumPaymentLinkIds)
        ]
    }
    const wanXiangTaiSumPaymentLinkIds = singleItems.filter(item => item.wanXiangTaiSumPayment === 0 && item.wanXiangTaiCost === 0).map(item => item.linkId)
    if (wanXiangTaiSumPaymentLinkIds.length > 0) {
        roiResult.items[1].clickingAdditionalParams = [
            jsonUtil.getSqlFieldQuery("linkId", "$notIn", wanXiangTaiSumPaymentLinkIds)
        ]
    }
    const accuratePeopleSumPaymentLinkIds = singleItems.filter(item => item.accuratePeopleSumPayment === 0 && item.accuratePeoplePromotionCost === 0).map(item => item.linkId)
    if (accuratePeopleSumPaymentLinkIds.length > 0) {
        roiResult.items[2].clickingAdditionalParams = [
            jsonUtil.getSqlFieldQuery("linkId", "$notIn", accuratePeopleSumPaymentLinkIds)
        ]
    }
    result.push(roiResult)

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
    result[2].sum = new BigNumber(result[1].sum).isEqualTo(0) ? 0 : (result[0].sum / result[1].sum).toFixed(2)
    result[2].items[0].sum = new BigNumber(result[1].items[0].sum).isEqualTo(0) ? 0 : (result[0].items[0].sum / result[1].items[0].sum).toFixed(2)
    result[2].items[1].sum = new BigNumber(result[1].items[1].sum).isEqualTo(0) ? 0 : (result[0].items[1].sum / result[1].items[1].sum).toFixed(2)
    result[2].items[2].sum = new BigNumber(result[1].items[2].sum).isEqualTo(0) ? 0 : (result[0].items[2].sum / result[1].items[2].sum).toFixed(2)

    return result
}

/**
 *  * 支付数据：按照新品老品分别统计发货金额和利润额，
 *         利润率按照新老品指定的利润区间统计
 * @param usernames
 * @returns {Promise<[{name: string, sum: number, items: *[]}, {name: string, sum: null, items: *[]}, {name: string, sum: null, items: *[]}]>}
 */
const getProfitData = async (singleItems) => {
    // 根据新品老品 + 链接层级进行分组统计
    const linkHierarchies = await singleItemTaoBaoRepo.getLinkHierarchy()
    // 返回的数据模版
    const result = [
        {type: "deliveryAmount", name: "发货金额", sum: 0, items: []},
        {type: "profitAmount", name: "利润额", sum: 0, items: []},
        {type: "profitRate", name: "利润率", sum: null, items: []}
    ]

    const deliveryAmountStatistic = result[0]
    const profitAmountStatistic = result[1]
    const profitRateStatistic = result[2]

    // 按照类别统计发货金额、利润额 根据linkTypes和linkHierarchy初始化发货金额的items
    for (const linkTypeGroup of linkTypeConst.groups) {
        for (const hierarchy of linkHierarchies) {
            const linkHierarchy = hierarchy.link_hierarchy
            deliveryAmountStatistic.items.push({
                name: `${linkTypeGroup.name}${linkHierarchy || ''}`,
                sum: 0,
                clickingAdditionalParams: [jsonUtil.getSqlFieldQuery("reallyShipmentAmount", "$gt", 0)]
            })
            profitAmountStatistic.items.push({
                name: `${linkTypeGroup.name}${linkHierarchy || ''}`, sum: 0,
                clickingAdditionalParams: [jsonUtil.getSqlFieldQuery("profitAmount", "$gt", 0)]
            })
        }
    }

    // 根据 profitRateRangeSumTypes 初始化sumProfitRate的items
    for (const profitRateRangeSumType of profitRateRangeSumTypes) {
        profitRateStatistic.items.push({name: profitRateRangeSumType.name, sum: 0})
    }

    for (const singleItem of singleItems) {
        // 根据原始linkType获取所对应的linkType组名（新品、老品）
        const linkTypeGroupName = linkTypeUtil.getLinkGroupName(singleItem.linkType)

        const innerAmountStatistic = (amount, groupName, linkHierarchy, amountStatistic) => {
            amountStatistic.sum = new BigNumber(amountStatistic.sum).plus(amount)
            // 分类汇总发货金额统计不同linkType和linkHierarchy的单品表数
            for (const resultItem of amountStatistic.items) {
                if (resultItem.name === `${groupName}${linkHierarchy}`) {
                    resultItem.sum = new BigNumber(resultItem.sum).plus(amount)
                    break
                }
            }
        }

        // 发货金额
        const reallyShipmentAmount = parseFloat(singleItem.reallyShipmentAmount)
        innerAmountStatistic(reallyShipmentAmount, linkTypeGroupName, singleItem.linkHierarchy || '', deliveryAmountStatistic)

        // 利润额
        const profitAmount = parseFloat(singleItem.profitAmount)
        innerAmountStatistic(profitAmount, linkTypeGroupName, singleItem.linkHierarchy || '', profitAmountStatistic)

        // 根据利润率按照新老品指定的利润区间统计
        let profitRateRangeSumTypesIndex = 0
        for (const item of profitRateRangeSumTypes) {
            if (item.type === linkTypeGroupName && parseFloat(singleItem.profitRate) >= item.range[0] && parseFloat(singleItem.profitRate) <= item.range[1]) {
                const currentSumProfitRateItems = profitRateStatistic.items
                for (let i = 0; i < currentSumProfitRateItems.length; i++) {
                    if (currentSumProfitRateItems[i].name === item.name) {
                        currentSumProfitRateItems[i].sum = currentSumProfitRateItems[i].sum + 1
                        currentSumProfitRateItems[i].clickingAdditionalParams = [jsonUtil.getSqlFieldQuery("profitRate", "$between", item.range)]
                        break
                    }
                }
                break
            }
            if (profitRateRangeSumTypesIndex === profitRateRangeSumTypes.length - 1) {
                throw new NotFoundError(`单品：${singleItem.productName}，linkType:${singleItem.linkType}, profitRate: ${singleItem.profitRate} 未匹配到有效的利润区间`)
            }
            profitRateRangeSumTypesIndex = profitRateRangeSumTypesIndex + 1;
        }
    }

    profitRateStatistic.sum = 0
    if (deliveryAmountStatistic.sum > 0) {
        profitRateStatistic.sum = `${(profitAmountStatistic.sum / deliveryAmountStatistic.sum * 100).toFixed(2)}%`
    }
    deliveryAmountStatistic.sum = deliveryAmountStatistic.sum.toFixed(2)
    profitAmountStatistic.sum = profitAmountStatistic.sum.toFixed(2)
    return result
}

const getMarketRatioData = async (singleItems) => {
    const tmpResult = []
    // 初始化结果: 扁平处理
    for (const marketRatio of marketRatioGroup) {
        tmpResult.push({
            ...marketRatio,
            item: {name: marketRatio.item.name, sum: 0, range: marketRatio.item.range, field: marketRatio.item.field}
        })
    }

    let index = 0
    for (const singleItem of singleItems) {
        let salesMarketRateHasComputed = false
        let shouTaoPeopleNumMarketRateHasComputed = false
        // 坑产占比、流量占比（手淘人数市场占比环比（7天））
        const {
            salesMarketRate,
            shouTaoPeopleNumMarketRateCircleRate7Day
        } = singleItem
        // 判断占比所在的区间
        for (const marketRatio of marketRatioGroup) {
            // 统计坑产占比
            if (!salesMarketRateHasComputed &&
                marketRatio.name.includes("坑产占比") &&
                parseFloat(salesMarketRate) >= marketRatio.item.range[0] &&
                parseFloat(salesMarketRate) <= marketRatio.item.range[1]) {
                // 将数据统计到result对应的节点中
                for (const item of tmpResult) {
                    if (item.name.includes("坑产占比") && item.item.name === marketRatio.item.name) {
                        item.item.sum = item.item.sum + 1
                        salesMarketRateHasComputed = true
                        break;
                    }
                }
            }
            // 统计流量占比
            if (!shouTaoPeopleNumMarketRateHasComputed &&
                marketRatio.name.includes("流量占比") &&
                parseFloat(shouTaoPeopleNumMarketRateCircleRate7Day) >= marketRatio.item.range[0] &&
                parseFloat(shouTaoPeopleNumMarketRateCircleRate7Day) <= marketRatio.item.range[1]) {
                // 将数据统计到result对应的节点中
                for (const item of tmpResult) {
                    if (item.name.includes("流量占比") && item.item.name === marketRatio.item.name) {
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
        index = index + 1
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
                    sum: tmpItem.item.sum,
                    clickingAdditionalParams: [
                        jsonUtil.getSqlFieldQuery(tmpItem.item.field, "$between", tmpItem.item.range)
                    ]
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
                            sum: tmpItem.item.sum,
                            clickingAdditionalParams: [
                                jsonUtil.getSqlFieldQuery(tmpItem.item.field, "$between", tmpItem.item.range)
                            ]
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
                        sum: tmpItem.item.sum,
                        clickingAdditionalParams: [
                            jsonUtil.getSqlFieldQuery(tmpItem.item.field, "$between", tmpItem.item.range)
                        ]
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
    const data = await singleItemTaoBaoRepo.getLatestBatchIdRecords(count)
    if (data && data.length > 0) {
        return data
    }
    throw new NotFoundError()
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

// 方法映射，为接口调用使用
const availableFunctionsMap = {"getLinkErrorQueryFields": getLinkErrorQueryFields}


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
    getUniqueSingleItems,
    attachPercentageTagToField,
    getTaoBaoSingleItemsWithStatistic
}