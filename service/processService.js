const processRepo = require("@/repository/processRepo")
const userRepo = require("@/repository/userRepo")
const processConst = require('@/const/processConst')
const { v4 } = require('uuid')
const developmentProcessesRepo = require("@/repository/process/developmentProcessRepo")
const actReProcdefRepo = require("@/repository/bpm/actReProcdefRepo")
const commonReq = require('@/core/bpmReq/commonReq')
const credentialsReq = require("@/core/dingDingReq/credentialsReq")
const departmentService = require('./departmentService')
const systemUsersRepo = require("@/repository/bpm/systemUsersRepo")
const processesRepo = require("@/repository/process/processesRepo")
const processTasksRepo = require("@/repository/process/processTasksRepo")
const moment = require('moment')
const developmentTotalService = require('@/service/process/developmentTotalService')
const processInfoRepo = require("@/repository/process/processInfoRepo")
const developmentListService = require('@/service/process/developmentListService')

const isBlankFormFieldValue = (value) => {
    if (value === null || value === undefined) return true
    if (typeof value === 'string') {
        const trimmed = value.trim()
        return trimmed === '' || trimmed === '无' || trimmed === '-'
    }
    return false
}

const MARKET_ANALYSIS_PROCESS_CODE = 'syybyycl'
const MARKET_ANALYSIS_FIELD_TITLES = ['事业一部市场分析上传', '事业二部市场分析上传', '事业三部市场分析上传']
const ORDER_TYPE_FIELD_TITLE = '产品采购'
const ORDER_QUANTITY_PROCESS_CODE = 'kjdinghuo'
const ORDER_QUANTITY_FIELD_TITLE = '实际订货量'
const VISION_TYPE_PROCESS_CODE = 'qihuashenhe'
const VISION_TYPE_FIELD_TITLE = '视觉类型'
const PLATFORM_IS_JD_FIELD_TITLE = '平台是否为京东'
const HOT_PLAN_PROCESS_CODE = 'baokuanliuchengxb_copyceshi'
const HOT_PLAN_OPERATOR_FIELD_TITLE = '运营负责人'
const HOT_PLAN_FIELD_TITLES = [PLATFORM_IS_JD_FIELD_TITLE, HOT_PLAN_OPERATOR_FIELD_TITLE]
const SELECT_PROJECT_FIELD_TITLE = '选中平台'
const VISION_AND_PLATFORM_FIELD_TITLES = [
    VISION_TYPE_FIELD_TITLE,
    PLATFORM_IS_JD_FIELD_TITLE,
    SELECT_PROJECT_FIELD_TITLE,
]
const SHELF_PROCESS_CODE = 'sjlcqpt_copy'
const GOODS_ID_FIELD_CONFIGS = [
    { title: '拼多多上架完成填入链接ID', platform: '拼多多', group: 'first' },
    { title: '天猫超市上架完成填入链接ID', platform: '天猫超市', group: 'first' },
    { title: 'Coupang上架完成填入链接ID', platform: 'Coupang', group: 'first' },
    { title: '淘工厂上架完成填入链接ID', platform: '淘工厂', group: 'first' },
    { title: '京东上架完成填入链接ID', platform: '京东', group: 'second' },
    { title: '抖音上架完成填入链接ID', platform: '抖音', group: 'second' },
    { title: '快手上架完成填入链接ID', platform: '快手', group: 'second' },
    { title: '得物上架完成填入链接ID', platform: '得物', group: 'second' },
    { title: '唯品会上架完成填入链接ID', platform: '唯品会', group: 'second' },
    { title: '1688上架完成填入链接ID', platform: '1688', group: 'second' },
    { title: '天猫上架完成填入链接ID', platform: '天猫', group: 'third' },
    { title: '小红书上架完成填入链接ID', platform: '小红书', group: 'third' },
]
const GOODS_ID_FIELD_TITLES = Array.from(new Set(GOODS_ID_FIELD_CONFIGS.map((config) => config.title)))
const GOODS_ID_GROUP_TO_COLUMN = {
    first: 'first_goods_id',
    second: 'second_goods_id',
    third: 'third_goods_id',
}
const GOODS_ID_GROUP_PLATFORM_ORDER = {
    first: ['拼多多', '天猫超市', '淘工厂', 'Coupang'],
    second: ['京东', '抖音', '快手', '得物', '唯品会', '1688'],
    third: ['天猫', '小红书'],
}
const GOODS_ID_FIELD_CONFIG_MAP = GOODS_ID_FIELD_CONFIGS.reduce((map, config) => {
    map[config.title] = config
    return map
}, {})

const DEVELOPMENT_PROCESS_FIELD_SYNC_CONFIGS = [
    { title: '京东是否选中', column: 'jd_is_select', defaultValue: '-', emptyValue: '无', valueType: 'selectionStatus' },
    { title: '事业一部是否选中', column: 'first_select', defaultValue: '-', emptyValue: '无', valueType: 'selectionStatus' },
    { title: '事业二部是否选中', column: 'second_select', defaultValue: '-', emptyValue: '无', valueType: 'selectionStatus' },
    { title: '事业三部是否选中', column: 'third_select', defaultValue: '-', emptyValue: '无', valueType: 'selectionStatus' },
    { title: '类目选择', column: 'categories', defaultValue: '-', emptyValue: '无' },
    { title: '产品销售季节', column: 'seasons', defaultValue: '-', emptyValue: '无' },
    { title: '相关联的产品类型和节日', column: 'related', defaultValue: '-', emptyValue: '无' },
    { title: '产品线简称', column: 'brief_name', defaultValue: '-', emptyValue: '无' },
    { title: '采购形式', column: 'purchase_type', defaultValue: '-', emptyValue: '无' },
    { title: '供应商名称', column: 'supplier', defaultValue: '-', emptyValue: '无' },
    { title: '供应商属性', column: 'supplier_type', defaultValue: '-', emptyValue: '无' },
    { title: '产品信息', column: 'product_info', defaultValue: '-', emptyValue: '无' },
    { title: '产品属性', column: 'product_type', defaultValue: '-', emptyValue: '无' },
    { title: '产品销售目的', column: 'sale_purpose', defaultValue: '-', emptyValue: '无' },
    { title: '市场分析名称', column: 'analysis_name', defaultValue: '-', emptyValue: '无' },
    { title: '立项性质', column: 'project_type', defaultValue: '-', emptyValue: '无' },
    { title: '设计定义', column: 'design_type', defaultValue: '-', emptyValue: '无' },
    { title: '产品开发性质', column: 'exploitation_features', defaultValue: '-', emptyValue: '无' },
    { title: '核心立项理由', column: 'core_reasons', defaultValue: '-', emptyValue: '无' },
    { title: '预计开发周期（大货时间）', column: 'schedule_arrived_time', defaultValue: '-', emptyValue: '无' },
    { title: '预计样品确认时间', column: 'schedule_confirm_time', defaultValue: '-', emptyValue: '无' },
    { title: '自研-是否需要自主设计', column: 'is_self', defaultValue: '-', emptyValue: '无' },
    { title: 'SPU编码', column: 'spu', defaultValue: '-', emptyValue: '无' }
]

const DEVELOPMENT_PROCESS_FIELD_TITLES = DEVELOPMENT_PROCESS_FIELD_SYNC_CONFIGS.map((item) => item.title)

const SELECTION_STATUS_COLUMN_SET = new Set(
    DEVELOPMENT_PROCESS_FIELD_SYNC_CONFIGS
        .filter((config) => config.valueType === 'selectionStatus')
        .map((config) => config.column)
)

const SELECTION_TRUE_VALUES = new Set(['选中', '是', 'true', 'TRUE', '1', 1])
const SELECTION_FALSE_VALUES = new Set(['未选中', '否', 'false', 'FALSE', '0', 0])

const normalizeSelectionStatus = (value) => {
    if (value === null || value === undefined) return 'blank'
    if (typeof value === 'number') {
        if (value === 1) return 'selected'
        if (value === 0) return 'not_selected'
        return 'blank'
    }
    if (typeof value === 'boolean') return value ? 'selected' : 'not_selected'
    const trimmed = `${value}`.trim()
    if (!trimmed || trimmed === '-' || trimmed === '无') return 'blank'
    if (SELECTION_TRUE_VALUES.has(trimmed)) return 'selected'
    if (SELECTION_FALSE_VALUES.has(trimmed)) return 'not_selected'
    return trimmed
}

const SELECTION_STORAGE_VALUES = {
    selected: 1,
    not_selected: 0,
    missing: 3,
    empty: 4,
}

const resolveSelectionStorageValue = (hasFieldValue, rawValue) => {
    if (!hasFieldValue) {
        return SELECTION_STORAGE_VALUES.missing
    }
    if (isBlankFormFieldValue(rawValue)) {
        return SELECTION_STORAGE_VALUES.empty
    }
    const status = normalizeSelectionStatus(rawValue)
    if (status === 'selected') {
        return SELECTION_STORAGE_VALUES.selected
    }
    if (status === 'not_selected') {
        return SELECTION_STORAGE_VALUES.not_selected
    }
    return SELECTION_STORAGE_VALUES.empty
}

const normalizeSelectionStorageValue = (value) => {
    if (value === null || value === undefined) return null
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed) return null
        const parsed = Number(trimmed)
        if (!Number.isNaN(parsed)) return parsed
        return trimmed
    }
    return value
}

const valuesAreEqual = (column, currentValue, targetValue) => {
    if (SELECTION_STATUS_COLUMN_SET.has(column)) {
        return normalizeSelectionStorageValue(currentValue) === normalizeSelectionStorageValue(targetValue)
    }
    return currentValue === targetValue
}

const parseMarketAnalysisContent = (value) => {
    if (value === null || value === undefined) return []
    if (Array.isArray(value)) return value
    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed) return []
        try {
            const parsed = JSON.parse(trimmed)
            if (Array.isArray(parsed)) {
                return parsed
            }
        } catch (err) {
            // ignore JSON parse errors and treat as raw string below
        }
        return [value]
    }
    return [value]
}

const buildMarketAnalysisMap = (rows) => {
    const map = new Map()
    for (const row of rows || []) {
        const uid = row?.development_uid
        const title = row?.field_title
        if (!uid || !title) continue
        const contents = parseMarketAnalysisContent(row?.content)
        if (!contents.length) continue
        if (!map.has(uid)) map.set(uid, new Map())
        const titleMap = map.get(uid)
        if (!titleMap.has(title)) titleMap.set(title, [])
        titleMap.get(title).push(...contents)
    }
    return map
}

const buildMarketAnalysisPayload = (titleMap) => {
    if (!titleMap) return null
    const payload = []
    for (const title of MARKET_ANALYSIS_FIELD_TITLES) {
        const contents = titleMap.get(title)
        if (!contents?.length) continue
        payload.push({ title, content: contents })
    }
    return payload.length ? payload : null
}

const parseJsonArrayContent = (value) => {
    if (value === null || value === undefined) return []
    if (Array.isArray(value)) return value
    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed) return []
        try {
            const parsed = JSON.parse(trimmed)
            if (Array.isArray(parsed)) {
                return parsed
            }
        } catch (err) {
            // ignore JSON parse error
        }
        return [trimmed]
    }
    return [value]
}

const buildSelectProjectMap = (rows) => {
    const perUidValues = new Map()
    for (const row of rows || []) {
        if (row?.field_title !== SELECT_PROJECT_FIELD_TITLE) continue
        const uid = row?.development_uid
        if (!uid) continue
        const contents = parseJsonArrayContent(row?.content)
        if (!contents.length) continue
        if (!perUidValues.has(uid)) perUidValues.set(uid, new Set())
        const valueSet = perUidValues.get(uid)
        for (const item of contents) {
            const normalized = typeof item === 'string' ? item.trim() : `${item}`.trim()
            if (normalized) {
                valueSet.add(normalized)
            }
        }
    }

    const result = new Map()
    for (const [uid, valueSet] of perUidValues.entries()) {
        if (!valueSet.size) continue
        result.set(uid, JSON.stringify(Array.from(valueSet)))
    }
    return result
}

const buildOrderQuantityMap = (rows) => {
    const perUidEntries = new Map()
    for (const row of rows || []) {
        const uid = row?.development_uid
        if (!uid) continue
        const entries = parseJsonArrayContent(row?.content)
        if (!entries.length) continue
        if (!perUidEntries.has(uid)) perUidEntries.set(uid, [])
        perUidEntries.get(uid).push(...entries)
    }

    const result = new Map()
    for (const [uid, entries] of perUidEntries.entries()) {
        const normalizedEntries = []
        const seen = new Set()
        for (const entry of entries) {
            let normalized = entry
            if (typeof entry === 'string') {
                const trimmed = entry.trim()
                if (!trimmed) continue
                try {
                    normalized = JSON.parse(trimmed)
                } catch (err) {
                    normalized = trimmed
                }
            }

            if (normalized === null || normalized === undefined) continue
            const keyPrefix = typeof normalized === 'string' ? 'str' : 'obj'
            let keyValue = normalized
            if (keyPrefix === 'obj') {
                try {
                    keyValue = JSON.stringify(normalized)
                } catch (err) {
                    keyValue = null
                }
            }
            const dedupeKey = keyValue !== null && keyValue !== undefined ? `${keyPrefix}:${keyValue}` : null
            if (dedupeKey && seen.has(dedupeKey)) continue
            if (dedupeKey) seen.add(dedupeKey)
            normalizedEntries.push(normalized)
        }

        if (normalizedEntries.length) {
            result.set(uid, JSON.stringify(normalizedEntries))
        }
    }
    return result
}

const normalizeOrderTypeContent = (value) => {
    if (value === null || value === undefined) return ''
    if (typeof value === 'string') return value.trim()
    return `${value}`.trim()
}

