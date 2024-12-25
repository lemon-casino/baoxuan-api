const { query } = require('../../model/dbConn')
const teamInfoRepo = {}

teamInfoRepo.getInfo = async () => {
    const sql = `SELECT tm.team_id, ti.team_name, (
            SELECT nickname FROM users WHERE ti.user_id = users.user_id
        ) AS director_name, (
            SELECT nickname FROM users WHERE ti.leader = users.user_id
        ) AS leader_name, (
            SELECT nickname FROM users WHERE tm.user_id = users.user_id
        ) AS user_name FROM team_info ti 
        LEFT JOIN team_member tm ON ti.id = tm.team_id 
            ORDER BY tm.team_id, tm.user_id`
    const result = await query(sql)
    return result || []
}

teamInfoRepo.getUserNameByTeamId = async (id) => {
    const sql = `SELECT u.nickname, (
            SELECT ti.team_name FROM team_info ti WHERE ti.id = tm.team_id LIMIT 1
        ) AS name FROM team_member tm
        JOIN users u ON u.user_id = tm.user_id AND u.is_resign = 0 
        WHERE tm.team_id = ?`
    const result = await query(sql, id)
    return result || []
}

teamInfoRepo.getUserNameByTeamName = async (name) => {
    const sql = `SELECT u.nickname, u.nickname AS name FROM team_member tm 
        JOIN team_info ti ON ti.id = tm.team_id 
        JOIN users u ON u.user_id = tm.user_id AND u.is_resign = 0 
        WHERE ti.team_name = ?`
    const result = await query(sql, name)
    return result || []
}

teamInfoRepo.getUserNameByProjectName = async (name) => {
    const sql = `SELECT u.nickname, ti.team_name AS name FROM team_member tm
        JOIN users u ON u.user_id = tm.user_id AND u.is_resign = 0 
        JOIN team_info ti ON ti.id = tm.team_id
        JOIN project_info pi ON pi.id = ti.project_id 
        WHERE pi.project_name = ?
            ORDER BY tm.team_id`
    const result = await query(sql, name)
    return result || []
}

teamInfoRepo.getUsersById = async (id) => {
    const sql = `SELECT u.nickname, u.user_id, u.dingding_user_id FROM team_info ti 
        JOIN team_member tm ON tm.team_id = ti.id
        JOIN users u ON u.user_id = tm.user_id WHERE ti.id = ? AND u.is_resign = 0 
        GROUP BY nickname, user_id, dingding_user_id`
    const result = await query(sql, [id])
    return result || []
}

teamInfoRepo.getUserByTeamName = async (name) => {
    const sql = `SELECT u.nickname AS name, 5 AS type, u.user_id AS detail_id 
        FROM team_info ti JOIN team_member tm ON tm.team_id = ti.id
        JOIN users u ON u.user_id = tm.user_id WHERE ti.team_name = ?`
    const result = await query(sql, [name])
    return result || []
}

module.exports = teamInfoRepo