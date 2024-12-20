const { query } = require('../../model/dbConn')
const projectInfoRepo = {}

projectInfoRepo.getInfo = async () => {
    const sql = `SELECT * FROM project_info`
    const result = await query(sql)
    return result || []
}

projectInfoRepo.getShopNameById = async (id) => {
    const sql = `SELECT si.shop_name, pi.project_name AS name, si.has_promotion 
        FROM project_info pi LEFT JOIN shop_info si ON pi.id = si.project_id 
        WHERE pi.id = ?`
    const result = await query(sql, id)
    return result || []
}

projectInfoRepo.getShopNameByName = async (name) => {
    const sql = `SELECT si.shop_name, si.shop_name AS name, si.has_promotion 
        FROM project_info pi LEFT JOIN shop_info si ON pi.id = si.project_id 
        WHERE pi.project_name = ?`
    const result = await query(sql, name)
    return result || []
}

projectInfoRepo.getUsersById = async (id) => {
    const sql = `SELECT * FROM (
        SELECT u.nickname, u.user_id, u.dingding_user_id FROM project_info pi 
        JOIN shop_info si ON si.project_id = pi.id
        LEFT JOIN user_operation uo ON uo.type = 3 AND uo.detail_id = si.id
        JOIN users u ON u.user_id = uo.user_id WHERE pi.id = ? 
        UNION ALL
        SELECT u.nickname, u.user_id, u.dingding_user_id FROM project_info pi 
        JOIN team_info ti ON ti.project_id = pi.id
        JOIN team_member tm ON tm.team_id = ti.id
        JOIN users u ON u.user_id = tm.user_id WHERE pi.id = ?) aa
        GROUP BY nickname, user_id, dingding_user_id`
    const result = await query(sql, [id, id])
    return result || []
}

module.exports = projectInfoRepo