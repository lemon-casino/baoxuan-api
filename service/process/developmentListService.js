const processConst = require('@/const/processConst')
const processesRepo = require('@/repository/process/processesRepo')

const { typeList, defaultColumns } = processConst

const FIELD_TO_TYPE_MAP = {
    supplier: typeList.SUPPLIER,
    operator: typeList.OPERATOR,
    ip: typeList.IP,
    self: typeList.SELF
}

const INQUIRY_FIELD_TO_STATUS = {
    inquiry_running: 'running',
    inquiry_success: 'success',
    inquiry_fail: 'fail'
}

const SAMPLE_FIELD_TO_STATUS = {
    in_transit: 1,
    receive: 2
}

const DESIGN_FIELD_TO_OPTIONS = {
    design: { category: 'design', statuses: [1, 2, 3] },
    design_running: { category: 'design', statuses: 1 },
    design_finish: { category: 'design', statuses: [2, 3] },
    sketch_supervision: { category: 'sketch', statuses: [1, 2, 3] },
    sketch_running: { category: 'sketch', statuses: 1 },
    sketch_finish: { category: 'sketch', statuses: [2, 3] },
    sample_supervision: { category: 'sample', statuses: [1, 2, 3] },
    sample_running: { category: 'sample', statuses: 1 },
    sample_finish: { category: 'sample', statuses: [2, 3] },
    vision_supervision: { category: 'vision', statuses: [1, 2, 3] },
    vision_running: { category: 'vision', statuses: 1 },
    vision_finish: { category: 'vision', statuses: [2, 3] },
    product_supervision: { category: 'product', statuses: [1, 2, 3] },
    product_running: { category: 'product', statuses: 1 },
    product_finish: { category: 'product', statuses: [2, 3] }
}

/**
 * 根据字段名解析对应的推品类型
 * @param {string} field 前端传入的字段标识
 * @returns {string|undefined} 对应的推品类型
 */
const resolveDevelopmentType = (field) => FIELD_TO_TYPE_MAP[field]

/**
 * 根据字段名解析反推询价的状态
 * @param {string} field 前端传入的字段标识
 * @returns {string|undefined} 对应的状态
 */
const resolveInquiryStatus = (field) => INQUIRY_FIELD_TO_STATUS[field]

/**
 * 根据字段名解析寄样流程的任务状态
 * @param {string} field 前端传入的字段标识
 * @returns {number|undefined} 对应的任务状态
 */
const resolveSampleStatus = (field) => SAMPLE_FIELD_TO_STATUS[field]

/**
 * 根据字段名解析设计与监修环节的查询配置
 * @param {string} field 前端传入的字段标识
 * @returns {object|undefined} 查询配置
 */
const resolveDesignOptions = (field) => DESIGN_FIELD_TO_OPTIONS[field]

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
 * 查询反推询价对应状态的推品明细
 * @param {boolean} isRunningMode 是否为待办模式
 * @param {string} status 目标状态
 * @param {string|undefined} startDate 开始日期
 * @param {string|undefined} endDate 结束日期
 * @returns {Promise<Array<object>>} 推品明细列表
 */
const queryInquiryList = async (isRunningMode, status, startDate, endDate) => {
    const options = {
        status,
        isRunningMode,
        start: isRunningMode ? undefined : startDate,
        end: isRunningMode ? undefined : endDate
    }
    return processesRepo.getOperatorInquiryList(options)
}

/**
 * 查询寄样环节满足条件的推品明细
 * @param {boolean} isRunningMode 是否为待办模式
 * @param {number} status 目标任务状态
 * @param {string|undefined} startDate 开始日期
 * @param {string|undefined} endDate 结束日期
 * @returns {Promise<Array<object>>} 推品明细列表
 */
const querySampleList = async (isRunningMode, status, startDate, endDate) => {
    const options = {
        status,
        isRunningMode,
        start: isRunningMode ? undefined : startDate,
        end: isRunningMode ? undefined : endDate
    }
    return processesRepo.getSampleDeliveryList(options)
}

/**
 * 查询设计与各类监修环节满足条件的推品明细
 * @param {boolean} isRunningMode 是否为待办模式
 * @param {object} designOptions 查询配置
 * @param {string} designOptions.category 环节标识
 * @param {number|Array<number>} designOptions.statuses 目标任务状态
 * @param {string|undefined} startDate 开始日期
 * @param {string|undefined} endDate 结束日期
 * @returns {Promise<Array<object>>} 推品明细列表
 */
const queryDesignList = async (isRunningMode, designOptions, startDate, endDate) => {
    if (!designOptions) {
        return []
    }
    const rawStatuses = designOptions.statuses
    const statusList = Array.isArray(rawStatuses) ? rawStatuses : [rawStatuses]
    const effectiveStatuses = isRunningMode ? statusList.filter((status) => Number(status) === 1) : statusList
    if (!effectiveStatuses.length) {
        return []
    }
    const options = {
        ...designOptions,
        statuses: effectiveStatuses,
        isRunningMode,
        start: isRunningMode ? undefined : startDate,
        end: isRunningMode ? undefined : endDate
    }
    return processesRepo.getDesignSupervisionList(options)
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
    const columns = defaultColumns.map((column) => ({ ...column }))
    const isRunningMode = type === '1'
    const developmentType = resolveDevelopmentType(field)
    if (developmentType) {
        const data = await queryDevelopmentList(isRunningMode, developmentType, startDate, endDate)
        return { columns, data }
    }
    const inquiryStatus = resolveInquiryStatus(field)
    if (inquiryStatus) {
        const data = await queryInquiryList(isRunningMode, inquiryStatus, startDate, endDate)
        return { columns, data }
    }
    const sampleStatus = resolveSampleStatus(field)
    if (sampleStatus) {
        const data = await querySampleList(isRunningMode, sampleStatus, startDate, endDate)
        return { columns, data }
    }
    const designOptions = resolveDesignOptions(field)
    if (designOptions) {
        const data = await queryDesignList(isRunningMode, designOptions, startDate, endDate)
        return { columns, data }
    }
    return { columns, data: [] }
}

module.exports = {
    getDevelopmentProcessList
}
