const { query } = require('../../model/dbConn')
const projectManagementRepo = {}

projectManagementRepo.getById = async (id) => {
    let sql = `SELECT * FROM develop_project_management WHERE id = ?`
    const result = await query(sql, [id])
    return result
}

projectManagementRepo.getByGoodsName = async (goods_name) => {
    let sql = `SELECT * FROM develop_project_management WHERE goods_name = ?`
    const result = await query(sql, [goods_name])
    return result?.length ? result[0] : {}
}

projectManagementRepo.get = async (limit, offset, params) => {
    let data = [], total = 0, subsql = 'WHERE 1=1'
    for (let i = 0; i < params.length; i++) {
        if (params[i].value !== undefined) {
            if (params[i].type == 'input') {
                if (params[i].field_id == 'exploit_director') {
                    subsql = `${subsql} AND EXISTS(
                        SELECT id FROM users WHERE nickname LIKE '%${params[i].value}%'
                            AND users.user_id = exploit_director)`
                } else 
                    subsql = `${subsql} AND \`${params[i].field_id}\` LIKE '%${params[i].value}%'`
            } else if (['select', 'date'].includes(params[i].type)) {
                subsql = `${subsql} AND \`${params[i].field_id}\` = '${params[i].value}'`
            }
        }
    }
    let sql = `SELECT COUNT(1) AS count FROM develop_project_management ${subsql}`
    let row = await query(sql)
    if (row?.length && row[0].count) {
        total = row[0].count
        sql = `SELECT *, (
                SELECT nickname FROM users WHERE user_id = exploit_director LIMIT 1
            ) AS exploit_director FROM develop_project_management ${subsql} 
            ORDER BY id DESC LIMIT ${offset}, ${limit}`
        row = await query(sql, [limit, offset])
        if (row?.length) data = row
    }
    return {data, total}
}

projectManagementRepo.insert = async (data) => {
    let sql = `INSERT INTO develop_project_management(
            exploit_director, 
            \`status\`, 
            first_category, 
            second_category,
            third_category,
            type,
            goods_name,
            seasons,
            patent_belongs,
            patent_type,
            related,
            schedule_time,
            design_type,
            analyse_link,
            sale_purpose,
            exploitation_features,
            core_reasons,
            schedule_arrived_time,
            schedule_confirm_time,
            product_info,
            brief_product_line,
            product_img,
            remark,
            update_time) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())`
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

projectManagementRepo.update = async (data) => {
    let sql = `UPDATE develop_project_management SET first_category = ?, 
        second_category = ?, third_category = ?, type = ?, goods_name = ?, 
        seasons = ?, patent_belongs = ?, patent_type = ?, related = ?, 
        schedule_time = ?, design_type = ?, analyse_link = ?, sale_purpose = ?, 
        exploitation_features = ?, core_reasons = ?, schedule_arrived_time = ?, 
        schedule_confirm_time = ?, product_info = ?, brief_product_line = ?, 
        product_img = ?, remark = ?, project_status = ?, update_time = NOW() WHERE id = ?`
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

projectManagementRepo.updateStatus = async (id, status) => {
    let sql = `UPDATE develop_project_management SET \`status\` = ?, 
        update_time = NOW() WHERE id = ?`
    const result = await query(sql, [status, id])
    return result?.affectedRows ? true : false
}

projectManagementRepo.updateProjectStatus = async (id, status) => {
    let sql = `UPDATE develop_project_management SET project_status = ?, 
        update_time = NOW() WHERE id = ?`
    const result = await query(sql, [status, id])
    return result?.affectedRows ? true : false
}

projectManagementRepo.updateLink = async (id, link) => {
    let sql = `UPDATE develop_project_management SET link = ?, 
        update_time = NOW() WHERE id = ?`
    const result = await query(sql, [link, id])
    return result?.affectedRows ? true : false
}

module.exports = projectManagementRepo