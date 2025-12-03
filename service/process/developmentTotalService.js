const processConst = require('@/const/processConst')
const processesRepo = require('@/repository/process/processesRepo')

const { typeList } = processConst

const TYPE_FIELD_MAP = {
    [typeList.SUPPLIER]: 'supplier',
    [typeList.OPERATOR]: 'operator',
    [typeList.IP]: 'ip',
    [typeList.SELF]: 'self'
}

/**
 * 根据查询类型返回需要展示的列配置
 * @param {string} type 查询模式，0 表示发起模式，1 表示待办模式
 * @returns {Array<object>} 对应模式下需要展示的列
 */
const getColumnsByQueryType = (type) => {
    return type === '0' ? processConst.dColumns : processConst.rColumns
}

/**
 * 构建一条统计数据的基础结构，默认数量均为 0
 * @returns {object} 初始化后的统计行数据
 */
const createEmptyStatisticRow = () => ({
    development: 0,
    inquiry: 0,
    supplier: 0,
    operator: 0,
    ip: 0,
    self: 0,
    inquiry_operator: 0,
    inquiry_running: 0,
    inquiry_success: 0,
    inquiry_fail: 0,
    enquiry: 0,
    enquiry_running: 0,
    enquiry_finish: 0,
    design_supervision: 0,
    design: 0,
    design_running: 0,
    design_finish: 0,
    supervision: 0,
    sketch_supervision: 0,
    sketch_running: 0,
    sketch_finish: 0,
    sample_supervision: 0,
    sample_running: 0,
    sample_finish: 0,
    vision_supervision: 0,
    vision_running: 0,
    vision_finish: 0,
    product_supervision: 0,
    product_running: 0,
    product_finish: 0,
    send_sample: 0,
    in_transit: 0,
    receive: 0,
    select: 0,
    analysis: 0,
    analysis_running: 0,
    analysis_finish: 0,
    select_result: 0,
    select_running: 0,
    choose: 0,
    choose_division1: 0,
    choose_division1_supplier: 0,
    choose_division1_operator: 0,
    choose_division1_ip: 0,
    choose_division1_self: 0,
    choose_division2: 0,
    choose_division2_supplier: 0,
    choose_division2_operator: 0,
    choose_division2_ip: 0,
    choose_division2_self: 0,
    choose_division3: 0,
    choose_division3_supplier: 0,
    choose_division3_operator: 0,
    choose_division3_ip: 0,
    choose_division3_self: 0,
    unchoose: 0,
    unchoose_division1: 0,
    unchoose_division1_supplier: 0,
    unchoose_division1_operator: 0,
    unchoose_division1_ip: 0,
    unchoose_division1_self: 0,
    unchoose_division2: 0,
    unchoose_division2_supplier: 0,
    unchoose_division2_operator: 0,
    unchoose_division2_ip: 0,
    unchoose_division2_self: 0,
    unchoose_division3: 0,
    unchoose_division3_supplier: 0,
    unchoose_division3_operator: 0,
    unchoose_division3_ip: 0,
    unchoose_division3_self: 0,
    plan: 0,
    plan_running: 0,
    plan_finish: 0,
    vision: 0,
    vision_supplier: 0,
    supplier_original: 0,
    supplier_original_running: 0,
    supplier_original_finish: 0,
    supplier_semi_original: 0,
    supplier_semi_original_running: 0,
    supplier_semi_original_finish: 0,
    supplier_unoriginal: 0,
    supplier_unoriginal_running: 0,
    supplier_unoriginal_finish: 0,
    vision_operator: 0,
    operator_original: 0,
    operator_original_running: 0,
    operator_original_finish: 0,
    operator_semi_original: 0,
    operator_semi_original_running: 0,
    operator_semi_original_finish: 0,
    operator_unoriginal: 0,
    operator_unoriginal_running: 0,
    operator_unoriginal_finish: 0,
    vision_ip: 0,
    ip_original: 0,
    ip_original_running: 0,
    ip_original_finish: 0,
    ip_semi_original: 0,
    ip_semi_original_running: 0,
    ip_semi_original_finish: 0,
    ip_unoriginal: 0,
    ip_unoriginal_running: 0,
    ip_unoriginal_finish: 0,
    vision_self: 0,
    self_original: 0,
    self_original_running: 0,
    self_original_finish: 0,
    self_semi_original: 0,
    self_semi_original_running: 0,
    self_semi_original_finish: 0,
    self_unoriginal: 0,
    self_unoriginal_running: 0,
    self_unoriginal_finish: 0,
    purchase: 0,
    order: 0,
    order_running: 0,
    order_finish: 0,
    warehousing: 0,
    warehousing_running: 0,
    warehousing_finish: 0,
    shelf: 0,
    unshelf: 0,
    unshelf_division1: 0,
    unshelf_division1_supplier: 0,
    unshelf_division1_operator: 0,
    unshelf_division1_ip: 0,
    unshelf_division1_self: 0,
    unshelf_division2: 0,
    unshelf_division2_supplier: 0,
    unshelf_division2_operator: 0,
    unshelf_division2_ip: 0,
    unshelf_division2_self: 0,
    unshelf_division3: 0,
    unshelf_division3_supplier: 0,
    unshelf_division3_operator: 0,
    unshelf_division3_ip: 0,
    unshelf_division3_self: 0,
    shelfed: 0,
    shelfed_division1: 0,
    shelfed_division1_supplier: 0,
    shelfed_division1_operator: 0,
    shelfed_division1_ip: 0,
    shelfed_division1_self: 0,
    shelfed_division2: 0,
    shelfed_division2_supplier: 0,
    shelfed_division2_operator: 0,
    shelfed_division2_ip: 0,
    shelfed_division2_self: 0,
    shelfed_division3: 0,
    shelfed_division3_supplier: 0,
    shelfed_division3_operator: 0,
    shelfed_division3_ip: 0,
    shelfed_division3_self: 0
})

