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
        LEFT JOIN user_operation uo ON uo.type = 2 AND uo.detail_id = pi.id
        JOIN users u ON u.user_id = uo.user_id WHERE pi.id = ? AND u.is_resign = 0 
        UNION ALL
        SELECT u.nickname, u.user_id, u.dingding_user_id FROM project_info pi 
        JOIN shop_info si ON si.project_id = pi.id
        LEFT JOIN user_operation uo ON uo.type = 3 AND uo.detail_id = si.id
        JOIN users u ON u.user_id = uo.user_id WHERE pi.id = ? AND u.is_resign = 0 
        UNION ALL
        SELECT u.nickname, u.user_id, u.dingding_user_id FROM project_info pi 
        JOIN team_info ti ON ti.project_id = pi.id
        JOIN team_member tm ON tm.team_id = ti.id
        JOIN users u ON u.user_id = tm.user_id WHERE pi.id = ? AND u.is_resign = 0) aa
        GROUP BY nickname, user_id, dingding_user_id`
    const result = await query(sql, [id, id, id])
    return result || []
}

projectInfoRepo.getTeamByProjectName = async (name) => {
    const sql = `SELECT ti.team_name AS name, 4 AS type, 
        ti.id AS detail_id FROM project_info pi JOIN team_info ti 
        ON ti.project_id = pi.id WHERE pi.project_name = ?`
    const result = await query(sql, [name])
    return result || []
}

projectInfoRepo.getUserByProjectName = async (name) => {
    const sql = `SELECT *, 5 AS type FROM (
            SELECT u.nickname AS name, u.user_id AS detail_id 
            FROM project_info pi JOIN user_operation uo ON uo.detail_id = pi.id 
                AND uo.type = 2 JOIN users u ON u.user_id = uo.user_id 
            WHERE pi.project_name = ? 
            UNION ALL 
            SELECT u.nickname AS name, u.user_id AS detail_id 
            FROM project_info pi JOIN shop_info si ON si.project_id = pi.id 
            JOIN user_operation uo ON uo.detail_id = si.id AND uo.type = 3 
            JOIN users u ON u.user_id = uo.user_id WHERE pi.project_name = ?) aa
        GROUP BY name, detail_id`
    const result = await query(sql, [name, name])
    return result || []
}

module.exports = projectInfoRepo