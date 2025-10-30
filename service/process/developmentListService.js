const processConst = require('@/const/processConst')
const processesRepo = require('@/repository/process/processesRepo')

const { typeList, defaultColumns } = processConst

const FIELD_TO_TYPE_MAP = {
    supplier: typeList.SUPPLIER,
    operator: typeList.OPERATOR,
    ip: typeList.IP,
    self: typeList.SELF
}

/**
 * 根据字段名解析对应的推品类型
 * @param {string} field 前端传入的字段标识
 * @returns {string|undefined} 对应的推品类型
 */
const resolveDevelopmentType = (field) => FIELD_TO_TYPE_MAP[field]

/**
 * 查询满足条件的推品明细列表
 * @param {boolean} isRunningMode 是否为待办模式
 * @param {string} developmentType 推品类型
 * @param {string|undefined} startDate 开始日期
 * @param {string|undefined} endDate 结束日期
 * @returns {Promise<Array<object>>} 推品明细列表
 */
const queryDevelopmentList = async (isRunningMode, developmentType, startDate, endDate) => {
    const options = {
        developmentType,
        isRunningMode,
        start: isRunningMode ? undefined : startDate,
        end: isRunningMode ? undefined : endDate
    }
    return processesRepo.getDevelopmentProcessList(options)
}

/**
 * 获取推品全流程的明细数据
 * @param {string} type 查询模式，0 表示发起模式，1 表示待办模式
 * @param {string} field 前端点击的字段标识
 * @param {string|undefined} startDate 开始日期
 * @param {string|undefined} endDate 结束日期
 * @returns {Promise<{columns: Array<object>, data: Array<object>}>} 列配置与数据
 */
const getDevelopmentProcessList = async (type, field, startDate, endDate) => {
    const columns = defaultColumns
    const developmentType = resolveDevelopmentType(field)
    if (!developmentType) {
        return { columns, data: [] }
    }
    const isRunningMode = type === '1'
    const data = await queryDevelopmentList(isRunningMode, developmentType, startDate, endDate)
    return { columns, data }
}

module.exports = {
    getDevelopmentProcessList
}
