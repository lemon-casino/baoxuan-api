const { query } = require('../../model/dbConn')
const divisionInfoRepo = {}

divisionInfoRepo.getInfo = async () => {
    const sql = `SELECT * FROM division_info`
    const result = await query(sql)
    return result || []
}

divisionInfoRepo.getShopNameById = async (id) => {
    const sql = `SELECT si.shop_name, di.division_name AS name, si.has_promotion  
        FROM division_info di JOIN project_info pi ON di.id = pi.division_id 
        JOIN shop_info si ON pi.id = si.project_id 
        WHERE di.id = ?`
    const result = await query(sql, [id])
    return result || []
}

divisionInfoRepo.getShopNameByName = async (name) => {
    const sql = `SELECT si.shop_name, pi.project_name AS name, si.has_promotion 
        FROM division_info di JOIN project_info pi ON di.id = pi.division_id 
        JOIN shop_info si ON pi.id = si.project_id 
        WHERE di.division_name = ? 
            ORDER BY pi.project_name `
    const result = await query(sql, name)
    return result || []
}

divisionInfoRepo.getUsersById = async (id) => {
    const sql = `SELECT * FROM (
        SELECT u.nickname, u.user_id, u.dingding_user_id FROM division_info di 
        JOIN project_info pi ON pi.division_id = di.id
        JOIN shop_info si ON si.project_id = pi.id
        LEFT JOIN user_operation uo ON uo.type = 3 AND uo.detail_id = si.id
        JOIN users u ON u.user_id = uo.user_id WHERE di.id = ? 
        UNION ALL
        SELECT u.nickname, u.user_id, u.dingding_user_id FROM division_info di 
        JOIN project_info pi ON pi.division_id = di.id
        JOIN team_info ti ON ti.project_id = pi.id
        JOIN team_member tm ON tm.team_id = ti.id
        JOIN users u ON u.user_id = tm.user_id WHERE di.id = ?) aa
        GROUP BY nickname, user_id, dingding_user_id`
    const result = await query(sql, [id, id])
    return result || []
}

module.exports = divisionInfoRepo