/**
 * 写入发起数量的基础统计数据
 * @param {object} row 统计结果行
 * @param {Array<object>} totals 开发类型聚合结果
 */
const applyDevelopmentTotals = (row, totals = []) => {
    totals.forEach((item) => {
        const field = TYPE_FIELD_MAP[item?.type]
        if (!field) {
            return
        }
        row[field] = Number(item.total) || 0
    })
}

/**
 * 写入询价环节中反推数量的统计结果
 * @param {object} row 统计结果行
 * @param {object} stats 反推询价统计数据
 * @param {boolean} isRunningMode 是否为待办模式
 */
const applyOperatorInquiryStats = (row, stats = {}, isRunningMode) => {
    const running = Number(stats.running) || 0
    const success = Number(stats.success) || 0
    const fail = Number(stats.fail) || 0
    row.inquiry_running = running
    if (isRunningMode) {
        row.inquiry_success = 0
        row.inquiry_fail = 0
        row.inquiry_operator = running
        return
    }
    row.inquiry_success = success
    row.inquiry_fail = fail
    row.inquiry_operator = running + success + fail
}

/**
 * 写入询价环节中日常询价的统计结果
 * @param {object} row 统计结果行
 * @param {object} stats 日常询价统计数据
 * @param {boolean} isRunningMode 是否为待办模式
 */
const applyDailyInquiryStats = (row, stats = {}, isRunningMode) => {
    const running = Number(stats.running) || 0
    const finish = Number(stats.finish) || 0
    row.enquiry_running = running
    if (isRunningMode) {
        row.enquiry_finish = 0
        row.enquiry = running
        return
    }
    row.enquiry_finish = finish
    row.enquiry = running + finish
}

/**
 * 写入设计监修阶段的统计结果
 * @param {object} row 统计结果行
 * @param {object} stats 设计监修统计数据
 * @param {boolean} isRunningMode 是否为待办模式
 */
const applyDesignSupervisionStats = (row, stats = {}, isRunningMode) => {
    const normalizeCounts = (key) => {
        const data = stats[key] || {}
        const running = Number(data.running) || 0
        const finish = Number(data.finish) || 0
        return {
            running,
            finish: isRunningMode ? 0 : finish
        }
    }

    const designCounts = normalizeCounts('design')
    row.design_running = designCounts.running
    row.design_finish = designCounts.finish
    row.design = row.design_running + row.design_finish

    const supervisionConfigs = [
        { key: 'sketch', prefix: 'sketch', field: 'sketch_supervision' },
        { key: 'sample', prefix: 'sample', field: 'sample_supervision' },
        { key: 'vision', prefix: 'vision', field: 'vision_supervision' },
        { key: 'product', prefix: 'product', field: 'product_supervision' }
    ]

    let supervisionTotal = 0
    supervisionConfigs.forEach(({ key, prefix, field }) => {
        const counts = normalizeCounts(key)
        row[`${prefix}_running`] = counts.running
        row[`${prefix}_finish`] = counts.finish
        row[field] = counts.running + counts.finish
        supervisionTotal += row[field]
    })

    row.supervision = supervisionTotal
}

