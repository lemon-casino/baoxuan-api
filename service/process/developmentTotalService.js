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
    enquiry_finish: 0
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
    row.development = row.supplier + row.operator + row.ip + row.self
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
    const [developmentTotals, operatorInquiry, dailyInquiry] = await Promise.all([
        developmentPromise,
        operatorPromise,
        dailyPromise
    ])
    return {
        isRunningMode,
        developmentTotals,
        operatorInquiry,
        dailyInquiry
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
