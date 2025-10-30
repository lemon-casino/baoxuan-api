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
    unchoose: 0,
    plan: 0,
    plan_running: 0,
    plan_finish: 0,
    purchase: 0,
    order: 0,
    order_running: 0,
    order_finish: 0,
    warehousing: 0,
    warehousing_running: 0,
    warehousing_finish: 0
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

    const analysisRunning = Number(analysisStats.running) || 0
    const analysisFinish = Number(analysisStats.finish) || 0
    row.analysis_running = analysisRunning
    row.analysis_finish = isRunningMode ? 0 : analysisFinish
    row.analysis = row.analysis_running + row.analysis_finish

    const selectRunning = Number(resultStats.running) || 0
    const choose = Number(resultStats.choose) || 0
    const unchoose = Number(resultStats.unchoose) || 0
    row.select_running = selectRunning
    row.choose = isRunningMode ? 0 : choose
    row.unchoose = isRunningMode ? 0 : unchoose
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
    applyPurchaseStats(row, statistics.purchase, isRunningMode)
    row.development = row.supplier + row.operator + row.ip + row.self
    row.inquiry = row.inquiry_operator + row.enquiry
    row.design_supervision = row.design + row.supervision
    row.send_sample = row.in_transit + row.receive
    row.select = row.analysis + row.select_result
    row.purchase = row.order + row.warehousing
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
    const purchasePromise = processesRepo.getPurchaseStats(
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
        purchase
    ] = await Promise.all([
        developmentPromise,
        operatorPromise,
        dailyPromise,
        designPromise,
        samplePromise,
        selectionPromise,
        planPromise,
        purchasePromise
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
        purchase
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