const buildOrderTypeFieldMap = (rows) => {
    const map = new Map()
    for (const row of rows || []) {
        const uid = row?.development_uid
        const processId = row?.process_id
        if (!uid || !processId) continue
        const content = normalizeOrderTypeContent(row?.content)
        if (!map.has(uid)) map.set(uid, [])
        map.get(uid).push({ processId, content })
    }
    return map
}

const resolveOrderTypeValue = (entries) => {
    if (!entries?.length) return null
    const filtered = entries.filter(({ content }) => content)
    if (!filtered.length) return null
    const [first] = filtered
    const hasMismatch = filtered.some(({ content }) => content !== first.content)
    if (!hasMismatch) {
        return first.content
    }
    return filtered
        .map(({ processId, content }) => `${processId}:${content}`)
        .join(';')
}

const PLATFORM_IS_JD_TRUE_VALUES = new Set(['是', 'true', 'TRUE', '1', 1, 'yes', 'YES'])
const PLATFORM_IS_JD_FALSE_VALUES = new Set(['否', 'false', 'FALSE', '0', 0, 'no', 'NO'])

const normalizePlatformIsJdValue = (value) => {
    if (value === null || value === undefined) return null
    const trimmed = `${value}`.trim()
    if (!trimmed || trimmed === '-' || trimmed === '无') return null
    if (PLATFORM_IS_JD_TRUE_VALUES.has(trimmed)) return true
    if (PLATFORM_IS_JD_FALSE_VALUES.has(trimmed)) return false
    return null
}

const normalizeNonEmptyStringContent = (value) => {
    if (value === null || value === undefined) return null
    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed || trimmed === '-' || trimmed === '无') return null
        return trimmed
    }
    const normalized = `${value}`.trim()
    return normalized ? normalized : null
}

const mergeDistinctStrings = (values) => {
    const filtered = []
    for (const value of values || []) {
        if (!value) continue
        if (!filtered.includes(value)) filtered.push(value)
    }
    if (!filtered.length) return null
    if (filtered.length === 1) return filtered[0]
    return filtered.join(';')
}

const buildVisionTypeFieldMap = (rows) => {
    const perUidProcesses = new Map()
    for (const row of rows || []) {
        const uid = row?.development_uid
        const processId = row?.process_id
        const title = row?.field_title
        if (!uid || !processId || !title) continue
        if (!perUidProcesses.has(uid)) perUidProcesses.set(uid, new Map())
        const processMap = perUidProcesses.get(uid)
        if (!processMap.has(processId)) processMap.set(processId, {})
        const entry = processMap.get(processId)
        if (title === PLATFORM_IS_JD_FIELD_TITLE) {
            entry.platform = row?.content
        } else if (title === VISION_TYPE_FIELD_TITLE) {
            entry.vision = row?.content
        }
    }

    const result = new Map()
    for (const [uid, processMap] of perUidProcesses.entries()) {
        const jdValues = []
        const normalValues = []
        for (const entry of processMap.values()) {
            const normalizedVision = normalizeNonEmptyStringContent(entry.vision)
            if (!normalizedVision) continue
            const isJd = normalizePlatformIsJdValue(entry.platform)
            if (isJd === true) {
                jdValues.push(normalizedVision)
            } else {
                normalValues.push(normalizedVision)
            }
        }
        const jdValue = mergeDistinctStrings(jdValues)
        const normalValue = mergeDistinctStrings(normalValues)
        if (jdValue !== null || normalValue !== null) {
            result.set(uid, { jd: jdValue, normal: normalValue })
        }
    }
    return result
}

const buildHotPlanOperatorMap = (rows) => {
    const perUidProcesses = new Map()
    for (const row of rows || []) {
        const uid = row?.development_uid
        const processId = row?.process_id
        const title = row?.field_title
        if (!uid || !processId || !title) continue
        if (!perUidProcesses.has(uid)) perUidProcesses.set(uid, new Map())
        const processMap = perUidProcesses.get(uid)
        if (!processMap.has(processId)) processMap.set(processId, {})
        const entry = processMap.get(processId)
        if (title === PLATFORM_IS_JD_FIELD_TITLE) {
            entry.platform = row?.content
        } else if (title === HOT_PLAN_OPERATOR_FIELD_TITLE) {
            entry.operator = row?.content
        }
    }

    const result = new Map()
    for (const [uid, processMap] of perUidProcesses.entries()) {
        const jdValues = []
        const normalValues = []
        for (const entry of processMap.values()) {
            const normalizedOperator = normalizeNonEmptyStringContent(entry.operator)
            if (!normalizedOperator) continue
            const isJd = normalizePlatformIsJdValue(entry.platform)
            if (isJd === true) {
                jdValues.push(normalizedOperator)
            } else {
                normalValues.push(normalizedOperator)
            }
        }
        const jdValue = mergeDistinctStrings(jdValues)
        const normalValue = mergeDistinctStrings(normalValues)
        if (jdValue !== null || normalValue !== null) {
            result.set(uid, { jd: jdValue, normal: normalValue })
        }
    }
    return result
}

const formatGoodsIdGroupValue = (groupKey, platformMap) => {
    if (!platformMap || !(platformMap instanceof Map) || platformMap.size === 0) return null
    const orderedPlatforms = GOODS_ID_GROUP_PLATFORM_ORDER[groupKey] || []
    const entries = []
    const used = new Set()

    for (const platform of orderedPlatforms) {
        if (platformMap.has(platform)) {
            entries.push(`${platform}:${platformMap.get(platform)};`)
            used.add(platform)
        }
    }

    for (const [platform, value] of platformMap.entries()) {
        if (used.has(platform)) continue
        entries.push(`${platform}:${value};`)
    }

    return entries.length ? entries.join('') : null
}

const buildShelfGoodsIdAssignments = (rows) => {
    const perUidGroups = new Map()

    for (const row of rows || []) {
        const uid = row?.development_uid
        const title = row?.field_title
        if (!uid || !title) continue
        const config = GOODS_ID_FIELD_CONFIG_MAP[title]
        if (!config) continue
        const normalizedContent = normalizeNonEmptyStringContent(row?.content)
        if (!normalizedContent) continue
        if (!perUidGroups.has(uid)) perUidGroups.set(uid, {})
        const groups = perUidGroups.get(uid)
        if (!groups[config.group]) groups[config.group] = new Map()
        groups[config.group].set(config.platform, normalizedContent)
    }

    const result = new Map()
    for (const [uid, groups] of perUidGroups.entries()) {
        const assignment = {}
        for (const [groupKey, column] of Object.entries(GOODS_ID_GROUP_TO_COLUMN)) {
            const formatted = formatGoodsIdGroupValue(groupKey, groups[groupKey])
            if (formatted !== null) {
                assignment[column] = formatted
            }
        }
        if (Object.keys(assignment).length) {
            result.set(uid, assignment)
        }
    }

    return result
}

const getLatestModifiedProcess = async () => {
    return await processRepo.getLatestModifiedProcess();
}

const saveProcess = async (process) => {
    return await processRepo.saveProcess(process)
}

/**
 * 将流程表中data和overallprocessflow为字符串的数据改为json
 * @returns {Promise<void>}
 */
const correctStrFieldToJson = async () => {
    return await processRepo.correctStrFieldToJson()
}

const getProcessByProcessInstanceId = async (processInstanceId) => {
    return await processRepo.getProcessByProcessInstanceId(processInstanceId)
}
//查询采购任务统计
const getProcurementProcessStatistics = async (startDate, endDate) => {
    const result = await processRepo.getProcurementProcessStatistics(startDate, endDate);
    //获取创建数量和进行中数量
    if (result && result.length > 0) {
        for (const item of result) {
            let createNumber = {
                numberTmp: await processRepo.getProcurementProcessTmpCreateNumber(item.nickname, startDate, endDate),
                number: await processRepo.getProcurementProcessCreateNumber(item.nickname, startDate, endDate)
            };
            item.createNmuber = createNumber;
            item.conductNumber = await processRepo.getProcurementProcessConductNumber(item.nickname, startDate, endDate);
        }
    }
    return result;
}
//查询已完成的流程id
const getProcessIdsData = async (dateType, nickname, startDate, endDate, isSelect) => {
    const isName = nickname !== undefined && nickname != null ? 'pd.field_value LIKE "%' + nickname + '%"' : "1=1";
    // 1查询创建时间 2查询完成时间
    const date = dateType === 1 ? "a.create_time" : "a.done_time";
    const fieldValue = isSelect !== undefined ? "WHERE pd.field_value = '"+isSelect+"'":"";
    if(fieldValue != null){
        return await processRepo.getProcessIdsData2(date, startDate, endDate,fieldValue, isName)
    }else{
        return await processRepo.getProcessIdsData(date, startDate, endDate, isName)
    }
}
//查询进行中的流程id
const getProcessIdsTmpData = async (dateType, nickname, startDate, endDate, isSelect) => {
    const isName = nickname !== undefined && nickname != null ? 'pd.field_value LIKE "%' + nickname + '%"' : "1=1";
    // 1查询创建时间 2查询完成时间
    const date = dateType === 1 ? "a.create_time between '"+startDate+"' and '"+endDate+"' and" : "";
    return await processRepo.getProcessIdsTmpData(date, startDate, endDate, isName)
}
const getProcessMergeIdsData = async (dateType, nickname, startDate, endDate, isSelect) => {
    const number = await getProcessIdsTmpData(dateType, nickname, startDate, endDate);
    const numberTmp = await getProcessIdsData(dateType, nickname, startDate, endDate);
    if(numberTmp.length>0){
        numberTmp.forEach(item=>{
            number.push(item)
        })
    }
    return number;
}

const getDevelopmentProcessTotal = async (type, startDate, endDate) => {
    return await developmentTotalService.getDevelopmentProcessTotal(type, startDate, endDate)
}

const getDevelopmentProcessList = async (
	type,
	field,
	startDate,
	endDate,
	statuses
) => {
	return await developmentListService.getDevelopmentProcessList(
		type,
		field,
		startDate,
		endDate,
		statuses
	)
}

const robotStartProcess = async (name, key, variables) => {
    let processDefinitionId = await actReProcdefRepo.getProcessDefinitionId(name, key)
    let token = await credentialsReq.getBpmgAccessToken()
    let response = commonReq.createJDProcess(269, processDefinitionId, variables, token.data.accessToken)
    if (response.code != 0) logger.error(`触发${name}失败: ${JSON.stringify(variables)}`)
}

const createDevelopmentProcess = async (params, dingding_id) => {
	// 拿到bi的用户信息
	const user = await userRepo.getUserWithDeptByDingdingUserId(dingding_id)
	const bpmStarter = await systemUsersRepo.getID(user.nickname)
	const bpmStarterId = bpmStarter?.[0]?.id
	let process_status = null,
		jd_process_status = null,
		check = false,
		analysis = false,
		jdAnalysis = false,
		checkVariables = {},
		analysisVariables = {},
		jdAnalysisVariables = {}
	const appendBpmStarter = (variables) => {
		if (bpmStarterId) variables["Cfid3e1nprsop"] = bpmStarterId
	}
	switch (params.type) {
		case processConst.typeList.SUPPLIER:
			process_status = processConst.statusList.DEVELOPMENT_REVIEW
			jd_process_status = processConst.statusList.DEVELOPMENT_REVIEW
			params["is_jd"] = processConst.jdStatusList.FALSE
			check = true
			checkVariables = JSON.parse(
				JSON.stringify(
					processConst.developCheckProcess.template.SUPPLIER
				)
			)
			break
		case processConst.typeList.OPERATOR:
			check = true
			params["project"] = departmentService.getProjectInfo(user.dept_name)
			if (user.dept_name.indexOf("京东") != -1) {
				jd_process_status = processConst.statusList.DEVELOPMENT_REVIEW
				params["is_jd"] = processConst.jdStatusList.TRUE
			} else {
				process_status = processConst.statusList.DEVELOPMENT_REVIEW
				params["is_jd"] = processConst.jdStatusList.FALSE
			}
			checkVariables = JSON.parse(
				JSON.stringify(
					processConst.developCheckProcess.template.OPERATOR
				)
			)
			break
		case processConst.typeList.IP:
			if (params.develop_type == "京东专供") {
				jd_process_status = processConst.statusList.ANALYSIS
				jdAnalysis = true
				jdAnalysisVariables = JSON.parse(
					JSON.stringify(processConst.jdAnalysisProcess.template.IP)
				)
			} else if (
				["拼多多专供", "天猫专供"].includes(params.develop_type)
			) {
				process_status = processConst.statusList.ANALYSIS
				analysis = true
				analysisVariables = JSON.parse(
					JSON.stringify(processConst.analysisProcess.template.IP)
				)
			} else {
				process_status = processConst.statusList.ANALYSIS
				analysis = true
				analysisVariables = JSON.parse(
					JSON.stringify(processConst.analysisProcess.template.IP)
				)
			}
			break
		case processConst.typeList.SELF:
			process_status = processConst.statusList.ANALYSIS
			jd_process_status = processConst.statusList.ANALYSIS
			jdAnalysis = true
			jdAnalysisVariables = JSON.parse(
				JSON.stringify(processConst.jdAnalysisProcess.template.SELF)
			)
			analysis = true
			analysisVariables = JSON.parse(
				JSON.stringify(processConst.analysisProcess.template.SELF)
			)
			if (params.dept == "运营")
				params["project"] = departmentService.getProjectInfo(
					user.dept_name
				)
			break
		default:
	}
	const uid = v4()
	params.categories = params.categories
		? JSON.stringify(params.categories)
		: null
	params.product_info = params.product_info
		? JSON.stringify(params.product_info)
		: null
	params.analysis = params.analysis ? JSON.stringify(params.analysis) : null
	params.image = params.image?.length ? JSON.stringify(params.image) : ""

	let result = await developmentProcessesRepo.insert([
		uid,
		user.nickname,
		user.dept_name,
		params.type,
		params.name,
		params.categories,
		params.seasons,
		params.related,
		params.image,
		params.brief_name,
		params.purchase_type,
		params.supplier,
		params.supplier_type,
		params.product_info,
		params.product_type,
		params.patent_belongs,
		params.patent_type,
		params.sale_purpose,
		params.analysis,
		params.develop_type,
		params.analysis_name,
		params.project_type,
		params.design_type,
		params.exploitation_features,
		params.core_reasons,
		params.scheduler_arrived_time,
		params.scheduler_confirm_time,
		params.is_self,
		process_status,
		jd_process_status,
	])

	let running_node = []
	params["uid"] = uid
	params["link"] = processConst.previousUrl + uid
	params["start_time"] = moment().format("YYYY-MM-DD")
	//bi往bpm发起流程需要进行地址转换
	params.image = params.image
		? params.image.replace(
				"https://minio.pakchoice.cn:9003",
				"http://bpm.pakchoice.cn:9000"
			)
		: ""
	params.image = JSON.parse(params.image).join(",")
	let starter = await systemUsersRepo.getID(user.nickname)
	if (starter?.length) params["starter"] = starter[0].id
	if (result) {
		if (check) {
			let variables = {}
			for (let i = 0; i < checkVariables.length; i++) {
				variables[checkVariables[i].key] =
					checkVariables[i].type == "array"
						? [params[checkVariables[i].name]]
						: params[checkVariables[i].name]
			}
			appendBpmStarter(variables)
			robotStartProcess(
				processConst.developCheckProcess.name,
				processConst.developCheckProcess.key,
				variables
			)
			running_node.push(processConst.developCheckProcess.name)
		}
		//非京东分析
		if (analysis) {
			let variables = {}
			for (let i = 0; i < analysisVariables.length; i++) {
				variables[analysisVariables[i].key] =
					analysisVariables[i].type == "array"
						? [params[analysisVariables[i].name]]
						: params[analysisVariables[i].name]
			}
			appendBpmStarter(variables)
			robotStartProcess(
				processConst.analysisProcess.name,
				processConst.analysisProcess.key,
				variables
			)
			running_node.push(processConst.developCheckProcess.name)
		}
		//京东分析流程
		if (jdAnalysis) {
			let variables = {}
			for (let i = 0; i < jdAnalysisVariables.length; i++) {
				variables[jdAnalysisVariables[i].key] =
					jdAnalysisVariables[i].type == "array"
						? [params[jdAnalysisVariables[i].name]]
						: params[jdAnalysisVariables[i].name]
			}
			appendBpmStarter(variables)
			robotStartProcess(
				processConst.jdAnalysisProcess.name,
				processConst.jdAnalysisProcess.key,
				variables
			)
			running_node.push(processConst.jdAnalysisProcess.name)
		}

		developmentProcessesRepo.updateColumnByUid(
			uid,
			"running_node",
			running_node.join(",")
		)

		const processId =
			await processInfoRepo.getDevelopmentProcessesInstanceidByUid(uid)
		if (processId == "") return

		const taskResult =
			processTasksRepo.getRunningTasksByProcessId(processId)
		if (!taskResult?.length) {
			developmentProcessesRepo.updateColumnByUid(
				uid,
				"running_node",
				running_node.join(",") + "->已结束"
			)
			return
		}
		let processDetailDesc =
			taskResult[0].title + "|" + taskResult[0].username + "|待审核"
		developmentProcessesRepo.updateColumnByUid(
			uid,
			"running_node",
			running_node.join(",") + "->" + processDetailDesc
		)
	}
}