/**
 * 写入寄样环节的统计结果
 * @param {object} row 统计结果行
 * @param {object} stats 寄样环节统计数据
 * @param {boolean} isRunningMode 是否为待办模式
 */
const applySampleDeliveryStats = (row, stats = {}, isRunningMode) => {
    const inTransit = Number(stats.inTransit) || 0
    const receive = Number(stats.receive) || 0
    row.in_transit = inTransit
    row.receive = isRunningMode ? 0 : receive
    row.send_sample = row.in_transit + row.receive
}

/**
 * 写入选品环节的统计结果
 * @param {object} row 统计结果行
 * @param {object} stats 选品环节统计数据
 * @param {boolean} isRunningMode 是否为待办模式
 */
const applySelectionStats = (row, stats = {}, isRunningMode) => {
    const analysisStats = stats.analysis || {}
    const resultStats = stats.result || {}
    const typeKeys = ['supplier', 'operator', 'ip', 'self']

    const analysisRunning = Number(analysisStats.running) || 0
    const analysisFinish = Number(analysisStats.finish) || 0
    row.analysis_running = analysisRunning
    row.analysis_finish = isRunningMode ? 0 : analysisFinish
    row.analysis = row.analysis_running + row.analysis_finish

    const selectRunning = Number(resultStats.running) || 0
    const chooseStats = resultStats.choose || {}
    const unchooseStats = resultStats.unchoose || {}
    const divisions = ['division1', 'division2', 'division3']
    let chooseTotal = 0
    let unchooseTotal = 0
    divisions.forEach((division) => {
        const chooseField = `choose_${division}`
        const unchooseField = `unchoose_${division}`
        const divisionChooseStats = chooseStats[division] || {}
        const divisionUnchooseStats = unchooseStats[division] || {}

        let chooseDivisionTotal = 0
        let unchooseDivisionTotal = 0

        typeKeys.forEach((typeKey) => {
            const chooseFieldKey = `${chooseField}_${typeKey}`
            const unchooseFieldKey = `${unchooseField}_${typeKey}`
            const chooseValue = Number(divisionChooseStats[typeKey]) || 0
            const unchooseValue = Number(divisionUnchooseStats[typeKey]) || 0
            row[chooseFieldKey] = isRunningMode ? 0 : chooseValue
            row[unchooseFieldKey] = isRunningMode ? 0 : unchooseValue
            chooseDivisionTotal += row[chooseFieldKey]
            unchooseDivisionTotal += row[unchooseFieldKey]
        })

        row[chooseField] = chooseDivisionTotal
        row[unchooseField] = unchooseDivisionTotal
        chooseTotal += row[chooseField]
        unchooseTotal += row[unchooseField]
    })
    row.select_running = selectRunning
    row.choose = chooseTotal
    row.unchoose = unchooseTotal
    row.select_result = row.select_running + row.choose + row.unchoose
}

/**
 * 写入方案环节的统计结果
 * @param {object} row 统计结果行
 * @param {object} stats 方案环节统计数据
 * @param {boolean} isRunningMode 是否为待办模式
 */
const applyPlanStats = (row, stats = {}, isRunningMode) => {
    const running = Number(stats.running) || 0
    const finish = Number(stats.finish) || 0
    row.plan_running = running
    row.plan_finish = isRunningMode ? 0 : finish
    row.plan = row.plan_running + row.plan_finish
}

const VISION_CATEGORY_CONFIGS = [
    { key: 'supplier', field: 'vision_supplier' },
    { key: 'operator', field: 'vision_operator' },
    { key: 'ip', field: 'vision_ip' },
    { key: 'self', field: 'vision_self' }
]

