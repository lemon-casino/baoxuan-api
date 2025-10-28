const { query } = require('../../model/dbConn')
const processConst = require('../../const/processConst')

const developmentProcessesRepo = {}

developmentProcessesRepo.getByUid = async (uid) => {
    const sql = `SELECT DATE_FORMAT(create_time, '%Y-%m-%d') AS \`date\`, sort, name, spu, sku_code,
            type, image, developer, starter, \`status\`, is_select, jd_status, jd_is_select, first_select,
            second_select, third_select, order_type, vision_type, jd_vision_type, select_project,
            order_num, jd_order_num, operator, jd_operator, running_node, jd_running_node, first_goods_id,
            second_goods_id, third_goods_id FROM development_process WHERE uid = ?`
    const result = await query(sql, [uid])
    return result
}

developmentProcessesRepo.insert = async (data) => {
    const sql = `INSERT INTO development_process(uid, starter, dept, type, name, categories, seasons,
            related, image, brief_name, purchase_type, supplier, supplier_type, product_info, product_type,
            patent_belongs, patent_type, sale_purpose, analysis, develop_type, analysis_name, project_type,
            design_type, exploitation_features, core_reasons, schedule_arrived_time, schedule_confirm_time,
            is_self, \`status\`) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

developmentProcessesRepo.countByType = async (startDate, endDate) => {
    let sql = `SELECT type, COUNT(*) AS count FROM development_process WHERE type IN (?,?,?,?)`
    const params = ['供应商推品', '反推推品', 'IP推品', '自研推品']

    const startTime = startDate
        ? (startDate.includes(' ') ? startDate : `${startDate} 00:00:00`)
        : null
    const endTime = endDate
        ? (endDate.includes(' ') ? endDate : `${endDate} 23:59:59`)
        : null

    if (startTime) {
        sql += ' AND create_time >= ?'
        params.push(startTime)
    }

    if (endTime) {
        sql += ' AND create_time <= ?'
        params.push(endTime)
    }

    sql += ' GROUP BY type'

    return await query(sql, params)
}

developmentProcessesRepo.countByTypeWithStatus = async (statusList) => {
    if (!statusList || statusList.length === 0) {
        return []
    }

    const placeholders = statusList.map(() => '?').join(',')
    const sql = `SELECT dp.type, COUNT(DISTINCT dp.uid) AS count
        FROM development_process dp
        JOIN process_info pi ON pi.field = 'Fk0lmgyqg4d4abc' AND pi.content = dp.uid
        JOIN processes p ON p.process_id = pi.process_id
        WHERE dp.type IN (?,?,?,?) AND p.status IN (${placeholders})
        GROUP BY dp.type`
    const params = ['供应商推品', '反推推品', 'IP推品', '自研推品', ...statusList]
    return await query(sql, params)
}

const formatDateTime = (value, isEnd) => {
    if (!value) {
        return null
    }

    if (value.includes(' ')) {
        return value
    }

    return isEnd ? `${value} 23:59:59` : `${value} 00:00:00`
}

developmentProcessesRepo.countOperatorInquiryStats = async ({ startDate, endDate, statusFilter } = {}) => {
    const startTime = formatDateTime(startDate, false)
    const endTime = formatDateTime(endDate, true)

    const params = [
        processConst.analysisProcess.resultContents.FOUND,
        processConst.analysisProcess.resultContents.NOT_FOUND,
        processConst.analysisProcess.fieldMappings.uid,
        ...processConst.analysisProcess.resultTitles,
        processConst.typeList.OPERATOR,
        processConst.analysisProcess.key,
    ]

    let statusCondition = ''

    if (Array.isArray(statusFilter) && statusFilter.length > 0) {
        statusCondition = ` AND p.status IN (${statusFilter.map(() => '?').join(',')})`
        params.push(...statusFilter)
    }

    let dateFilter = ''

    if (startTime) {
        dateFilter += ' AND dp.create_time >= ?'
        params.push(startTime)
    }

    if (endTime) {
        dateFilter += ' AND dp.create_time <= ?'
        params.push(endTime)
    }

    const sql = `
        SELECT
            SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS running,
            SUM(CASE WHEN status = 2 AND has_found = 1 THEN 1 ELSE 0 END) AS success,
            SUM(CASE WHEN status IN (2,3,4) AND has_not_found = 1 AND has_found = 0 THEN 1 ELSE 0 END) AS fail
        FROM (
            SELECT
                dp.uid,
                p.status,
                MAX(CASE WHEN pi_status.content = ? THEN 1 ELSE 0 END) AS has_found,
                MAX(CASE WHEN pi_status.content = ? THEN 1 ELSE 0 END) AS has_not_found
            FROM development_process dp
            JOIN process_info pi_uid ON pi_uid.field = ? AND pi_uid.content = dp.uid
            JOIN processes p ON p.process_id = pi_uid.process_id
            LEFT JOIN process_info pi_status ON pi_status.process_id = p.process_id
                AND pi_status.title IN (?,?,?,?)
            WHERE dp.type = ?
                AND p.process_code = ?
                ${statusCondition}
                ${dateFilter}
            GROUP BY dp.uid, p.status
        ) AS stats
    `

    const result = await query(sql, params)

    const row = result && result[0]

    return {
        running: Number(row?.running) || 0,
        success: Number(row?.success) || 0,
        fail: Number(row?.fail) || 0
    }
}

developmentProcessesRepo.countDailyInquiryStats = async ({ startDate, endDate, statusFilter } = {}) => {
    const codes = processConst.dailyInquiryProcessCodes || []

    if (!codes.length) {
        return {
            running: 0,
            finish: 0
        }
    }

    const placeholders = codes.map(() => '?').join(',')
    const params = [...codes]

    const startTime = formatDateTime(startDate, false)
    const endTime = formatDateTime(endDate, true)

    let statusCondition = ''

    if (Array.isArray(statusFilter) && statusFilter.length > 0) {
        statusCondition = ` AND p.status IN (${statusFilter.map(() => '?').join(',')})`
        params.push(...statusFilter)
    }

    let dateFilter = ''

    if (startTime) {
        dateFilter += ' AND p.start_time >= ?'
        params.push(startTime)
    }

    if (endTime) {
        dateFilter += ' AND p.start_time <= ?'
        params.push(endTime)
    }

    const sql = `
        SELECT
            SUM(CASE WHEN p.status = 1 THEN 1 ELSE 0 END) AS running,
            SUM(CASE WHEN p.status = 2 THEN 1 ELSE 0 END) AS finish
        FROM processes p
        WHERE p.process_code IN (${placeholders})
            ${statusCondition}
            ${dateFilter}
    `

    const result = await query(sql, params)
    const row = result && result[0]

    return {
        running: Number(row?.running) || 0,
        finish: Number(row?.finish) || 0
    }
}

module.exports = developmentProcessesRepo