const updateDevelopmetProcess = async () => {
    //get total running process
    let process = await developmentProcessesRepo.getRunningProcess()
    for (let i = 0; i < process.length; i++) {
        if (!process[i].status) {
            let process_ids = [], process_status = []
            if (process[i].status.indexOf(processConst.statusList.DEVELOPMENT_CHECK) != -1) {
                let instance = await processesRepo.getProcessByUidAndColumn(
                    process[i].uid, 
                    processConst.developCheckProcess.key, 
                    processConst.developCheckProcess.column.is_jd,
                    processConst.jdStatusList.FALSE)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        if ([processConst.typeList.IP, processConst.typeList.SELF].includes(process[i].type)) {
                            // IP、自研触发寄样
                            let sampleInstance = await processesRepo.getProcessByUidAndColumn(
                                process[i].uid, 
                                processConst.sampleProcess.key,
                                processConst.sampleProcess.template.is_jd,
                                processConst.jdStatusList.FALSE)
                            if (!sampleInstance?.length) {
                                let variables = {}, user_id, developer_id
                                let starter = await systemUsersRepo.getID(process[i].starter)
                                if (starter?.length) user_id = starter[0].id
                                if (process[i].developer) {
                                    let developer = await systemUsersRepo.getID(process[i].developer)
                                    if (developer?.length) developer_id = developer[0].id
                                } else {
                                    // 更新开发人
                                    let user = await processInfoRepo.getByProcessIdAndField(
                                        instance[0].process_id, processConst.developCheckProcess.column.developer.DEFAULT
                                    )
                                    process[i].developer = user.content
                                    developmentProcessesRepo.updateColumnByUid(process[i].uid, 'developer', user.content)
                                    let developer = await systemUsersRepo.getID(user.content)
                                    if (developer?.length) developer_id = developer[0].id
                                }
                                variables[processConst.sampleProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.sampleProcess.template.uid] = process[i].uid
                                variables[processConst.sampleProcess.template.is_jd] = processConst.jdStatusList.FALSE
                                variables[processConst.sampleProcess.template.starter] = user_id
                                variables[processConst.sampleProcess.template.type] = process[i].type
                                if (process[i].type == processConst.typeList.IP) 
                                    variables[processConst.sampleProcess.template.project] = process[i].project
                                variables[processConst.sampleProcess.template.product_info] = JSON.parse(process[i].product_info)
                                variables[processConst.sampleProcess.template.developer] = developer_id
                                robotStartProcess(processConst.sampleProcess.name, processConst.sampleProcess.key, variables)
                                process_status.push(processConst.statusList.SAMPLE)
                            }
                        } else if (process[i].type == processConst.typeList.SUPPLIER) {
                            // 正推触发非京东分析，寄样
                            let analysisInstance = await processesRepo.getProcessByUid(
                                process[i].uid, 
                                processConst.analysisProcess.key)
                            if (!analysisInstance?.length) {
                                let analysisVariables = JSON.parse(JSON.stringify(processConst.analysisProcess.template.SUPPLIER))
                                let variables = {}
                                for (let j = 0; j < analysisVariables.length; j++) {
                                    variables[analysisVariables[j].key] = analysisVariables[j].type == 'array' ? 
                                        [process[i][analysisVariables[j].name]] : process[i][analysisVariables[j].name]
                                }
                                robotStartProcess(processConst.analysisProcess.name, processConst.analysisProcess.key, variables)
                                process_status.push(processConst.statusList.ANALYSIS)
                            }
                            let sampleInstance = await processesRepo.getProcessByUidAndColumn(
                                process[i].uid, 
                                processConst.sampleProcess.key,
                                processConst.sampleProcess.template.is_jd,
                                processConst.jdStatusList.FALSE)
                            if (!sampleInstance?.length) {
                                let variables = {}, user_id, developer_id
                                let starter = await systemUsersRepo.getID(process[i].starter)
                                if (starter?.length) user_id = starter[0].id
                                if (process[i].developer) {
                                    let developer = await systemUsersRepo.getID(process[i].developer)
                                    if (developer?.length) developer_id = developer[0].id
                                } else {
                                    // 更新开发人
                                    let user = await processInfoRepo.getByProcessIdAndField(
                                        instance[0].process_id, processConst.developCheckProcess.column.developer.DEFAULT
                                    )
                                    process[i].developer = user.content
                                    developmentProcessesRepo.updateColumnByUid(process[i].uid, 'developer', user.content)
                                    let developer = await systemUsersRepo.getID(user.content)
                                    if (developer?.length) developer_id = developer[0].id
                                }
                                variables[processConst.sampleProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.sampleProcess.template.uid] = process[i].uid
                                variables[processConst.sampleProcess.template.is_jd] = processConst.jdStatusList.FALSE
                                variables[processConst.sampleProcess.template.starter] = user_id
                                variables[processConst.sampleProcess.template.type] = process[i].type
                                variables[processConst.sampleProcess.template.developer] = developer_id
                                robotStartProcess(processConst.sampleProcess.name, processConst.sampleProcess.key, variables)
                                process_status.push(processConst.statusList.SAMPLE)
                            }
                        } else {
                            // 反推触发非京东分析
                            if (!process[i].developer) {
                                let user
                                for (let j = 0; j < processConst.developCheckProcess.column.developer.OTHER.length; j++) {
                                    user = await processInfoRepo.getByProcessIdAndField(
                                        instance[0].process_id, processConst.developCheckProcess.column.developer.OTHER[j])
                                    if (user) break
                                }
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'developer', user.content)
                            }
                            let analysisInstance = await processesRepo.getProcessByUid(
                                process[i].uid, 
                                processConst.analysisProcess.key)
                            if (!analysisInstance?.length) {
                                let analysisVariables = JSON.parse(JSON.stringify(processConst.analysisProcess.template.OPERATOR))
                                let variables = {}
                                for (let j = 0; j < analysisVariables.length; j++) {
                                    variables[analysisVariables[j].key] = analysisVariables[j].type == 'array' ? 
                                        [process[i][analysisVariables[j].name]] : process[i][analysisVariables[j].name]
                                }
                                robotStartProcess(processConst.analysisProcess.name, processConst.analysisProcess.key, variables)
                                process_status.push(processConst.statusList.ANALYSIS)
                            }
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.DEVELOPMENT_CHECK)
                    }
                } else logger.error(`开发审核流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.SAMPLE) != -1) {
                let instance = await processesRepo.getProcessByUidAndColumn(
                    process[i].uid, 
                    processConst.sampleProcess.key,
                    processConst.sampleProcess.template.is_jd,
                    processConst.jdStatusList.FALSE)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        // 更新样品图片、草图
                        if (!process[i].sample_image) {
                            let image = await processInfoRepo.getByProcessIdAndField(
                                instance[0].process_id, processConst.sampleProcess.column.sample_image)
                            if (image) developmentProcessesRepo.updateColumnByUid(process[i].uid, 'sample_image', image.content)
                        }
                        if (!process[i].design_image) {
                            let image = await processInfoRepo.getByProcessIdAndField(
                                instance[0].process_id, processConst.sampleProcess.column.design_image)
                            if (image) developmentProcessesRepo.updateColumnByUid(process[i].uid, 'design_image', image.content)
                        }
                        if (process[i].type == processConst.typeList.OPERATOR) {                            
                            // 反推寄样通过触发样品选中
                            let analysisInstance = await processesRepo.getProcessByUid(
                                process[i].uid, 
                                processConst.analysisProcess.key)
                            if (analysisInstance?.length) {
                                let first = await processInfoRepo.getByProcessIdAndField(
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.first_operator)
                                let second = await processInfoRepo.getByProcessIdAndField(
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.second_operator)
                                let third = await processInfoRepo.getByProcessIdAndField(
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.third_operator)
                                let variables = {}
                                variables[processConst.sampleCheckProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.sampleCheckProcess.template.uid] = process[i].uid
                                variables[processConst.sampleCheckProcess.template.is_jd] = processConst.jdStatusList.FALSE
                                variables[processConst.sampleCheckProcess.template.first_operator] = first?.content
                                variables[processConst.sampleCheckProcess.template.second_operator] = second?.content
                                variables[processConst.sampleCheckProcess.template.third_operator] = third?.content
                                robotStartProcess(processConst.sampleCheckProcess.name, processConst.sampleCheckProcess.key, variables)
                                process_status.push(processConst.statusList.SAMPLE_CHECK)
                            }
                        } else if ([processConst.typeList.IP, processConst.typeList.SELF].includes(process[i].type)) {
                            // IP,自研审核通过触发企划审核
                            let reviewVarables = JSON.parse(JSON.stringify(processConst.reviewProcess.template.SUPPLIER))
                            let variables = {}
                            process['link'] = processConst.previousUrl + process[i].uid
                            process['start_time'] = moment(process[i].create_time).format('YYYY-MM-DD')
                            process['is_jd'] = processConst.jdStatusList.FALSE
                            for (let j = 0; j < reviewVarables.length; j++) {
                                variables[reviewVarables[j].key] = reviewVarables[j].type == 'array' ? 
                                    [process[i][reviewVarables[j].name]] : process[i][reviewVarables[j].name]
                            }
                            robotStartProcess(processConst.reviewProcess.name, processConst.reviewProcess.key, variables)
                            process_status.push(processConst.statusList.REVIEW)
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.SAMPLE)
                    }
                } else logger.error(`寄样流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.ANALYSIS) != -1) {
                let instance = await processesRepo.getProcessByUid(
                    process[i].uid, 
                    processConst.analysisProcess.key)
                if (instance?.length) {
                    if (process[i].type == processConst.typeList.IP && 
                        !['拼多多专供', '天猫专供'].includes(process[i].develop_type) && 
                        instance[0].status == 1) {
                        // 非京东分析负责人审核通过触发京东分析
                        let tasks = await processTasksRepo.getSuccessTasksByProcessIdAndTitle(
                            instance[0].process_id,
                            '事业一部负责人审核","事业二部负责人审核","事业三部负责人审核')
                        let jdInstance = await processesRepo.getProcessByUid(
                            process[i].uid,
                            processConst.jdAnalysisProcess.key)
                        if (tasks?.length && !jdInstance.length) {                            
                            let jdAnalysisVariables = JSON.parse(JSON.stringify(processConst.jdAnalysisProcess.template.IP))
                            let variables = {}
                            process['link'] = processConst.previousUrl + process[i].uid
                            process['start_time'] = moment(process[i].create_time).format('YYYY-MM-DD')
                            for (let j = 0; j < jdAnalysisVariables.length; j++) {
                                variables[jdAnalysisVariables[j].key] = jdAnalysisVariables[j].type == 'array' ? 
                                    [process[i][jdAnalysisVariables[j].name]] : process[i][jdAnalysisVariables[j].name]
                            }
                            robotStartProcess(processConst.jdAnalysisProcess.name, processConst.jdAnalysisProcess.key, variables)
                            process_status.push(processConst.statusList.ANALYSIS)
                        }
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.ANALYSIS)
                    } else if (instance[0].status == 2) {
                        if ([processConst.typeList.IP, processConst.typeList.SELF].includes(process[i].type)) {
                            // IP、自研非京东分析通过触发开发审核，更新spu,sku_code
                            let developCheckInstance = await processesRepo.getProcessByUidAndColumn(
                                process[i].uid, 
                                processConst.developCheckProcess.key,
                                processConst.developCheckProcess.column.is_jd,
                                processConst.jdStatusList.FALSE)
                            if (!developCheckInstance?.length) {
                                let developCheckVarables = process[i].type == processConst.typeList.IP ? 
                                    JSON.parse(JSON.stringify(processConst.developCheckProcess.template.IP)) : 
                                    JSON.parse(JSON.stringify(processConst.developCheckProcess.template.SELF))
                                let variables = {}
                                process['link'] = processConst.previousUrl + process[i].uid
                                process['start_time'] = moment(process[i].create_time).format('YYYY-MM-DD')
                                process['is_jd'] = processConst.jdStatusList.FALSE
                                for (let j = 0; j < developCheckVarables.length; j++) {
                                    variables[developCheckVarables[j].key] = developCheckVarables[j].type == 'array' ? 
                                        [process[i][developCheckVarables[j].name]] : process[i][developCheckVarables[j].name]
                                }
                                robotStartProcess(processConst.developCheckProcess.name, processConst.developCheckProcess.key, variables)
                                process_status.push(processConst.statusList.DEVELOPMENT_CHECK)
                                let spu = await processInfoRepo.getByProcessIdAndField(
                                    instance[0].process_id, processConst.analysisProcess.column.spu)
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'spu', spu.content)
                                let sku_code = await processInfoRepo.getByProcessIdAndField(
                                    instance[0].process_id, processConst.analysisProcess.column.sku_code)
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'sku_code', sku_code.content)
                            }
                        } else if (process[i].type == processConst.typeList.SUPPLIER) {
                            // 正推非京东分析选中触发企划审核，更新spu,sku_code
                            let reviewInstance = await processesRepo.getProcessByUidAndColumn(
                                process[i].uid, 
                                processConst.reviewProcess.key,
                                processConst.reviewProcess.column.is_jd,
                                processConst.jdStatusList.FALSE)
                            if (!reviewInstance?.length) {
                                let is_select = false
                                let first = await processInfoRepo.getByProcessIdAndField(
                                    instance[0].process_id, processConst.analysisProcess.column.first_select)
                                if (first?.content == processConst.analysisStatusList.TRUE) is_select = true
                                else {
                                    let second = await processInfoRepo.getByProcessIdAndField(
                                        instance[0].process_id, processConst.analysisProcess.column.second_select)
                                    if (second?.content == processConst.analysisStatusList.TRUE) is_select = true
                                    else {
                                        let third = await processInfoRepo.getByProcessIdAndField(
                                            instance[0].process_id, processConst.analysisProcess.column.third_select)
                                        if (third?.content == processConst.analysisStatusList.TRUE) is_select = true
                                    }
                                }
                                if (is_select) {
                                    let reviewVarables = JSON.parse(JSON.stringify(processConst.reviewProcess.template.SUPPLIER))
                                    let variables = {}
                                    process['link'] = processConst.previousUrl + process[i].uid
                                    process['start_time'] = moment(process[i].create_time).format('YYYY-MM-DD')
                                    process['is_jd'] = processConst.jdStatusList.FALSE
                                    for (let j = 0; j < reviewVarables.length; j++) {
                                        variables[reviewVarables[j].key] = reviewVarables[j].type == 'array' ? 
                                            [process[i][reviewVarables[j].name]] : process[i][reviewVarables[j].name]
                                    }
                                    robotStartProcess(processConst.reviewProcess.name, processConst.reviewProcess.key, variables)
                                    process_status.push(processConst.statusList.REVIEW)
                                    let spu = await processInfoRepo.getByProcessIdAndField(
                                        instance[0].process_id, processConst.analysisProcess.column.spu)
                                    developmentProcessesRepo.updateColumnByUid(process[i].uid, 'spu', spu.content)
                                    let sku_code = await processInfoRepo.getByProcessIdAndField(
                                        instance[0].process_id, processConst.analysisProcess.column.sku_code)
                                    developmentProcessesRepo.updateColumnByUid(process[i].uid, 'sku_code', sku_code.content)
                                }
                            }
                        } else {
                            // 反推非京东分析通过触发寄样
                            let sampleInstance = await processesRepo.getProcessByUidAndColumn(
                                process[i].uid, 
                                processConst.sampleProcess.key,
                                processConst.sampleProcess.template.is_jd,
                                processConst.jdStatusList.FALSE)
                            if (!sampleInstance?.length) {
                                let variables = {}, user_id, developer_id
                                let starter = await systemUsersRepo.getID(process[i].starter)
                                if (starter?.length) user_id = starter[0].id
                                let developer = await systemUsersRepo.getID(process[i].developer)
                                if (developer?.length) developer_id = developer[0].id
                                variables[processConst.sampleProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.sampleProcess.template.uid] = process[i].uid
                                variables[processConst.sampleProcess.template.is_jd] = processConst.jdStatusList.FALSE
                                variables[processConst.sampleProcess.template.starter] = user_id
                                variables[processConst.sampleProcess.template.type] = process[i].type
                                variables[processConst.sampleProcess.template.developer] = developer_id
                                robotStartProcess(processConst.sampleProcess.name, processConst.sampleProcess.key, variables)
                                process_status.push(processConst.statusList.SAMPLE)
                            }
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.ANALYSIS)
                    }
                } else logger.error(`非京东分析流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.SAMPLE_CHECK) != -1) {
                // 反推样品选中触发企划审核，更新spu,sku_code
                let instance = await processesRepo.getProcessByUidAndColumn(
                    process[i].uid, 
                    processConst.sampleCheckProcess.key,
                    processConst.sampleCheckProcess.template.is_jd,
                    processConst.jdStatusList.FALSE)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        let reviewInstance = await processesRepo.getProcessByUidAndColumn(
                            process[i].uid, 
                            processConst.reviewProcess.key,
                            processConst.reviewProcess.column.is_jd,
                            processConst.jdStatusList.FALSE)
                        if (!reviewInstance?.length) {
                            let is_select = false
                            let analysisInstance = await processesRepo.getProcessByUid(
                                process[i].uid, 
                                processConst.analysisProcess.key)
                            if (analysisInstance?.length) {
                                let first = await processInfoRepo.getByProcessIdAndField(
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.first_select)
                                if (first?.content == processConst.analysisStatusList.TRUE) is_select = true
                                else {
                                    let second = await processInfoRepo.getByProcessIdAndField(
                                        analysisInstance[0].process_id, processConst.analysisProcess.column.second_select)
                                    if (second?.content == processConst.analysisStatusList.TRUE) is_select = true
                                    else {
                                        let third = await processInfoRepo.getByProcessIdAndField(
                                            analysisInstance[0].process_id, processConst.analysisProcess.column.third_select)
                                        if (third?.content == processConst.analysisStatusList.TRUE) is_select = true
                                    }
                                }
                            }
                            if (is_select) {
                                let reviewVarables = JSON.parse(JSON.stringify(processConst.reviewProcess.template.SUPPLIER))
                                let variables = {}
                                process['link'] = processConst.previousUrl + process[i].uid
                                process['start_time'] = moment(process[i].create_time).format('YYYY-MM-DD')
                                process['is_jd'] = processConst.jdStatusList.FALSE
                                for (let j = 0; j < reviewVarables.length; j++) {
                                    variables[reviewVarables[j].key] = reviewVarables[j].type == 'array' ? 
                                        [process[i][reviewVarables[j].name]] : process[i][reviewVarables[j].name]
                                }
                                robotStartProcess(processConst.reviewProcess.name, processConst.reviewProcess.key, variables)
                                process_status.push(processConst.statusList.REVIEW)
                                let analysisInstance = await processesRepo.getProcessByUid(
                                    process[i].uid, 
                                    processConst.analysisProcess.key)
                                let spu = await processInfoRepo.getByProcessIdAndField(
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.spu)
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'spu', spu.content)
                                let sku_code = await processInfoRepo.getByProcessIdAndField(
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.sku_code)
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'sku_code', sku_code.content)
                            }
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.SAMPLE_CHECK)
                    }
                } else logger.error(`样品选中流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.REVIEW) != -1) {
                // 更新选中平台，事业1部是否选中，事业2部是否选中，事业3部是否选中，非京东是否选中，采购方式, 视觉类型
                let instance = await processesRepo.getProcessByUidAndColumn(
                    process[i].uid, 
                    processConst.reviewProcess.key,
                    processConst.reviewProcess.column.is_jd,
                    processConst.jdStatusList.FALSE)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        let select = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.reviewProcess.column.select_project)                        
                        let first_select = processConst.analysisStatusList.FALSE, 
                            second_select = processConst.analysisStatusList.FALSE, 
                            third_select = processConst.analysisStatusList.FALSE,
                            is_select = processConst.analysisStatusList.FALSE
                        if (select) {
                            if (select.content.indexOf('拼多多') != -1 || 
                                select.content.indexOf('天猫超市') != -1 || 
                                select.content.indexOf('Coupang') != -1) {
                                first_select = processConst.analysisStatusList.TRUE
                            }
                            if (select.content.indexOf('抖音') != -1 || 
                                select.content.indexOf('快手') != -1 || 
                                select.content.indexOf('得物') != -1 || 
                                select.content.indexOf('唯品会') != -1 || 
                                select.content.indexOf('1688') != -1) {
                                second_select = processConst.analysisStatusList.TRUE
                            }
                            if (select.content.indexOf('天猫') != -1 || 
                                select.content.indexOf('淘工厂') != -1 || 
                                select.content.indexOf('小红书') != -1) {
                                third_select = processConst.analysisStatusList.TRUE
                            }
                            if ([first_select, second_select, third_select].includes(processConst.analysisStatusList.TRUE)) is_select = processConst.analysisStatusList.TRUE
                            developmentProcessesRepo.updateColumnByUid(
                                process[i].uid, 'is_select', is_select)
                            developmentProcessesRepo.updateColumnByUid(
                                process[i].uid, 'first_select', first_select)
                            developmentProcessesRepo.updateColumnByUid(
                                process[i].uid, 'second_select', second_select)
                            developmentProcessesRepo.updateColumnByUid(
                                process[i].uid, 'third_select', third_select)
                            developmentProcessesRepo.updateColumnByUid(
                                process[i].uid, 'select_project', select.content)
                        }
                        let purchase_type = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.reviewProcess.column.purchase_type)
                        if (purchase_type) developmentProcessesRepo.updateColumnByUid(
                                process[i].uid, 'order_type', purchase_type.content)
                        let vision_type = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.reviewProcess.column.vision_type)
                        if (vision_type) developmentProcessesRepo.updateColumnByUid(
                                process[i].uid, 'vision_type', vision_type.content)
                        // 触发爆款方案
                        let designProposalInstance = await processesRepo.getProcessByUidAndColumn(
                            process[i].uid, 
                            processConst.designProposalProcess.key,
                            processConst.designProposalProcess.template.is_jd,
                            processConst.jdStatusList.FALSE)
                        if (!designProposalInstance?.length) {
                            let division = await processInfoRepo.getByProcessIdAndField(
                                instance[0].process_id, processConst.reviewProcess.column.division)
                            let variables = {}
                            variables[processConst.designProposalProcess.template.link] = processConst.previousUrl + process[i].uid
                            variables[processConst.designProposalProcess.template.uid] = process[i].uid
                            variables[processConst.designProposalProcess.template.is_jd] = processConst.jdStatusList.FALSE
                            variables[processConst.designProposalProcess.template.name] = process[i].name
                            variables[processConst.designProposalProcess.template.division] = division?.content
                            variables[processConst.designProposalProcess.template.first_select] = first_select
                            variables[processConst.designProposalProcess.template.second_select] = second_select
                            variables[processConst.designProposalProcess.template.third_select] = third_select
                            robotStartProcess(processConst.designProposalProcess.name, processConst.designProposalProcess.key, variables)
                            process_status.push(processConst.statusList.DESIGN_PROPOSAL)
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.REVIEW)
                    }
                } else logger.error(`企划审核流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.DESIGN_PROPOSAL) != -1) {
                let instance = await processesRepo.getProcessByUidAndColumn(
                    process[i].uid, 
                    processConst.designProposalProcess.key,
                    processConst.designProposalProcess.template.is_jd,
                    processConst.jdStatusList.FALSE)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        // 更新爆款方案负责人，触发视觉流程，非京东订货流程
                        let operator = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.designProposalProcess.column.operator)
                        if (operator) developmentProcessesRepo.updateColumnByUid(
                                process[i].uid, 'operator', operator.content)
                        let link_type = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.designProposalProcess.column.link_type)
                        let visionDesignInstance = await processesRepo.getProcessByUidAndColumn(
                            process[i].uid, 
                            processConst.visionDesignProcess.key,
                            processConst.visionDesignProcess.template.is_jd,
                            processConst.jdStatusList.FALSE)
                        if (!visionDesignInstance?.length) {
                            let variables = {}
                            variables[processConst.designProposalProcess.template.link] = processConst.previousUrl + process[i].uid
                            variables[processConst.designProposalProcess.template.uid] = process[i].uid
                            variables[processConst.designProposalProcess.template.is_jd] = processConst.jdStatusList.FALSE
                            variables[processConst.designProposalProcess.template.name] = process[i].name
                            variables[processConst.designProposalProcess.template.vision_type] = process[i].vision_type
                            variables[processConst.designProposalProcess.template.project] = JSON.parse(process[i].select_project)                            
                            variables[processConst.designProposalProcess.template.link_type] = link_type?.content
                            variables[processConst.designProposalProcess.template.developer] = process[i].developer
                            variables[processConst.designProposalProcess.template.image] = JSON.parse(process[i].image)                            
                            if (process[i].vision_type != '非原创') {
                                variables[processConst.designProposalProcess.template.operator] = operator?.content
                                robotStartProcess(processConst.designProposalProcess.name, processConst.designProposalProcess.key, variables)
                                process_status.push(processConst.statusList.DESIGN_PROPOSAL)
                            } else { // 非原创事业部各自触发
                                let analysisInstance = await processesRepo.getProcessByUid(
                                    process[i].uid, 
                                    processConst.analysisProcess.key)
                                if (analysisInstance?.length) {
                                    if (process[i].first_select == processConst.analysisStatusList.TRUE) {
                                        let first = await processInfoRepo.getByProcessIdAndField(
                                            analysisInstance[0].process_id, processConst.analysisProcess.column.first_operator)
                                        variables[processConst.designProposalProcess.template.operator] = first?.content
                                        robotStartProcess(processConst.designProposalProcess.name, processConst.designProposalProcess.key, variables)
                                    }
                                    if (process[i].second_select == processConst.analysisStatusList.TRUE) {
                                        let second = await processInfoRepo.getByProcessIdAndField(
                                            analysisInstance[0].process_id, processConst.analysisProcess.column.second_operator)
                                        variables[processConst.designProposalProcess.template.operator] = second?.content
                                        robotStartProcess(processConst.designProposalProcess.name, processConst.designProposalProcess.key, variables)
                                    }
                                    if (process[i].third_select == processConst.analysisStatusList.TRUE) {
                                        let third = await processInfoRepo.getByProcessIdAndField(
                                            analysisInstance[0].process_id, processConst.analysisProcess.column.third_operator)
                                        variables[processConst.designProposalProcess.template.operator] = third?.content
                                        robotStartProcess(processConst.designProposalProcess.name, processConst.designProposalProcess.key, variables)
                                    }
                                    process_status.push(processConst.statusList.DESIGN_PROPOSAL)
                                }
                            }
                        }
                        let purchaseInstance = await processesRepo.getProcessByUid(
                            process[i].uid, 
                            processConst.purchaseProcess.key)
                        if (!purchaseInstance?.length) {
                            let variables = {}
                            variables[processConst.purchaseProcess.template.link] = processConst.previousUrl + process[i].uid
                            variables[processConst.purchaseProcess.template.uid] = process[i].uid
                            variables[processConst.purchaseProcess.template.type] = process[i].type
                            variables[processConst.purchaseProcess.template.purchase_type] = process[i].purchase_type
                            variables[processConst.purchaseProcess.template.developer] = process[i].developer
                            variables[processConst.purchaseProcess.template.first_select] = process[i].first_select
                            variables[processConst.purchaseProcess.template.second_select] = process[i].second_select
                            variables[processConst.purchaseProcess.template.third_select] = process[i].third_select
                            robotStartProcess(processConst.purchaseProcess.name, processConst.purchaseProcess.key, variables)
                            process_status.push(processConst.statusList.PURCHASE)
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.DESIGN_PROPOSAL)
                    }
                } else logger.error(`爆款流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.VISION_DESIGN) != -1) {
                let instance = await processesRepo.getProcessByUidAndColumn(
                    process[i].uid, 
                    processConst.visionDesignProcess.key,
                    processConst.visionDesignProcess.template.is_jd,
                    processConst.jdStatusList.FALSE)
                if (instance?.length) {
                    if ([2,3,4].includes(instance[0].status)) {
                        let purchaseInstance = await processesRepo.getFirstShelfProcess(
                            process[i].uid, 
                            processConst.purchaseProcess.key)
                        if (purchaseInstance?.length && purchaseInstance[0].status == 2) {
                            // 触发上架流程
                            let designProposalInstance = await processesRepo.getProcessByUidAndColumn(
                                process[i].uid, 
                                processConst.designProposalProcess.key,
                                processConst.designProposalProcess.template.is_jd,
                                processConst.jdStatusList.FALSE)
                            let link_type = await processInfoRepo.getByProcessIdAndField(
                                designProposalInstance[0].process_id, processConst.designProposalProcess.column.link_type)
                            if (process[i].first_select == processConst.analysisStatusList.TRUE) {
                                let project = []
                                if (process[i].select_project.indexOf('拼多多') != -1) project.push('拼多多')
                                if (process[i].select_project.indexOf('天猫超市') != -1) project.push('天猫超市')
                                if (process[i].select_project.indexOf('Coupang') != -1) project.push('Coupang')
                                let variables = {}
                                variables[processConst.shelfProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.shelfProcess.template.uid] = process[i].uid
                                variables[processConst.shelfProcess.template.project] = project
                                variables[processConst.shelfProcess.template.developer] = process[i].developer
                                variables[processConst.shelfProcess.template.link_type] = link_type?.content
                                robotStartProcess(processConst.shelfProcess.name, processConst.shelfProcess.key, variables)
                                process_status.push(processConst.statusList.FIRST_SHELF)
                            }
                            if (process[i].second_select == processConst.analysisStatusList.TRUE) {
                                let project = []
                                if (process[i].select_project.indexOf('抖音') != -1) project.push('抖音')
                                if (process[i].select_project.indexOf('快手') != -1) project.push('快手')
                                if (process[i].select_project.indexOf('得物') != -1) project.push('得物')
                                if (process[i].select_project.indexOf('唯品会') != -1) project.push('唯品会')
                                if (process[i].select_project.indexOf('1688') != -1) project.push('1688')
                                let variables = {}
                                variables[processConst.shelfProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.shelfProcess.template.uid] = process[i].uid
                                variables[processConst.shelfProcess.template.project] = project
                                variables[processConst.shelfProcess.template.developer] = process[i].developer
                                variables[processConst.shelfProcess.template.link_type] = link_type?.content
                                robotStartProcess(processConst.shelfProcess.name, processConst.shelfProcess.key, variables)
                                process_status.push(processConst.statusList.SECOND_SHELF)
                            }
                            if (process[i].third_select == processConst.analysisStatusList.TRUE) {
                                let project = []
                                if (process[i].select_project.indexOf('天猫') != -1) project.push('天猫')
                                if (process[i].select_project.indexOf('淘工厂') != -1) project.push('淘工厂')
                                if (process[i].select_project.indexOf('小红书') != -1) project.push('小红书')
                                let variables = {}
                                variables[processConst.shelfProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.shelfProcess.template.uid] = process[i].uid
                                variables[processConst.shelfProcess.template.project] = project
                                variables[processConst.shelfProcess.template.developer] = process[i].developer
                                variables[processConst.shelfProcess.template.link_type] = link_type?.content
                                robotStartProcess(processConst.shelfProcess.name, processConst.shelfProcess.key, variables)
                                process_status.push(processConst.statusList.THIRD_SHELF)
                            }
                        }
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.VISION_DESIGN)
                    }
                } else logger.error(`视觉流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.PURCHASE) != -1) {
                let instance = await processesRepo.getProcessByUid(
                    process[i].uid, 
                    processConst.purchaseProcess.key)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        let visionDesignInstance = await processesRepo.getProcessByUidAndColumn(
                            process[i].uid, 
                            processConst.visionDesignProcess.key,
                            processConst.visionDesignProcess.template.is_jd,
                            processConst.jdStatusList.FALSE)
                        // 更新订货数量
                        let order_num = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.purchaseProcess.column.order_num)
                        if (order_num) developmentProcessesRepo.updateColumnByUid(process[i].uid, 'order_num', order_num.content)
                        if (!visionDesignInstance?.length && [2,3,4].includes(visionDesignInstance[0].status)) {
                            // 触发上架流程
                            if (process[i].first_select == processConst.analysisStatusList.TRUE) {
                                let project = []
                                if (process[i].select_project.indexOf('拼多多') != -1) project.push('拼多多')
                                if (process[i].select_project.indexOf('天猫超市') != -1) project.push('天猫超市')
                                if (process[i].select_project.indexOf('Coupang') != -1) project.push('Coupang')
                                let variables = {}
                                variables[processConst.shelfProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.shelfProcess.template.uid] = process[i].uid
                                variables[processConst.shelfProcess.template.project] = project
                                variables[processConst.shelfProcess.template.developer] = process[i].developer
                                variables[processConst.shelfProcess.template.link_type] = process[i].link_type
                                robotStartProcess(processConst.shelfProcess.name, processConst.shelfProcess.key, variables)
                                process_status.push(processConst.statusList.FIRST_SHELF)
                            }
                            if (process[i].second_select == processConst.analysisStatusList.TRUE) {
                                let project = []
                                if (process[i].select_project.indexOf('抖音') != -1) project.push('抖音')
                                if (process[i].select_project.indexOf('快手') != -1) project.push('快手')
                                if (process[i].select_project.indexOf('得物') != -1) project.push('得物')
                                if (process[i].select_project.indexOf('唯品会') != -1) project.push('唯品会')
                                if (process[i].select_project.indexOf('1688') != -1) project.push('1688')
                                let variables = {}
                                variables[processConst.shelfProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.shelfProcess.template.uid] = process[i].uid
                                variables[processConst.shelfProcess.template.project] = project
                                variables[processConst.shelfProcess.template.developer] = process[i].developer
                                variables[processConst.shelfProcess.template.link_type] = process[i].link_type
                                robotStartProcess(processConst.shelfProcess.name, processConst.shelfProcess.key, variables)
                                process_status.push(processConst.statusList.SECOND_SHELF)
                            }
                            if (process[i].third_select == processConst.analysisStatusList.TRUE) {
                                let project = []
                                if (process[i].select_project.indexOf('天猫') != -1) project.push('天猫')
                                if (process[i].select_project.indexOf('淘工厂') != -1) project.push('淘工厂')
                                if (process[i].select_project.indexOf('小红书') != -1) project.push('小红书')
                                let variables = {}
                                variables[processConst.shelfProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.shelfProcess.template.uid] = process[i].uid
                                variables[processConst.shelfProcess.template.project] = project
                                variables[processConst.shelfProcess.template.developer] = process[i].developer
                                variables[processConst.shelfProcess.template.link_type] = process[i].link_type
                                robotStartProcess(processConst.shelfProcess.name, processConst.shelfProcess.key, variables)
                                process_status.push(processConst.statusList.THIRD_SHELF)
                            }
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.PURCHASE)
                    }
                } else logger.error(`非京东订货流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.FIRST_SHELF) != -1) {
                let instance = await processesRepo.getFirstShelfProcess(
                    process[i].uid, 
                    processConst.shelfProcess.key)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        let secondInstance = await processesRepo.getSecondShelfProcess(
                            process[i].uid, 
                            processConst.purchaseProcess.key)
                        let thirdInstance = await processesRepo.getThirdShelfProcess(
                            process[i].uid, 
                            processConst.purchaseProcess.key)
                        let first_goods_id = ''
                        let pdd = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.shelfProcess.column.pdd)
                        if (pdd) first_goods_id = `${first_goods_id}拼多多:${pdd.content};`
                        let tmcs = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.shelfProcess.column.tmcs)
                        if (tmcs) first_goods_id = `${first_goods_id}天猫超市:${tmcs.content};`
                        let coupang = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.shelfProcess.column.coupang)
                        if (coupang) first_goods_id = `${first_goods_id}coupang:${coupang.content};`
                        developmentProcessesRepo.updateColumnByUid(process[i].uid, 'first_goods_id', first_goods_id)
                        if ((!secondInstance?.length || (secondInstance?.length && 
                                [2,3,4].includes(secondInstance[0].status))) && 
                            (!thirdInstance?.length || (thirdInstance?.length && 
                                [2,3,4].includes(thirdInstance[0].status)))) {
                            developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid)
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        let secondInstance = await processesRepo.getSecondShelfProcess(
                            process[i].uid, 
                            processConst.purchaseProcess.key)
                        let thirdInstance = await processesRepo.getThirdShelfProcess(
                            process[i].uid, 
                            processConst.purchaseProcess.key)
                        if ((!secondInstance?.length || (secondInstance?.length && 
                                [2,3,4].includes(secondInstance[0].status))) && 
                            (!thirdInstance?.length || (thirdInstance?.length && 
                                [2,3,4].includes(thirdInstance[0].status)))) {
                            developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid)
                        }
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.FIRST_SHELF)
                    }
                } else logger.error(`事业1部上架流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.SECOND_SHELF) != -1) {
                let instance = await processesRepo.getSecondShelfProcess(
                    process[i].uid, 
                    processConst.shelfProcess.key)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        let firstInstance = await processesRepo.getFirstShelfProcess(
                            process[i].uid, 
                            processConst.purchaseProcess.key)
                        let thirdInstance = await processesRepo.getThirdShelfProcess(
                            process[i].uid, 
                            processConst.purchaseProcess.key)
                        let second_goods_id = ''
                        let dy = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.shelfProcess.column.dy)
                        if (dy) second_goods_id = `${second_goods_id}抖音:${dy.content};`
                        let ks = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.shelfProcess.column.ks)
                        if (ks) second_goods_id = `${second_goods_id}快手:${ks.content};`
                        let dw = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.shelfProcess.column.dw)
                        if (dw) second_goods_id = `${second_goods_id}得物:${dw.content};`
                        let vip = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.shelfProcess.column.vip)
                        if (vip) second_goods_id = `${second_goods_id}唯品会:${vip.content};`
                        let ex = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.shelfProcess.column['1688'])
                        if (ex) second_goods_id = `${second_goods_id}1688:${ex.content};`
                        developmentProcessesRepo.updateColumnByUid(process[i].uid, 'second_goods_id', second_goods_id)
                        if ((!firstInstance?.length || (firstInstance?.length && 
                                [2,3,4].includes(firstInstance[0].status))) && 
                            (!thirdInstance?.length || (thirdInstance?.length && 
                                [2,3,4].includes(thirdInstance[0].status)))) {
                            developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid)
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        let firstInstance = await processesRepo.getFirstShelfProcess(
                            process[i].uid, 
                            processConst.purchaseProcess.key)
                        let thirdInstance = await processesRepo.getThirdShelfProcess(
                            process[i].uid, 
                            processConst.purchaseProcess.key)
                        if ((!firstInstance?.length || (firstInstance?.length && 
                                [2,3,4].includes(firstInstance[0].status))) && 
                            (!thirdInstance?.length || (thirdInstance?.length && 
                                [2,3,4].includes(thirdInstance[0].status)))) {
                            developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid)
                        }
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.SECOND_SHELF)
                    }
                } else logger.error(`事业2部上架流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.THIRD_SHELF) != -1) {
                let instance = await processesRepo.getThirdShelfProcess(
                    process[i].uid, 
                    processConst.shelfProcess.key)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        let secondInstance = await processesRepo.getSecondShelfProcess(
                            process[i].uid, 
                            processConst.purchaseProcess.key)
                        let firstInstance = await processesRepo.getFirstShelfProcess(
                            process[i].uid, 
                            processConst.purchaseProcess.key)
                        let third_goods_id = ''
                        let xhs = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.shelfProcess.column.pdxhsd)
                        if (xhs) third_goods_id = `${third_goods_id}小红书:${xhs.content};`
                        let tm = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.shelfProcess.column.tm)
                        if (tm) third_goods_id = `${third_goods_id}天猫:${tm.content};`
                        let tgc = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.shelfProcess.column.tgc)
                        if (tgc) third_goods_id = `${third_goods_id}淘工厂:${coupang.tgc};`
                        developmentProcessesRepo.updateColumnByUid(process[i].uid, 'third_goods_id', third_goods_id)
                        if ((!secondInstance?.length || (secondInstance?.length && 
                                [2,3,4].includes(secondInstance[0].status))) && 
                            (!firstInstance?.length || (firstInstance?.length && 
                                [2,3,4].includes(firstInstance[0].status)))) {
                            developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid)
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        let secondInstance = await processesRepo.getSecondShelfProcess(
                            process[i].uid, 
                            processConst.purchaseProcess.key)
                        let firstInstance = await processesRepo.getFirstShelfProcess(
                            process[i].uid, 
                            processConst.purchaseProcess.key)
                        if ((!secondInstance?.length || (secondInstance?.length && 
                                [2,3,4].includes(secondInstance[0].status))) && 
                            (!firstInstance?.length || (firstInstance?.length && 
                                [2,3,4].includes(firstInstance[0].status)))) {
                            developmentProcessesRepo.updateStatusToFinishByUid(process[i].uid)
                        }
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.THIRD_SHELF)
                    }
                } else logger.error(`事业3部上架流程触发失败, uid=${process[i].uid}`)
            }
            if (process_ids?.length) {
                process_ids = process_ids.join('","')
                let tasks = await processTasksRepo.getRunningTasksByProcessId(process_ids)
                let tasks_names = ''
                for (let j = 0; j < tasks.length; j++) {
                    tasks_names = `${tasks_names}${tasks[i].process_title}:${tasks[i].title};`
                }
                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'running_node', tasks_names)
            }
            if (process_status?.length) {
                process_status = process_status.join(',')
                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'status', process_status)
            }
            console.log(process_ids, process_status)
        }
        if (!process[i].jd_status) {
            let process_ids = [], process_status = []
            if (process[i].status.indexOf(processConst.statusList.DEVELOPMENT_CHECK) != -1) {
                let instance = await processesRepo.getProcessByUidAndColumn(
                    process[i].uid, 
                    processConst.developCheckProcess.key, 
                    processConst.developCheckProcess.column.is_jd,
                    processConst.jdStatusList.TRUE)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        if ([processConst.typeList.IP, processConst.typeList.SELF].includes(process[i].type)) {
                            // IP、自研触发寄样
                            let sampleInstance = await processesRepo.getProcessByUidAndColumn(
                                process[i].uid, 
                                processConst.sampleProcess.key,
                                processConst.sampleProcess.template.is_jd,
                                processConst.jdStatusList.TRUE)
                            if (!sampleInstance?.length) {
                                let variables = {}, user_id, developer_id
                                let starter = await systemUsersRepo.getID(process[i].starter)
                                if (starter?.length) user_id = starter[0].id
                                if (process[i].developer) {
                                    let developer = await systemUsersRepo.getID(process[i].developer)
                                    if (developer?.length) developer_id = developer[0].id
                                } else {
                                    // 更新开发人
                                    let user = await processInfoRepo.getByProcessIdAndField(
                                        instance[0].process_id, processConst.developCheckProcess.column.developer.DEFAULT
                                    )
                                    process[i].developer = user.content
                                    developmentProcessesRepo.updateColumnByUid(process[i].uid, 'developer', user.content)
                                    let developer = await systemUsersRepo.getID(user.content)
                                    if (developer?.length) developer_id = developer[0].id
                                }
                                variables[processConst.sampleProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.sampleProcess.template.uid] = process[i].uid
                                variables[processConst.sampleProcess.template.is_jd] = processConst.jdStatusList.TRUE
                                variables[processConst.sampleProcess.template.starter] = user_id
                                variables[processConst.sampleProcess.template.type] = process[i].type
                                if (process[i].type == processConst.typeList.IP) 
                                    variables[processConst.sampleProcess.template.project] = process[i].project
                                variables[processConst.sampleProcess.template.product_info] = JSON.parse(process[i].product_info)
                                variables[processConst.sampleProcess.template.developer] = developer_id
                                robotStartProcess(processConst.sampleProcess.name, processConst.sampleProcess.key, variables)
                                process_status.push(processConst.statusList.SAMPLE)
                            }
                        } else if (process[i].type == processConst.typeList.SUPPLIER) {
                            // 正推触发京东分析，寄样
                            let analysisInstance = await processesRepo.getProcessByUid(
                                process[i].uid, 
                                processConst.jdAnalysisProcess.key)
                            if (!analysisInstance?.length) {
                                let analysisVariables = JSON.parse(JSON.stringify(processConst.jdAnalysisProcess.template.SUPPLIER))
                                let variables = {}
                                for (let j = 0; j < analysisVariables.length; j++) {
                                    variables[analysisVariables[j].key] = analysisVariables[j].type == 'array' ? 
                                        [process[i][analysisVariables[j].name]] : process[i][analysisVariables[j].name]
                                }
                                robotStartProcess(processConst.jdAnalysisProcess.name, processConst.jdAnalysisProcess.key, variables)
                                process_status.push(processConst.statusList.ANALYSIS)
                            }
                            let sampleInstance = await processesRepo.getProcessByUidAndColumn(
                                process[i].uid, 
                                processConst.sampleProcess.key,
                                processConst.sampleProcess.template.is_jd,
                                processConst.jdStatusList.TRUE)
                            if (!sampleInstance?.length) {
                                let variables = {}, user_id, developer_id
                                let starter = await systemUsersRepo.getID(process[i].starter)
                                if (starter?.length) user_id = starter[0].id
                                if (process[i].developer) {
                                    let developer = await systemUsersRepo.getID(process[i].developer)
                                    if (developer?.length) developer_id = developer[0].id
                                } else {
                                    // 更新开发人
                                    let user = await processInfoRepo.getByProcessIdAndField(
                                        instance[0].process_id, processConst.developCheckProcess.column.developer.DEFAULT
                                    )
                                    process[i].developer = user.content
                                    developmentProcessesRepo.updateColumnByUid(process[i].uid, 'developer', user.content)
                                    let developer = await systemUsersRepo.getID(user.content)
                                    if (developer?.length) developer_id = developer[0].id
                                }
                                variables[processConst.sampleProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.sampleProcess.template.uid] = process[i].uid
                                variables[processConst.sampleProcess.template.is_jd] = processConst.jdStatusList.TRUE
                                variables[processConst.sampleProcess.template.starter] = user_id
                                variables[processConst.sampleProcess.template.type] = process[i].type
                                variables[processConst.sampleProcess.template.developer] = developer_id
                                robotStartProcess(processConst.sampleProcess.name, processConst.sampleProcess.key, variables)
                                process_status.push(processConst.statusList.SAMPLE)
                            }
                        } else {
                            // 反推触发京东分析
                            if (!process[i].developer) {
                                let user
                                for (let j = 0; j < processConst.developCheckProcess.column.developer.OTHER.length; j++) {
                                    user = await processInfoRepo.getByProcessIdAndField(
                                        instance[0].process_id, processConst.developCheckProcess.column.developer.OTHER[j])
                                    if (user) break
                                }
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'developer', user.content)
                            }
                            let analysisInstance = await processesRepo.getProcessByUid(
                                process[i].uid, 
                                processConst.jdAnalysisProcess.key)
                            if (!analysisInstance?.length) {
                                let analysisVariables = JSON.parse(JSON.stringify(processConst.jdAnalysisProcess.template.OPERATOR))
                                let variables = {}
                                for (let j = 0; j < analysisVariables.length; j++) {
                                    variables[analysisVariables[j].key] = analysisVariables[j].type == 'array' ? 
                                        [process[i][analysisVariables[j].name]] : process[i][analysisVariables[j].name]
                                }
                                robotStartProcess(processConst.jdAnalysisProcess.name, processConst.jdAnalysisProcess.key, variables)
                                process_status.push(processConst.statusList.ANALYSIS)
                            }
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateJDStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.DEVELOPMENT_CHECK)
                    }
                } else logger.error(`京东开发审核流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.SAMPLE) != -1) {
                let instance = await processesRepo.getProcessByUidAndColumn(
                    process[i].uid, 
                    processConst.sampleProcess.key,
                    processConst.sampleProcess.template.is_jd,
                    processConst.jdStatusList.TRUE)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        // 更新样品图片、草图
                        if (!process[i].sample_image) {
                            let image = await processInfoRepo.getByProcessIdAndField(
                                instance[0].process_id, processConst.sampleProcess.column.sample_image)
                            if (image) developmentProcessesRepo.updateColumnByUid(process[i].uid, 'sample_image', image.content)
                        }
                        if (!process[i].design_image) {
                            let image = await processInfoRepo.getByProcessIdAndField(
                                instance[0].process_id, processConst.sampleProcess.column.design_image)
                            if (image) developmentProcessesRepo.updateColumnByUid(process[i].uid, 'design_image', image.content)
                        }
                        if (process[i].type == processConst.typeList.OPERATOR) {                            
                            // 反推寄样通过触发样品选中
                            let analysisInstance = await processesRepo.getProcessByUid(
                                process[i].uid, 
                                processConst.analysisProcess.key)
                            if (analysisInstance?.length) {
                                let first = await processInfoRepo.getByProcessIdAndField(
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.first_operator)
                                let second = await processInfoRepo.getByProcessIdAndField(
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.second_operator)
                                let third = await processInfoRepo.getByProcessIdAndField(
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.third_operator)
                                let variables = {}
                                variables[processConst.sampleCheckProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.sampleCheckProcess.template.uid] = process[i].uid
                                variables[processConst.sampleCheckProcess.template.is_jd] = processConst.jdStatusList.TRUE
                                variables[processConst.sampleCheckProcess.template.first_operator] = first?.content
                                variables[processConst.sampleCheckProcess.template.second_operator] = second?.content
                                variables[processConst.sampleCheckProcess.template.third_operator] = third?.content
                                robotStartProcess(processConst.sampleCheckProcess.name, processConst.sampleCheckProcess.key, variables)
                                process_status.push(processConst.statusList.SAMPLE_CHECK)
                            }
                        } else if ([processConst.typeList.IP, processConst.typeList.SELF].includes(process[i].type)) {
                            // IP,自研审核通过触发企划审核
                            let reviewVarables = JSON.parse(JSON.stringify(processConst.reviewProcess.template.SUPPLIER))
                            let variables = {}
                            process['link'] = processConst.previousUrl + process[i].uid
                            process['start_time'] = moment(process[i].create_time).format('YYYY-MM-DD')
                            process['is_jd'] = processConst.jdStatusList.TRUE
                            for (let j = 0; j < reviewVarables.length; j++) {
                                variables[reviewVarables[j].key] = reviewVarables[j].type == 'array' ? 
                                    [process[i][reviewVarables[j].name]] : process[i][reviewVarables[j].name]
                            }
                            robotStartProcess(processConst.reviewProcess.name, processConst.reviewProcess.key, variables)
                            process_status.push(processConst.statusList.REVIEW)
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateJDStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.SAMPLE)
                    }
                } else logger.error(`京东寄样流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.ANALYSIS) != -1) {
                let instance = await processesRepo.getProcessByUid(
                    process[i].uid, 
                    processConst.jdAnalysisProcess.key)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        if ([processConst.typeList.IP, processConst.typeList.SELF].includes(process[i].type)) {
                            // IP、自研非京东分析通过触发开发审核，更新spu,sku_code
                            let developCheckInstance = await processesRepo.getProcessByUidAndColumn(
                                process[i].uid, 
                                processConst.developCheckProcess.key,
                                processConst.developCheckProcess.column.is_jd,
                                processConst.jdStatusList.TRUE)
                            if (!developCheckInstance?.length) {
                                let developCheckVarables = process[i].type == processConst.typeList.IP ? 
                                    JSON.parse(JSON.stringify(processConst.developCheckProcess.template.IP)) : 
                                    JSON.parse(JSON.stringify(processConst.developCheckProcess.template.SELF))
                                let variables = {}
                                process['link'] = processConst.previousUrl + process[i].uid
                                process['start_time'] = moment(process[i].create_time).format('YYYY-MM-DD')
                                process['is_jd'] = processConst.jdStatusList.TRUE
                                for (let j = 0; j < developCheckVarables.length; j++) {
                                    variables[developCheckVarables[j].key] = developCheckVarables[j].type == 'array' ? 
                                        [process[i][developCheckVarables[j].name]] : process[i][developCheckVarables[j].name]
                                }
                                robotStartProcess(processConst.developCheckProcess.name, processConst.developCheckProcess.key, variables)
                                process_status.push(processConst.statusList.DEVELOPMENT_CHECK)
                                let spu = await processInfoRepo.getByProcessIdAndField(
                                    instance[0].process_id, processConst.jdAnalysisProcess.column.spu)
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'spu', spu.content)
                                let sku_code = await processInfoRepo.getByProcessIdAndField(
                                    instance[0].process_id, processConst.jdAnalysisProcess.column.sku_code)
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'sku_code', sku_code.content)
                            }
                        } else if (process[i].type == processConst.typeList.SUPPLIER) {
                            // 正推京东分析选中触发企划审核，更新spu,sku_code
                            let reviewInstance = await processesRepo.getProcessByUidAndColumn(
                                process[i].uid, 
                                processConst.reviewProcess.key,
                                processConst.reviewProcess.column.is_jd,
                                processConst.jdStatusList.TRUE)
                            if (!reviewInstance?.length) {
                                let is_select = false
                                let select = await processInfoRepo.getByProcessIdAndField(
                                    instance[0].process_id, processConst.jdAnalysisProcess.column.select)
                                if (select?.content == processConst.analysisStatusList.TRUE) is_select = true
                                if (is_select) {
                                    let reviewVarables = JSON.parse(JSON.stringify(processConst.reviewProcess.template.SUPPLIER))
                                    let variables = {}
                                    process['link'] = processConst.previousUrl + process[i].uid
                                    process['start_time'] = moment(process[i].create_time).format('YYYY-MM-DD')
                                    process['is_jd'] = processConst.jdStatusList.TRUE
                                    for (let j = 0; j < reviewVarables.length; j++) {
                                        variables[reviewVarables[j].key] = reviewVarables[j].type == 'array' ? 
                                            [process[i][reviewVarables[j].name]] : process[i][reviewVarables[j].name]
                                    }
                                    robotStartProcess(processConst.reviewProcess.name, processConst.reviewProcess.key, variables)
                                    process_status.push(processConst.statusList.REVIEW)
                                    let spu = await processInfoRepo.getByProcessIdAndField(
                                        instance[0].process_id, processConst.jdAnalysisProcess.column.spu)
                                    developmentProcessesRepo.updateColumnByUid(process[i].uid, 'spu', spu.content)
                                    let sku_code = await processInfoRepo.getByProcessIdAndField(
                                        instance[0].process_id, processConst.jdAnalysisProcess.column.sku_code)
                                    developmentProcessesRepo.updateColumnByUid(process[i].uid, 'sku_code', sku_code.content)
                                }
                            }
                        } else {
                            // 反推京东分析通过触发寄样
                            let sampleInstance = await processesRepo.getProcessByUidAndColumn(
                                process[i].uid, 
                                processConst.sampleProcess.key,
                                processConst.sampleProcess.template.is_jd,
                                processConst.jdStatusList.TRUE)
                            if (!sampleInstance?.length) {
                                let variables = {}, user_id, developer_id
                                let starter = await systemUsersRepo.getID(process[i].starter)
                                if (starter?.length) user_id = starter[0].id
                                let developer = await systemUsersRepo.getID(process[i].developer)
                                if (developer?.length) developer_id = developer[0].id
                                variables[processConst.sampleProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.sampleProcess.template.uid] = process[i].uid
                                variables[processConst.sampleProcess.template.is_jd] = processConst.jdStatusList.TRUE
                                variables[processConst.sampleProcess.template.starter] = user_id
                                variables[processConst.sampleProcess.template.type] = process[i].type
                                variables[processConst.sampleProcess.template.developer] = developer_id
                                robotStartProcess(processConst.sampleProcess.name, processConst.sampleProcess.key, variables)
                                process_status.push(processConst.statusList.SAMPLE)
                            }
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateJDStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.ANALYSIS)
                    }
                } else logger.error(`京东分析流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.SAMPLE_CHECK) != -1) {
                // 反推样品选中触发企划审核，更新spu,sku_code
                let instance = await processesRepo.getProcessByUidAndColumn(
                    process[i].uid, 
                    processConst.sampleCheckProcess.key,
                    processConst.sampleCheckProcess.template.is_jd,
                    processConst.jdStatusList.TRUE)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        let reviewInstance = await processesRepo.getProcessByUidAndColumn(
                            process[i].uid, 
                            processConst.reviewProcess.key,
                            processConst.reviewProcess.column.is_jd,
                            processConst.jdStatusList.TRUE)
                        if (!reviewInstance?.length) {
                            let is_select = false
                            let analysisInstance = await processesRepo.getProcessByUid(
                                process[i].uid, 
                                processConst.analysisProcess.key)
                            if (analysisInstance?.length) {
                                let first = await processInfoRepo.getByProcessIdAndField(
                                    analysisInstance[0].process_id, processConst.analysisProcess.column.first_select)
                                if (first?.content == processConst.analysisStatusList.TRUE) is_select = true
                                else {
                                    let second = await processInfoRepo.getByProcessIdAndField(
                                        analysisInstance[0].process_id, processConst.analysisProcess.column.second_select)
                                    if (second?.content == processConst.analysisStatusList.TRUE) is_select = true
                                    else {
                                        let third = await processInfoRepo.getByProcessIdAndField(
                                            analysisInstance[0].process_id, processConst.analysisProcess.column.third_select)
                                        if (third?.content == processConst.analysisStatusList.TRUE) is_select = true
                                    }
                                }
                            }
                            if (is_select) {
                                let reviewVarables = JSON.parse(JSON.stringify(processConst.reviewProcess.template.SUPPLIER))
                                let variables = {}
                                process['link'] = processConst.previousUrl + process[i].uid
                                process['start_time'] = moment(process[i].create_time).format('YYYY-MM-DD')
                                process['is_jd'] = processConst.jdStatusList.TRUE
                                for (let j = 0; j < reviewVarables.length; j++) {
                                    variables[reviewVarables[j].key] = reviewVarables[j].type == 'array' ? 
                                        [process[i][reviewVarables[j].name]] : process[i][reviewVarables[j].name]
                                }
                                robotStartProcess(processConst.reviewProcess.name, processConst.reviewProcess.key, variables)
                                process_status.push(processConst.statusList.REVIEW)
                                let analysisInstance = await processesRepo.getProcessByUid(
                                    process[i].uid, 
                                    processConst.jdAnalysisProcess.key)
                                let spu = await processInfoRepo.getByProcessIdAndField(
                                    analysisInstance[0].process_id, processConst.jdAnalysisProcess.column.spu)
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'spu', spu.content)
                                let sku_code = await processInfoRepo.getByProcessIdAndField(
                                    analysisInstance[0].process_id, processConst.jdAnalysisProcess.column.sku_code)
                                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'sku_code', sku_code.content)
                            }
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateJDStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.SAMPLE_CHECK)
                    }
                } else logger.error(`京东样品选中流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.REVIEW) != -1) {
                // 更新选中平台，事业1部是否选中，事业2部是否选中，事业3部是否选中，非京东是否选中，采购方式, 视觉类型
                let instance = await processesRepo.getProcessByUidAndColumn(
                    process[i].uid, 
                    processConst.reviewProcess.key,
                    processConst.reviewProcess.column.is_jd,
                    processConst.jdStatusList.TRUE)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        let select = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.reviewProcess.column.select_project)                        
                        let jd_is_select = processConst.analysisStatusList.FALSE
                        if (select) {
                            if (select.content.indexOf('京东') != -1) {
                                jd_is_select = processConst.analysisStatusList.TRUE
                            }
                            developmentProcessesRepo.updateColumnByUid(
                                process[i].uid, 'jd_is_select', jd_is_select)
                        }
                        let vision_type = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.reviewProcess.column.vision_type)
                        if (vision_type) developmentProcessesRepo.updateColumnByUid(
                                process[i].uid, 'jd_vision_type', vision_type.content)
                        // 触发爆款方案
                        let designProposalInstance = await processesRepo.getProcessByUidAndColumn(
                            process[i].uid, 
                            processConst.designProposalProcess.key,
                            processConst.designProposalProcess.template.is_jd,
                            processConst.jdStatusList.TRUE)
                        if (!designProposalInstance?.length) {
                            let division = await processInfoRepo.getByProcessIdAndField(
                                instance[0].process_id, processConst.reviewProcess.column.division)
                            let variables = {}
                            variables[processConst.designProposalProcess.template.link] = processConst.previousUrl + process[i].uid
                            variables[processConst.designProposalProcess.template.uid] = process[i].uid
                            variables[processConst.designProposalProcess.template.is_jd] = processConst.jdStatusList.TRUE
                            variables[processConst.designProposalProcess.template.name] = process[i].name
                            variables[processConst.designProposalProcess.template.division] = division?.content
                            variables[processConst.designProposalProcess.template.first_select] = first_select
                            variables[processConst.designProposalProcess.template.second_select] = second_select
                            variables[processConst.designProposalProcess.template.third_select] = third_select
                            robotStartProcess(processConst.designProposalProcess.name, processConst.designProposalProcess.key, variables)
                            process_status.push(processConst.statusList.DESIGN_PROPOSAL)
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateJDStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.REVIEW)
                    }
                } else logger.error(`京东企划审核流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.DESIGN_PROPOSAL) != -1) {
                let instance = await processesRepo.getProcessByUidAndColumn(
                    process[i].uid, 
                    processConst.designProposalProcess.key,
                    processConst.designProposalProcess.template.is_jd,
                    processConst.jdStatusList.TRUE)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        // 更新爆款方案负责人，触发视觉流程，京东订货流程
                        let operator = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.designProposalProcess.column.operator)
                        if (operator) developmentProcessesRepo.updateColumnByUid(
                                process[i].uid, 'jd_operator', operator.content)
                        let link_type = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.designProposalProcess.column.link_type)
                        let visionDesignInstance = await processesRepo.getProcessByUidAndColumn(
                            process[i].uid, 
                            processConst.visionDesignProcess.key,
                            processConst.visionDesignProcess.template.is_jd,
                            processConst.jdStatusList.TRUE)
                        if (!visionDesignInstance?.length) {
                            let variables = {}
                            variables[processConst.designProposalProcess.template.link] = processConst.previousUrl + process[i].uid
                            variables[processConst.designProposalProcess.template.uid] = process[i].uid
                            variables[processConst.designProposalProcess.template.is_jd] = processConst.jdStatusList.TRUE
                            variables[processConst.designProposalProcess.template.name] = process[i].name
                            variables[processConst.designProposalProcess.template.vision_type] = process[i].vision_type
                            variables[processConst.designProposalProcess.template.project] = ['京东']
                            variables[processConst.designProposalProcess.template.link_type] = link_type?.content
                            variables[processConst.designProposalProcess.template.developer] = process[i].developer
                            variables[processConst.designProposalProcess.template.image] = JSON.parse(process[i].image)
                            variables[processConst.designProposalProcess.template.operator] = operator?.content
                            robotStartProcess(processConst.designProposalProcess.name, processConst.designProposalProcess.key, variables)
                            process_status.push(processConst.statusList.DESIGN_PROPOSAL) 
                        }
                        let purchaseInstance = await processesRepo.getProcessByUid(
                            process[i].uid, 
                            processConst.jdPurchaseProcess.key)
                        if (!purchaseInstance?.length) {
                            let variables = {}
                            variables[processConst.jdPurchaseProcess.template.link] = processConst.previousUrl + process[i].uid
                            variables[processConst.jdPurchaseProcess.template.uid] = process[i].uid
                            variables[processConst.jdPurchaseProcess.template.type] = process[i].type
                            variables[processConst.jdPurchaseProcess.template.operator] = operator?.content
                            variables[processConst.jdPurchaseProcess.template.spu] = process[i].spu
                            variables[processConst.jdPurchaseProcess.template.developer] = process[i].developer
                            robotStartProcess(processConst.jdPurchaseProcess.name, processConst.jdPurchaseProcess.key, variables)
                            process_status.push(processConst.statusList.PURCHASE)
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateJDStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.DESIGN_PROPOSAL)
                    }
                } else logger.error(`京东爆款流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.VISION_DESIGN) != -1) {
                let instance = await processesRepo.getProcessByUidAndColumn(
                    process[i].uid, 
                    processConst.visionDesignProcess.key,
                    processConst.visionDesignProcess.template.is_jd,
                    processConst.jdStatusList.TRUE)
                if (instance?.length) {
                    if ([2,3,4].includes(instance[0].status)) {
                        let purchaseInstance = await processesRepo.getJDShelfProcess(
                            process[i].uid, 
                            processConst.jdPurchaseProcess.key)
                        if (purchaseInstance?.length && purchaseInstance[0].status == 2) {
                            // 触发上架流程
                            if (process[i].jd_is_select == processConst.analysisStatusList.TRUE) {
                                let variables = {}
                                variables[processConst.shelfProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.shelfProcess.template.uid] = process[i].uid
                                variables[processConst.shelfProcess.template.project] = ['京东']
                                variables[processConst.shelfProcess.template.developer] = process[i].developer
                                let designProposalInstance = await processesRepo.getProcessByUidAndColumn(
                                    process[i].uid, 
                                    processConst.designProposalProcess.key,
                                    processConst.designProposalProcess.template.is_jd,
                                    processConst.jdStatusList.TRUE)
                                let link_type = await processInfoRepo.getByProcessIdAndField(
                                    designProposalInstance[0].process_id, processConst.designProposalProcess.column.link_type)
                                variables[processConst.shelfProcess.template.link_type] = link_type?.content
                                robotStartProcess(processConst.shelfProcess.name, processConst.shelfProcess.key, variables)
                                process_status.push(processConst.statusList.SECOND_SHELF)
                            }
                        }
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.VISION_DESIGN)
                    }
                } else logger.error(`京东视觉流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.PURCHASE) != -1) {
                let instance = await processesRepo.getProcessByUid(
                    process[i].uid, 
                    processConst.jdPurchaseProcess.key)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        let visionDesignInstance = await processesRepo.getProcessByUidAndColumn(
                            process[i].uid, 
                            processConst.visionDesignProcess.key,
                            processConst.visionDesignProcess.template.is_jd,
                            processConst.jdStatusList.TRUE)
                        // 更新订货数量
                        let order_num = await processInfoRepo.getByProcessIdAndField(
                            instance[0].process_id, processConst.jdPurchaseProcess.column.order_num)
                        if (order_num) developmentProcessesRepo.updateColumnByUid(process[i].uid, 'jd_order_num', order_num.content)
                        if (!visionDesignInstance?.length && [2,3,4].includes(visionDesignInstance[0].status)) {
                            // 触发上架流程
                            if (process[i].jd_is_select == processConst.analysisStatusList.TRUE) {
                                let variables = {}
                                variables[processConst.shelfProcess.template.link] = processConst.previousUrl + process[i].uid
                                variables[processConst.shelfProcess.template.uid] = process[i].uid
                                variables[processConst.shelfProcess.template.project] = ['京东']
                                variables[processConst.shelfProcess.template.developer] = process[i].developer
                                variables[processConst.shelfProcess.template.link_type] = process[i].link_type
                                robotStartProcess(processConst.shelfProcess.name, processConst.shelfProcess.key, variables)
                                process_status.push(processConst.statusList.SECOND_SHELF)
                            }
                        }
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateJDStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.PURCHASE)
                    }
                } else logger.error(`京东订货流程触发失败, uid=${process[i].uid}`)
            }
            if (process[i].status.indexOf(processConst.statusList.SECOND_SHELF) != -1) {
                let instance = await processesRepo.getJDShelfProcess(
                    process[i].uid, 
                    processConst.shelfProcess.key)
                if (instance?.length) {
                    if (instance[0].status == 2) {
                        let firstInstance = await processesRepo.getJDShelfProcess(
                            process[i].uid, 
                            processConst.shelfProcess.key)
                        let second_goods_id = ''
                        let jd = await processInfoRepo.getByProcessIdAndField(
                            firstInstance[0].process_id, processConst.shelfProcess.column.jd)
                        if (jd) second_goods_id = `${second_goods_id}京东:${jd.content};`
                        developmentProcessesRepo.updateColumnByUid(process[i].uid, 'second_goods_id', second_goods_id)
                        developmentProcessesRepo.updateJDStatusToFinishByUid(process[i].uid)
                    } else if ([3,4].includes(instance[0].status)) {
                        developmentProcessesRepo.updateJDStatusToFinishByUid(process[i].uid)
                    } else {
                        process_ids.push(instance[0].process_id)
                        process_status.push(processConst.statusList.SECOND_SHELF)
                    }
                } else logger.error(`事业2部上架流程触发失败, uid=${process[i].uid}`)
            }
            if (process_ids?.length) {
                process_ids = process_ids.join('","')
                let tasks = await processTasksRepo.getRunningTasksByProcessId(process_ids)
                let tasks_names = ''
                for (let j = 0; j < tasks.length; j++) {
                    tasks_names = `${tasks_names}${tasks[i].process_title}:${tasks[i].title};`
                }
                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'jd_running_node', tasks_names)
            }
            if (process_status?.length) {
                process_status = process_status.join(',')
                developmentProcessesRepo.updateColumnByUid(process[i].uid, 'jd_status', process_status)
            }            
            console.log(process_ids, process_status)
        }
    }
}

const getById = async (id) => {
    const result = await developmentProcessesRepo.getById(id)
    return result?.length ? result[0] : null
}

const syncDevelopmentProcessFormFields = async () => {
    const processes = await developmentProcessesRepo.getAllForFieldSync()

    if (!processes?.length) return

    const fieldRows = await processInfoRepo.getFieldValuesForDevelopmentProcesses(DEVELOPMENT_PROCESS_FIELD_TITLES)
    const processStatusRows = await processInfoRepo.getProcessStatusesForDevelopmentProcesses()
    const marketAnalysisRows = await processInfoRepo.getProcessFieldValuesByCodeAndTitles(
        MARKET_ANALYSIS_PROCESS_CODE,
        MARKET_ANALYSIS_FIELD_TITLES,
    )
    const visionProcessRows = await processInfoRepo.getProcessFieldValuesByCodeAndTitles(
        VISION_TYPE_PROCESS_CODE,
        VISION_AND_PLATFORM_FIELD_TITLES,
    )
    const hotPlanOperatorRows = await processInfoRepo.getProcessFieldValuesByCodeAndTitles(
        HOT_PLAN_PROCESS_CODE,
        HOT_PLAN_FIELD_TITLES,
    )
    const orderQuantityRows = await processInfoRepo.getProcessFieldValuesByCodeAndTitles(
        ORDER_QUANTITY_PROCESS_CODE,
        [ORDER_QUANTITY_FIELD_TITLE],
    )
    const shelfGoodsRows = await processInfoRepo.getProcessFieldValuesByCodeAndTitles(
        SHELF_PROCESS_CODE,
        GOODS_ID_FIELD_TITLES,
    )
    const orderTypeRows = await processInfoRepo.getProcessFieldRowsByTitle(ORDER_TYPE_FIELD_TITLE)
    const processStatusMap = new Map()
    const fieldMap = new Map()
    const marketAnalysisMap = buildMarketAnalysisMap(marketAnalysisRows)
    const visionTypeMap = buildVisionTypeFieldMap(visionProcessRows)
    const hotPlanOperatorMap = buildHotPlanOperatorMap(hotPlanOperatorRows)
    const selectProjectMap = buildSelectProjectMap(visionProcessRows)
    const orderTypeMap = buildOrderTypeFieldMap(orderTypeRows)
    const orderQuantityMap = buildOrderQuantityMap(orderQuantityRows)
    const shelfGoodsAssignmentsMap = buildShelfGoodsIdAssignments(shelfGoodsRows)

    for (const row of processStatusRows || []) {
        const uid = row?.development_uid
        if (!uid || row?.process_status === undefined || row?.process_status === null) continue
        if (!processStatusMap.has(uid)) {
            processStatusMap.set(uid, row.process_status)
        }
    }

    for (const row of fieldRows || []) {
        const uid = row?.development_uid
        const title = row?.field_title
        if (!uid || !title) continue
        const content = row?.content
        if (!fieldMap.has(uid)) fieldMap.set(uid, {})
        const current = fieldMap.get(uid)
        const hasValue = Object.prototype.hasOwnProperty.call(current, title)

        if (!hasValue) {
            current[title] = content
            continue
        }

        if (!isBlankFormFieldValue(content)) {
            current[title] = content
            continue
        }

        if (isBlankFormFieldValue(current[title])) {
            current[title] = content
        }
    }

    for (const process of processes) {
        const uid = process?.uid
        if (!uid) continue
        const values = fieldMap.get(uid) || {}
        const updates = {}

        for (const config of DEVELOPMENT_PROCESS_FIELD_SYNC_CONFIGS) {
            if (!Object.prototype.hasOwnProperty.call(values, config.title)) continue

            const rawContent = values[config.title]
            const normalized = typeof rawContent === 'string' ? rawContent.trim() : rawContent
            if (isBlankFormFieldValue(normalized)) continue

            if (SELECTION_STATUS_COLUMN_SET.has(config.column)) {
                const targetValue = resolveSelectionStorageValue(true, rawContent)

                if (!valuesAreEqual(config.column, process[config.column], targetValue)) {
                    updates[config.column] = targetValue
                }
                continue
            }

            if (!valuesAreEqual(config.column, process[config.column], normalized)) {
                updates[config.column] = normalized
            }
        }

        const marketAnalysisPayload = buildMarketAnalysisPayload(marketAnalysisMap.get(uid))
        const targetAnalysisValue = marketAnalysisPayload ? JSON.stringify(marketAnalysisPayload) : null
        if (!valuesAreEqual('analysis', process.analysis, targetAnalysisValue)) {
            updates.analysis = targetAnalysisValue
        }

        const targetOrderTypeValue = resolveOrderTypeValue(orderTypeMap.get(uid))
        if (targetOrderTypeValue !== null && !valuesAreEqual('order_type', process.order_type, targetOrderTypeValue)) {
            updates.order_type = targetOrderTypeValue
        }

        if (selectProjectMap.has(uid)) {
            const targetSelectProjectValue = selectProjectMap.get(uid)
            if (!valuesAreEqual('select_project', process.select_project, targetSelectProjectValue)) {
                updates.select_project = targetSelectProjectValue
            }
        }

        if (orderQuantityMap.has(uid)) {
            const targetOrderQuantityValue = orderQuantityMap.get(uid)
            if (!valuesAreEqual('order_num', process.order_num, targetOrderQuantityValue)) {
                updates.order_num = targetOrderQuantityValue
            }
        }

        const visionAssignments = visionTypeMap.get(uid)
        if (visionAssignments) {
            if (
                visionAssignments.normal !== null &&
                !valuesAreEqual('vision_type', process.vision_type, visionAssignments.normal)
            ) {
                updates.vision_type = visionAssignments.normal
            }
            if (
                visionAssignments.jd !== null &&
                !valuesAreEqual('jd_vision_type', process.jd_vision_type, visionAssignments.jd)
            ) {
                updates.jd_vision_type = visionAssignments.jd
            }
        }

        const operatorAssignments = hotPlanOperatorMap.get(uid)
        if (operatorAssignments) {
            if (
                operatorAssignments.normal !== null &&
                !valuesAreEqual('operator', process.operator, operatorAssignments.normal)
            ) {
                updates.operator = operatorAssignments.normal
            }
            if (
                operatorAssignments.jd !== null &&
                !valuesAreEqual('jd_operator', process.jd_operator, operatorAssignments.jd)
            ) {
                updates.jd_operator = operatorAssignments.jd
            }
        }

        const shelfGoodsAssignments = shelfGoodsAssignmentsMap.get(uid)
        if (shelfGoodsAssignments) {
            for (const [column, value] of Object.entries(shelfGoodsAssignments)) {
                if (!valuesAreEqual(column, process[column], value)) {
                    updates[column] = value
                }
            }
        }

        const processStatusValue = processStatusMap.get(uid)
        if (
            processStatusValue !== undefined &&
            processStatusValue !== null &&
            !valuesAreEqual('process_status', process.process_status, processStatusValue)
        ) {
            updates.process_status = processStatusValue
        }

        if (Object.keys(updates).length) {
            await developmentProcessesRepo.updateFieldsByUid(uid, updates)
        }
    }
}
const syncDevelopmentProcessRunningNodes = async () => {
    const runningTaskRows = await processesRepo.getRunningDevelopmentProcessTasks()
    const runningNodeMap = new Map()

    for (const row of runningTaskRows || []) {
        const uid = row?.uid
        const processId = row?.process_id

        if (!uid || !processId) continue

        if (!runningNodeMap.has(uid)) {
            runningNodeMap.set(uid, new Map())
        }

        const processMap = runningNodeMap.get(uid)

        if (!processMap.has(processId)) {
            processMap.set(processId, {
                title: row.process_title,
                tasks: new Map()
            })
        }

        const processEntry = processMap.get(processId)

        if (!processEntry.tasks.has(row.pt_task_id)) {
            processEntry.tasks.set(row.pt_task_id, {
                content: row.pt_content,
                username: row.task_username
            })
        }
    }

    const existingProcesses = await developmentProcessesRepo.getAllUids()
    const existingRunningNodes = new Map(
        (existingProcesses || []).map((item) => [item.uid, item.running_node])
    )

    const updatedUids = new Set()

    for (const [uid, processMap] of runningNodeMap.entries()) {
        const segments = []

        for (const { title, tasks } of processMap.values()) {
            const taskSegments = Array.from(tasks.values()).map((task) =>
                `${task.content}-${task.username}`
            )
            segments.push(`${title}:${taskSegments.join(',')}`)
        }

        const runningNodeValue = segments.join(';') || null
        updatedUids.add(uid)

        if (existingRunningNodes.get(uid) !== runningNodeValue) {
            await developmentProcessesRepo.updateColumnByUid(uid, 'running_node', runningNodeValue)
        }
    }

    for (const process of existingProcesses || []) {
        if (!updatedUids.has(process.uid) && process.running_node !== null) {
            await developmentProcessesRepo.updateColumnByUid(process.uid, 'running_node', null)
        }
    }
}

module.exports = {
    getLatestModifiedProcess,
    saveProcess,
    correctStrFieldToJson,
    getProcurementProcessStatistics,
    getProcessIdsData,
    getProcessIdsTmpData,
    getProcessMergeIdsData,
    getProcessByProcessInstanceId,
    getDevelopmentProcessTotal,
    getDevelopmentProcessList,
    createDevelopmentProcess,
    updateDevelopmetProcess,
    getById,
    syncDevelopmentProcessFormFields,
    syncDevelopmentProcessRunningNodes
}