const VISION_CREATIVE_CONFIGS = [
    { key: 'original', suffix: 'original' },
    { key: 'semi_original', suffix: 'semi_original' },
    { key: 'unoriginal', suffix: 'unoriginal' }
]

/**
 * 写入视觉环节的统计结果
 * @param {object} row 统计结果行
 * @param {object} stats 视觉环节统计数据
 * @param {boolean} isRunningMode 是否为待办模式
 */
const applyVisionStats = (row, stats = {}, isRunningMode) => {
    let visionTotal = 0
    VISION_CATEGORY_CONFIGS.forEach(({ key, field }) => {
        const categoryStats = stats[key] || {}
        let categoryTotal = 0
        VISION_CREATIVE_CONFIGS.forEach(({ key: creativeKey, suffix }) => {
            const data = categoryStats[creativeKey] || {}
            const running = Number(data.running) || 0
            const finish = Number(data.finish) || 0
            const finishValue = isRunningMode ? 0 : finish
            const total = running + finishValue
            const baseField = `${key}_${suffix}`
            row[`${baseField}_running`] = running
            row[`${baseField}_finish`] = finishValue
            row[baseField] = total
            categoryTotal += total
        })
        row[field] = categoryTotal
        visionTotal += categoryTotal
    })
    row.vision = visionTotal
}

/**
 * 写入采购环节的统计结果
 * @param {object} row 统计结果行
 * @param {object} stats 采购环节统计数据
 * @param {boolean} isRunningMode 是否为待办模式
 */
const applyPurchaseStats = (row, stats = {}, isRunningMode) => {
    const normalize = (key) => {
        const data = stats[key] || {}
        const running = Number(data.running) || 0
        const finish = Number(data.finish) || 0
        return {
            running,
            finish: isRunningMode ? 0 : finish
        }
    }

    const orderStats = normalize('order')
    row.order_running = orderStats.running
    row.order_finish = orderStats.finish
    row.order = row.order_running + row.order_finish

    const warehousingStats = normalize('warehousing')
    row.warehousing_running = warehousingStats.running
    row.warehousing_finish = warehousingStats.finish
    row.warehousing = row.warehousing_running + row.warehousing_finish

    row.purchase = row.order + row.warehousing
}

/**
 * 写入上架环节的统计结果
 * @param {object} row 统计结果行
 * @param {object} stats 上架环节统计数据
 * @param {boolean} isRunningMode 是否为待办模式
 */
const applyShelfStats = (row, stats = {}, isRunningMode) => {
    const divisions = ['division1', 'division2', 'division3']
    const typeKeys = ['supplier', 'operator', 'ip', 'self']
    const assignGroup = (prefix, group = {}, allowValues = true) => {
        let total = 0
        divisions.forEach((division) => {
            let divisionTotal = 0
            typeKeys.forEach((typeKey) => {
                const field = `${prefix}_${division}_${typeKey}`
                const value = allowValues ? Number(group?.[division]?.[typeKey]) || 0 : 0
                row[field] = value
                divisionTotal += value
            })
            const divisionField = `${prefix}_${division}`
            row[divisionField] = divisionTotal
            total += divisionTotal
        })
        row[prefix] = total
        return total
    }

    assignGroup('unshelf', stats.unshelf)
    if (isRunningMode) {
        assignGroup('shelfed', {}, false)
    } else {
        assignGroup('shelfed', stats.shelfed)
    }
    row.shelf = row.unshelf + row.shelfed
}

/**
 * 汇总所有模块的统计结果并生成前端展示结构
 * @param {object} statistics 聚合后的所有统计数据
 * @param {boolean} isRunningMode 是否为待办模式
 * @returns {Array<object>} 表格数据
 */
