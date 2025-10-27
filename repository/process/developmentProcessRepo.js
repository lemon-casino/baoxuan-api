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
    return result?.affectedRows ? true:false
}

module.exports = developmentProcessesRepo