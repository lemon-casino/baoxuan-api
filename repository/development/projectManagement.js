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

projectManagementRepo.get = async (limit, offset) => {
    let data = [], total = 0
    let sql = `SELECT COUNT(1) AS count FROM develop_project_management`
    let row = await query(sql)
    if (row?.length && row[0].count) {
        total = row[0].count
        sql = `SELECT *, (
                SELECT nickname FROM users WHERE user_id = exploit_director LIMIT 1
            ) AS exploit_director FROM develop_project_management 
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
            analyse_link,
            sale_purpose,
            exploitation_features,
            core_reasons,
            product_img,
            remark,
            update_time) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())`
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

projectManagementRepo.update = async (data) => {
    let sql = `UPDATE develop_project_management SET first_category = ?, 
        second_category = ?, third_category = ?, type = ?, goods_name = ?, 
        seasons = ?, patent_belongs = ?, patent_type = ?, related = ?, 
        schedule_time = ?, analyse_link = ?, sale_purpose = ?, 
        exploitation_features = ?, core_reasons = ?, product_img = ?, remark = ?, 
        update_time = NOW() WHERE id = ?`
    const result = await query(sql, data)
    return result?.affectedRows ? true : false
}

projectManagementRepo.updateStatus = async (id, status) => {
    let sql = `UPDATE develop_project_management SET \`status\` = ?, 
        update_time = NOW() WHERE id = ?`
    const result = await query(sql, [status, id])
    return result?.affectedRows ? true : false
}

module.exports = projectManagementRepo