const transformStatistics = (statistics = {}, isRunningMode) => {
    const row = createEmptyStatisticRow()
    applyDevelopmentTotals(row, statistics.developmentTotals || [])
    applyOperatorInquiryStats(row, statistics.operatorInquiry, isRunningMode)
    applyDailyInquiryStats(row, statistics.dailyInquiry, isRunningMode)
    applyDesignSupervisionStats(row, statistics.designSupervision, isRunningMode)
    applySampleDeliveryStats(row, statistics.sampleDelivery, isRunningMode)
    applySelectionStats(row, statistics.selection, isRunningMode)
    applyPlanStats(row, statistics.plan, isRunningMode)
    applyVisionStats(row, statistics.vision, isRunningMode)
    applyPurchaseStats(row, statistics.purchase, isRunningMode)
    applyShelfStats(row, statistics.shelf, isRunningMode)
    row.development = row.supplier + row.operator + row.ip + row.self
    row.inquiry = row.inquiry_operator + row.enquiry
    row.design_supervision = row.design + row.supervision
    row.send_sample = row.in_transit + row.receive
    row.select = row.analysis + row.select_result
    row.vision = row.vision_supplier + row.vision_operator + row.vision_ip + row.vision_self
    row.purchase = row.order + row.warehousing
    row.shelf = row.unshelf + row.shelfed
    return [row]
}

/**
 * 根据查询类型获取对应的统计数据
 * @param {string} type 查询模式，0 表示发起模式，1 表示待办模式
 * @param {string|undefined} startDate 开始日期
 * @param {string|undefined} endDate 结束日期
 * @returns {Promise<object>} 聚合后的多维统计结果
 */
const getStatisticsByType = async (type, startDate, endDate) => {
    const isRunningMode = type === '1'
    const developmentPromise = isRunningMode
        ? processesRepo.getDevelopmentProcessRunning()
        : processesRepo.getDevelopmentProcessTotal(startDate, endDate)
    const operatorPromise = processesRepo.getOperatorInquiryStats(
        isRunningMode ? undefined : startDate,
        isRunningMode ? undefined : endDate
    )
    const dailyPromise = processesRepo.getDailyInquiryStats(
        isRunningMode ? undefined : startDate,
        isRunningMode ? undefined : endDate
    )
    const designPromise = processesRepo.getDesignSupervisionStats(
        isRunningMode ? undefined : startDate,
        isRunningMode ? undefined : endDate
    )
    const samplePromise = processesRepo.getSampleDeliveryStats(
        isRunningMode ? undefined : startDate,
        isRunningMode ? undefined : endDate
    )
    const selectionPromise = processesRepo.getSelectionStats(
        isRunningMode ? undefined : startDate,
        isRunningMode ? undefined : endDate
    )
    const planPromise = processesRepo.getPlanStats(
        isRunningMode ? undefined : startDate,
        isRunningMode ? undefined : endDate
    )
    const visionPromise = processesRepo.getVisionStats(
        isRunningMode ? undefined : startDate,
        isRunningMode ? undefined : endDate
    )
    const purchasePromise = processesRepo.getPurchaseStats(
        isRunningMode ? undefined : startDate,
        isRunningMode ? undefined : endDate
    )
    const shelfPromise = processesRepo.getShelfStats(
        isRunningMode ? undefined : startDate,
        isRunningMode ? undefined : endDate
    )
    const [
        developmentTotals,
        operatorInquiry,
        dailyInquiry,
        designSupervision,
        sampleDelivery,
        selection,
        plan,
        vision,
        purchase,
        shelf
    ] = await Promise.all([
        developmentPromise,
        operatorPromise,
        dailyPromise,
        designPromise,
        samplePromise,
        selectionPromise,
        planPromise,
        visionPromise,
        purchasePromise,
        shelfPromise
    ])
    return {
        isRunningMode,
        developmentTotals,
        operatorInquiry,
        dailyInquiry,
        designSupervision,
        sampleDelivery,
        selection,
        plan,
        vision,
        purchase,
        shelf
    }
}

/**
 * 获取推品全流程的统计数据，包含列配置与数据内容
 * @param {string} type 查询模式，0 表示发起模式，1 表示待办模式
 * @param {string|undefined} startDate 开始日期
 * @param {string|undefined} endDate 结束日期
 * @returns {Promise<{columns: Array<object>, data: Array<object>}>} 列与数据组合结果
 */
const getDevelopmentProcessTotal = async (type, startDate, endDate) => {
    const columns = getColumnsByQueryType(type)
    const { isRunningMode, ...statistics } = await getStatisticsByType(type, startDate, endDate)
    const data = transformStatistics(statistics, isRunningMode)
    return { columns, data }
}

module.exports = {
    getDevelopmentProcessTotal
}
