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
            is_self, \`status\`, jd_status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    const result = await query(sql, data)
    return result?.affectedRows ? true:false
}

developmentProcessesRepo.getRunningProcess = async () => {
    const sql = `SELECT * FROM development_process WHERE \`status\` != '结束' OR jd_status != '结束'`
    const result = await query(sql)
    return result || []
}

developmentProcessesRepo.getAllForFieldSync = async () => {
    const sql = `SELECT uid, jd_is_select, first_select, second_select, third_select, categories, seasons,
            related, brief_name, purchase_type, supplier, supplier_type, product_info, product_type,
            sale_purpose, analysis, analysis_name, project_type, design_type, exploitation_features, core_reasons,
            schedule_arrived_time, schedule_confirm_time, is_self, spu, order_type, select_project, order_num,
            vision_type, jd_vision_type, operator, jd_operator
        FROM development_process`
    const result = await query(sql)
    return result || []
}

developmentProcessesRepo.updateColumnByUid = async (uid, column, value) => {
    const sql = `UPDATE development_process SET \`${column}\` = ? WHERE uid = ?`
    const result = await query(sql, [value, uid])
    return result?.affectedRows ? true:false
}

developmentProcessesRepo.updateFieldsByUid = async (uid, fields) => {
    if (!uid || !fields || typeof fields !== 'object') return false
    const columns = Object.keys(fields).filter((column) => column)
    if (!columns.length) return false
    const assignments = columns.map((column) => `\`${column}\` = ?`).join(', ')
    const values = columns.map((column) => fields[column])
    values.push(uid)
    const sql = `UPDATE development_process SET ${assignments} WHERE uid = ?`
    const result = await query(sql, values)
    return result?.affectedRows ? true:false
}

developmentProcessesRepo.updateStatusToFinishByUid = async (uid) => {
    const sql = `UPDATE development_process SET \`status\` = '结束', running_node = NULL WHERE uid = ?`
    const result = await query(sql, [uid])
    return result?.affectedRows ? true:false
}

developmentProcessesRepo.updateJDStatusToFinishByUid = async (uid) => {
    const sql = `UPDATE development_process SET jd_status = '结束', jd_running_node = NULL WHERE uid = ?`
    const result = await query(sql, [uid])
    return result?.affectedRows ? true:false
}

developmentProcessesRepo.getById = async (id) => {
    const sql = `SELECT * FROM development_process WHERE uid = ?`
    const result = await query(sql, [id])
    return result
}

module.exports = developmentProcessesRepo
