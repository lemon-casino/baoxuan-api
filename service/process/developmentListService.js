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

const DAILY_INQUIRY_FIELD_TO_STATUS = {
    enquiry_running: 'running',
    enquiry_finish: 'finish'
}

const SAMPLE_FIELD_TO_STATUS = {
    in_transit: 1,
    receive: 2
}

const SELECTION_FIELD_OPTIONS = {
    analysis_running: { category: 'analysis', statuses: 1 },
    analysis_finish: { category: 'analysis', statuses: [2, 3] },
    select_running: { category: 'review', statuses: 1, excludeChoose: true },
    choose: { category: 'review', statuses: [2, 3], requireChoose: true },
    unchoose: { category: 'review', statuses: [2, 3], requireUnchoose: true, excludeChoose: true }
}

const PLAN_FIELD_TO_STATUSES = {
    plan_running: [1],
    plan_finish: [2, 3, 4]
}

const PURCHASE_FIELD_OPTIONS = {
    order_running: { category: 'order', finished: false },
    order_finish: { category: 'order', finished: true },
    warehousing_running: { category: 'warehousing', finished: false },
    warehousing_finish: { category: 'warehousing', finished: true }
}

const SHELF_FIELD_OPTIONS = {
    unshelf_division1: { status: 1, division: 'division1' },
    unshelf_division2: { status: 1, division: 'division2' },
    unshelf_division3: { status: 1, division: 'division3' },
    shelfed_division1: { status: 2, division: 'division1' },
    shelfed_division2: { status: 2, division: 'division2' },
    shelfed_division3: { status: 2, division: 'division3' }
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

const VISION_FIELD_OPTIONS = { vision: {} }

VISION_CATEGORY_CONFIGS.forEach(({ key, field }) => {
    VISION_FIELD_OPTIONS[field] = { typeKey: key }
    VISION_CREATIVE_CONFIGS.forEach(({ key: creativeKey, suffix }) => {
        const baseField = `${key}_${suffix}`
        VISION_FIELD_OPTIONS[baseField] = { typeKey: key, creativeKey }
        VISION_FIELD_OPTIONS[`${baseField}_running`] = { typeKey: key, creativeKey, stage: 'running' }
        VISION_FIELD_OPTIONS[`${baseField}_finish`] = { typeKey: key, creativeKey, stage: 'finish' }
    })
})

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
 * 根据字段名解析日常询价的状态
 * @param {string} field 前端传入的字段标识
 * @returns {string|undefined} 对应的状态
 */
const resolveDailyInquiryStatus = (field) => DAILY_INQUIRY_FIELD_TO_STATUS[field]

/**
 * 根据字段名解析寄样流程的任务状态
 * @param {string} field 前端传入的字段标识
 * @returns {number|undefined} 对应的任务状态
 */
const resolveSampleStatus = (field) => SAMPLE_FIELD_TO_STATUS[field]

/**
 * 根据字段名解析选品流程的查询配置
 * @param {string} field 前端传入的字段标识
 * @returns {object|undefined} 查询配置
 */
const resolveSelectionOptions = (field) => SELECTION_FIELD_OPTIONS[field]

/**
 * 根据字段名解析设计与监修环节的查询配置
 * @param {string} field 前端传入的字段标识
 * @returns {object|undefined} 查询配置
 */
const resolveDesignOptions = (field) => DESIGN_FIELD_TO_OPTIONS[field]

/**
 * 根据字段名解析方案流程的状态
 * @param {string} field 前端传入的字段标识
 * @returns {Array<number>|undefined} 流程状态集合
 */
const resolvePlanStatuses = (field) => PLAN_FIELD_TO_STATUSES[field]

/**
 * 根据字段名解析视觉流程的查询配置
 * @param {string} field 前端传入的字段标识
 * @returns {object|undefined} 查询配置
 */
const resolveVisionOptions = (field) => VISION_FIELD_OPTIONS[field]

/**
 * 根据字段名解析采购流程的查询配置
 * @param {string} field 前端传入的字段标识
 * @returns {object|undefined} 查询配置
 */
const resolvePurchaseOptions = (field) => PURCHASE_FIELD_OPTIONS[field]

/**
 * 根据字段名解析上架流程的查询配置
 * @param {string} field 前端传入的字段标识
 * @returns {object|undefined} 查询配置
 */
const resolveShelfOptions = (field) => SHELF_FIELD_OPTIONS[field]

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
 * 查询日常询价对应状态的推品明细
 * @param {boolean} isRunningMode 是否为待办模式
 * @param {string} status 目标状态
 * @param {string|undefined} startDate 开始日期
 * @param {string|undefined} endDate 结束日期
 * @returns {Promise<Array<object>>} 推品明细列表
 */
const queryDailyInquiryList = async (isRunningMode, status, startDate, endDate) => {
    const options = {
        status,
        isRunningMode,
        start: isRunningMode ? undefined : startDate,
        end: isRunningMode ? undefined : endDate
    }
    return processesRepo.getDailyInquiryList(options)
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
 * 查询选品环节满足条件的推品明细
 * @param {boolean} isRunningMode 是否为待办模式
 * @param {object} selectionOptions 查询配置
 * @param {'analysis'|'review'} selectionOptions.category 查询分类
 * @param {number|Array<number>} selectionOptions.statuses 目标任务状态
 * @param {boolean} [selectionOptions.excludeChoose] 是否排除选中记录
 * @param {boolean} [selectionOptions.requireChoose] 是否要求存在选中记录
 * @param {boolean} [selectionOptions.requireUnchoose] 是否要求存在未选中记录
 * @param {string|undefined} startDate 开始日期
 * @param {string|undefined} endDate 结束日期
 * @returns {Promise<Array<object>>} 推品明细列表
 */
const querySelectionList = async (isRunningMode, selectionOptions, startDate, endDate) => {
    if (!selectionOptions) {
        return []
    }
    const rawStatuses = selectionOptions.statuses
    const statusList = Array.isArray(rawStatuses) ? rawStatuses : [rawStatuses]
    const effectiveStatuses = isRunningMode
        ? statusList.filter((status) => Number(status) === 1)
        : statusList
    if (!effectiveStatuses.length) {
        return []
    }
    const options = {
        ...selectionOptions,
        statuses: effectiveStatuses,
        isRunningMode,
        start: isRunningMode ? undefined : startDate,
        end: isRunningMode ? undefined : endDate
    }
    return processesRepo.getSelectionProcessList(options)
}

/**
 * 查询方案流程满足条件的推品明细
 * @param {boolean} isRunningMode 是否为待办模式
 * @param {Array<number>} statuses 流程状态集合
 * @param {string|undefined} startDate 开始日期
 * @param {string|undefined} endDate 结束日期
 * @returns {Promise<Array<object>>} 推品明细列表
 */
const queryPlanList = async (isRunningMode, statuses, startDate, endDate) => {
    if (!statuses) {
        return []
    }
    const effectiveStatuses = isRunningMode
        ? statuses.filter((status) => Number(status) === 1)
        : statuses
    if (!effectiveStatuses.length) {
        return []
    }
    const options = {
        statuses: effectiveStatuses,
        isRunningMode,
        start: isRunningMode ? undefined : startDate,
        end: isRunningMode ? undefined : endDate
    }
    return processesRepo.getPlanProcessList(options)
}

/**
 * 查询视觉流程满足条件的推品明细
 * @param {boolean} isRunningMode 是否为待办模式
 * @param {object} visionOptions 查询配置
 * @param {string|undefined} visionOptions.typeKey 推品类型标识
 * @param {string|undefined} visionOptions.creativeKey 视觉创意类型标识
 * @param {'running'|'finish'|undefined} visionOptions.stage 流程阶段
 * @param {string|undefined} startDate 开始日期
 * @param {string|undefined} endDate 结束日期
 * @returns {Promise<Array<object>>} 推品明细列表
 */
const queryVisionList = async (isRunningMode, visionOptions = {}, startDate, endDate) => {
    const options = {
        ...visionOptions,
        isRunningMode,
        start: isRunningMode ? undefined : startDate,
        end: isRunningMode ? undefined : endDate
    }
    return processesRepo.getVisionProcessList(options)
}

/**
 * 查询采购环节满足条件的推品明细
 * @param {boolean} isRunningMode 是否为待办模式
 * @param {object} purchaseOptions 查询配置
 * @param {'order'|'warehousing'} purchaseOptions.category 环节标识
 * @param {boolean} purchaseOptions.finished 是否查询已完成记录
 * @param {string|undefined} startDate 开始日期
 * @param {string|undefined} endDate 结束日期
 * @returns {Promise<Array<object>>} 推品明细列表
 */
const queryPurchaseList = async (isRunningMode, purchaseOptions, startDate, endDate) => {
    if (!purchaseOptions) {
        return []
    }
    const options = {
        ...purchaseOptions,
        isRunningMode,
        start: isRunningMode ? undefined : startDate,
        end: isRunningMode ? undefined : endDate
    }
    return processesRepo.getPurchaseProcessList(options)
}

/**
 * 查询上架流程满足条件的推品明细
 * @param {boolean} isRunningMode 是否为待办模式
 * @param {object} shelfOptions 查询配置
 * @param {number} shelfOptions.status 上架流程状态
 * @param {string} shelfOptions.division 事业部标识
 * @param {string|undefined} startDate 开始日期
 * @param {string|undefined} endDate 结束日期
 * @returns {Promise<Array<object>>} 推品明细列表
 */
const queryShelfList = async (isRunningMode, shelfOptions, startDate, endDate) => {
    if (!shelfOptions) {
        return []
    }
    const options = {
        ...shelfOptions,
        isRunningMode,
        start: isRunningMode ? undefined : startDate,
        end: isRunningMode ? undefined : endDate
    }
    return processesRepo.getShelfProcessList(options)
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
    const dailyInquiryStatus = resolveDailyInquiryStatus(field)
    if (dailyInquiryStatus) {
        const data = await queryDailyInquiryList(isRunningMode, dailyInquiryStatus, startDate, endDate)
        return { columns, data }
    }
    const sampleStatus = resolveSampleStatus(field)
    if (sampleStatus) {
        const data = await querySampleList(isRunningMode, sampleStatus, startDate, endDate)
        return { columns, data }
    }
    const selectionOptions = resolveSelectionOptions(field)
    if (selectionOptions) {
        const data = await querySelectionList(isRunningMode, selectionOptions, startDate, endDate)
        return { columns, data }
    }
    const planStatuses = resolvePlanStatuses(field)
    if (planStatuses) {
        const data = await queryPlanList(isRunningMode, planStatuses, startDate, endDate)
        return { columns, data }
    }
    const designOptions = resolveDesignOptions(field)
    if (designOptions) {
        const data = await queryDesignList(isRunningMode, designOptions, startDate, endDate)
        return { columns, data }
    }
    const visionOptions = resolveVisionOptions(field)
    if (visionOptions) {
        const data = await queryVisionList(isRunningMode, visionOptions, startDate, endDate)
        return { columns, data }
    }
    const purchaseOptions = resolvePurchaseOptions(field)
    if (purchaseOptions) {
        const data = await queryPurchaseList(isRunningMode, purchaseOptions, startDate, endDate)
        return { columns, data }
    }
    const shelfOptions = resolveShelfOptions(field)
    if (shelfOptions) {
        const data = await queryShelfList(isRunningMode, shelfOptions, startDate, endDate)
        return { columns, data }
    }
    return { columns, data: [] }
}

module.exports = {
    getDevelopmentProcessList
}
