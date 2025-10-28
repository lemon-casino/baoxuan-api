const { query } = require('../../model/dbConn')
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

module.exports = developmentProcessesRepo
