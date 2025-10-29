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
    self: 0
})

/**
 * 将数据库返回的原始统计数据转换为前端所需结构
 * @param {Array<object>} statistics 原始统计数据
 * @returns {Array<object>} 转换后的表格数据
 */
const transformStatistics = (statistics = []) => {
    const row = createEmptyStatisticRow()
    statistics.forEach((item) => {
        const field = TYPE_FIELD_MAP[item?.type]
        if (!field) {
            return
        }
        row[field] = Number(item.total) || 0
    })
    row.development = row.supplier + row.operator + row.ip + row.self
    return [row]
}

/**
 * 根据查询类型获取对应的统计数据
 * @param {string} type 查询模式，0 表示发起模式，1 表示待办模式
 * @param {string|undefined} startDate 开始日期
 * @param {string|undefined} endDate 结束日期
 * @returns {Promise<Array<object>>} 数据库统计结果
 */
const getStatisticsByType = async (type, startDate, endDate) => {
    if (type === '1') {
        return await processesRepo.getDevelopmentProcessRunning()
    }
    return await processesRepo.getDevelopmentProcessTotal(startDate, endDate)
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
    const statistics = await getStatisticsByType(type, startDate, endDate)
    const data = transformStatistics(statistics)
    return { columns, data }
}

module.exports = {
    getDevelopmentProcessTotal
}
